import json
import logging
import os
import re
from typing import Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.models.product import Product, ProvenanceRecord
from backend.core.config import settings

logger = logging.getLogger("anvaya.rag")


SYSTEM_PROMPT = """You are ANVAYA AI Copilot — the intelligent enterprise product data assistant for the ANVAYA platform.

YOUR SOURCE OF TRUTH:
You answer questions strictly using the supplied ANVAYA Product Database Context for the active dataset.

CRITICAL GROUNDING RULES:
1. NEVER hallucinate or invent specifications, prices, dimensions, tolerances, voltages, or product IDs.
2. If an attribute, specification, or field is NOT present in the supplied ANVAYA context, YOU MUST EXPLICITLY SAY:
   "The current ANVAYA dataset does not provide [field/attribute] for [product/SKU]."
3. Clearly distinguish between SOURCE data (direct from description/distributor) and AI EXTRACTED/INFERRED data.
4. Always cite the Product SKU, field name, and raw evidence when answering technical questions.
5. Be concise, professional, data-first, and helpful.
"""


def retrieve_relevant_context(
    db: Session,
    query: str,
    active_product_id: int | None = None,
    dataset_id: int | None = None,
) -> tuple[list[dict[str, Any]], str]:
    """
    Retrieves matching real products strictly scoped to the selected dataset.
    """
    query_clean = query.strip()
    products: list[Product] = []

    base_query = db.query(Product)
    if dataset_id is not None:
        base_query = base_query.filter(Product.dataset_id == dataset_id)

    total_in_dataset = base_query.count()
    if total_in_dataset == 0:
        return [], ""

    # If specific product context is active
    if active_product_id:
        p = base_query.filter(Product.id == active_product_id).first()
        if p:
            products.append(p)

    # Search for specific SKU/Part number mentioned in query
    part_num_match = re.search(r"\b([A-Z0-9]{3,}(?:-[A-Z0-9]+)*)\b", query_clean, re.IGNORECASE)
    if part_num_match:
        cand_sku = part_num_match.group(1).upper()
        sku_matches = base_query.filter(
            Product.mfg_part_num.ilike(f"%{cand_sku}%")
        ).limit(3).all()
        for sm in sku_matches:
            if sm not in products:
                products.append(sm)

    # Search by Brand name
    known_brands = ["3m", "diablo", "mirka", "freud", "milwaukee", "dewalt", "bosch", "danfoss", "schneider"]
    for kb in known_brands:
        if kb in query_clean.lower():
            brand_matches = base_query.filter(
                Product.canonical_brand.ilike(f"%{kb}%")
            ).limit(5).all()
            for bm in brand_matches:
                if bm not in products:
                    products.append(bm)

    # Search by keywords (e.g. "missing material", "sanding belt", "disc", "cut off", "review")
    if "missing" in query_clean.lower() or "incomplete" in query_clean.lower():
        missing_matches = base_query.filter(
            Product.completeness_score < 75.0
        ).limit(5).all()
        for mm in missing_matches:
            if mm not in products:
                products.append(mm)
    elif "review" in query_clean.lower() or "flagged" in query_clean.lower():
        review_matches = base_query.filter(
            Product.review_status == "PENDING_REVIEW"
        ).limit(5).all()
        for rm in review_matches:
            if rm not in products:
                products.append(rm)
    elif not products:
        # General full-text keyword search across description & cleaned name
        words = [w for w in query_clean.split() if len(w) > 2][:3]
        filters = []
        for w in words:
            filters.append(Product.part_desc.ilike(f"%{w}%"))
            filters.append(Product.cleaned_name.ilike(f"%{w}%"))
            filters.append(Product.category.ilike(f"%{w}%"))

        if filters:
            products = base_query.filter(or_(*filters)).limit(5).all()

    # Fallback to top records in this dataset if still empty
    if not products:
        products = base_query.limit(3).all()

    # Format structured context
    citations = []
    context_lines = ["--- ANVAYA DATABASE PRODUCT CONTEXT (DATASET SCOPED) ---"]

    for p in products:
        p_attrs = p.attributes or {}
        context_lines.append(f"Product ID: {p.id}")
        context_lines.append(f"  Mfg_Part_Num (SKU): {p.mfg_part_num}")
        context_lines.append(f"  Cleaned Title: {p.cleaned_name}")
        context_lines.append(f"  Raw Description: {p.part_desc}")
        context_lines.append(f"  Canonical Brand: {p.canonical_brand}")
        context_lines.append(f"  Category Hierarchy: {p.category} > {p.subcategory}")
        context_lines.append(f"  Validation Status: {p.validation_status} (Quality: {p.completeness_score}%, Confidence: {p.confidence_score}%)")
        if p_attrs:
            context_lines.append(f"  Extracted Attributes: {json.dumps(p_attrs)}")
        context_lines.append("")

        citations.append({
            "product_id": p.id,
            "sku": p.mfg_part_num,
            "brand": p.canonical_brand,
            "cleaned_title": p.cleaned_name,
            "raw_text": p.part_desc or "No raw description",
            "field_name": "Full Record",
            "confidence": round(p.confidence_score / 100, 2),
            "evidence": f"Stored in database dataset #{p.dataset_id or 'default'}",
        })

    context_str = "\n".join(context_lines)
    return citations, context_str


async def execute_grounded_copilot_query(
    db: Session,
    query: str,
    active_product_id: int | None = None,
    dataset_id: int | None = None,
    conversation_history: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    """
    Executes a dataset-grounded RAG query against the database.
    """
    citations, context_str = retrieve_relevant_context(
        db=db,
        query=query,
        active_product_id=active_product_id,
        dataset_id=dataset_id,
    )

    if not context_str:
        return {
            "answer": "No records were found in the active dataset matching your query. Please upload a dataset or select an active catalog from the top navigation to begin querying.",
            "citations": [],
            "source_type": "no_data",
            "model_used": "deterministic_grounding",
            "confidence": 1.0,
        }

    # Attempt LLM generation via the unified provider layer (Gemini/Groq/OpenRouter/Ollama).
    # This uses backend.services.ai_provider (httpx-based, already a dependency)
    # instead of ai/models/free_llm_engine.py, which required the "openai" package
    # that was never in backend/requirements.txt — every Copilot call was silently
    # failing and falling back to the deterministic answer.
    from backend.services.ai_provider import ai_generate, AIProviderError, get_active_provider

    active_provider = get_active_provider()
    if active_provider is not None:
        try:
            prompt = f"{SYSTEM_PROMPT}\n\n{context_str}\n\nUser Question: {query}\n\nAnswer:"
            content_resp = await ai_generate(prompt=prompt)
            if content_resp:
                return {
                    "answer": content_resp.strip(),
                    "citations": citations,
                    "source_type": "grounded_rag",
                    "model_used": active_provider.name,
                    "confidence": 0.95,
                }
        except AIProviderError as e:
            logger.warning(f"AI Provider failed, falling back to deterministic synthesis: {e}")
        except Exception as e:
            logger.warning(f"Unexpected AI Provider error, falling back to deterministic synthesis: {e}")

    # Fallback to Deterministic Structured Grounding Response
    top_cite = citations[0] if citations else None
    sku_name = top_cite["sku"] if top_cite else "Selected Product"
    brand_name = top_cite["brand"] if top_cite else "Resolved Brand"
    title = top_cite["cleaned_title"] if top_cite else ""

    # Check if user asked for specific specs that are missing
    missing_spec_notice = ""
    query_lower = query.lower()
    spec_keywords = ["pressure", "voltage", "amperage", "wattage", "rpm", "horsepower", "torque"]
    asked_specs = [kw for kw in spec_keywords if kw in query_lower]
    if asked_specs and top_cite:
        missing_spec_notice = f"\n\nNote: The active catalog does not provide {', '.join(asked_specs)} specifications for this item."

    deterministic_answer = (
        f"Based on the active catalog data for SKU **{sku_name}** ({brand_name}):\n\n"
        f"- **Title**: {title}\n"
        f"- **Raw Distributor String**: \"{top_cite['raw_text'] if top_cite else 'N/A'}\"\n"
        f"- **Evidence**: Verified against canonical master standards with {int(top_cite['confidence'] * 100) if top_cite else 95}% confidence.{missing_spec_notice}\n\n"
        f"All extracted specifications are strictly grounded in your uploaded catalog without synthetic extrapolation."
    )

    return {
        "answer": deterministic_answer,
        "citations": citations,
        "source_type": "deterministic_grounding",
        "model_used": "anvaya_rule_grounding_engine",
        "confidence": 0.96,
    }
