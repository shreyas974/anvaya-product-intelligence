"""
description_generator.py -- Description Generator for Anvaya Enrichment Pipeline

WHAT: Generates formatted product descriptions (SHORT_DESC, LONG_DESC1, RETAIL_DESC, MOBILE_DESC)
      from cleaned brand, manufacturer, part numbers, and extracted attributes.

WHY:  E-commerce and distributor channels require standardized description formats:
      - SHORT_DESC: Brand + Series/Product + Part# + Key Specs (~150 chars)
      - LONG_DESC1: Detailed specification string with UOM values
      - RETAIL_DESC: Customer-facing product title
      - MOBILE_DESC: Comma-separated mobile summary string

HOW:  Uses structured templating rules with optional 100% Free LLM enrichment
      (Google Gemini, Groq, OpenRouter, Ollama, Kimi) for rich marketing copy.
"""

from dataclasses import dataclass
from typing import Optional, List, Mapping, Any
import pandas as pd


@dataclass
class GeneratedDescriptions:
    """Container for all generated product descriptions."""
    short_desc: str
    long_desc1: str
    retail_desc: str
    mobile_desc: str
    marketing_description: str = ""
    item_features: Optional[List[str]] = None
    application: str = ""
    confidence: float = 0.85
    rule: str = "templated_generator"


def _clean_str(val: Any) -> str:
    """Return stripped string if valid non-empty string, else empty string."""
    if val is None or pd.isna(val):
        return ""
    s = str(val).strip()
    return "" if s.lower() == "nan" else s


class DescriptionGenerator:
    """
    Generates standardized commercial and technical product descriptions,
    supporting both local deterministic templates and multi-provider Free LLMs
    (Gemini, Groq, OpenRouter, Ollama, Kimi).
    """

    def __init__(
        self,
        use_llm: bool = False,
        provider: str = "auto",
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        use_kimi: bool = False,  # Backward compatibility
        kimi_api_key: Optional[str] = None,  # Backward compatibility
    ):
        self.use_llm = use_llm or use_kimi
        self.provider = "kimi" if use_kimi and provider == "auto" else provider
        self._llm_engine = None

        if self.use_llm:
            from ai.models.free_llm_engine import FreeLLMEngine
            effective_key = api_key or kimi_api_key
            self._llm_engine = FreeLLMEngine(
                provider=self.provider,
                api_key=effective_key,
                base_url=base_url,
                model=model,
            )

    def generate(
        self,
        mfg_part_num: Optional[str],
        part_desc: Optional[str],
        brand_name: Optional[str] = None,
        mfg_name: Optional[str] = None,
        product_name: Optional[str] = None,
        dimensions: Optional[str] = None,
        category: Optional[str] = None,
    ) -> GeneratedDescriptions:
        """
        Generate all standard and rich description fields for a product.
        """
        brand = _clean_str(brand_name)
        mfg = _clean_str(mfg_name)
        prod = _clean_str(product_name) or _clean_str(part_desc) or "Product"
        mpn = _clean_str(mfg_part_num)
        raw_dims = _clean_str(dimensions)
        dims = f", {raw_dims}" if raw_dims else ""

        # 1. RETAIL_DESC: Brand + Product Name + Dimensions / Specs
        retail_parts = [p for p in [brand, prod] if p]
        retail_desc = " ".join(retail_parts)
        if dims:
            retail_desc += dims

        # 2. SHORT_DESC: Brand + Product Name + Part# + Specs
        short_parts = [p for p in [brand, prod, mpn] if p]
        short_desc = " ".join(short_parts)
        if dims:
            short_desc += dims

        # 3. MOBILE_DESC: Mfg, Brand, Product, Part#
        mobile_items = [p for p in [mfg, brand, prod, mpn] if p]
        mobile_desc = ", ".join(mobile_items)

        # 4. LONG_DESC1: Detailed specs
        long_desc1 = f"{short_desc}. High performance industrial and commercial grade {prod.lower()} designed for professional applications."

        # 5. Rich Marketing & Features via Free LLM Engine or Local generator
        marketing_desc = ""
        item_features = []
        app_text = ""
        rule_name = "templated_description_generator"

        if self._llm_engine and self._llm_engine.is_available():
            llm_resp = self._llm_engine.enrich_product_content(
                mfg_part_num=mpn,
                part_desc=str(part_desc or ""),
                brand_name=brand,
                mfg_name=mfg,
                category=category,
                extracted_specs={"dimensions": raw_dims, "product_type": prod},
            )
            marketing_desc = llm_resp.marketing_description
            item_features = llm_resp.item_features
            app_text = llm_resp.application
            rule_name = f"free_llm_{llm_resp.provider_used}_{llm_resp.model_used}"
        else:
            marketing_desc = (
                f"The {brand} {mpn} {prod} offers industry-leading reliability, "
                "precision engineering, and rugged construction."
            ).strip()
            item_features = [
                f"Premium {prod} engineered for demanding commercial and industrial environments",
                f"Manufactured to strict quality standards by {brand or mfg or 'manufacturer'}",
                "Optimized for efficiency, durability, and long service life",
            ]
            app_text = "Commercial, industrial, and residential applications."

        return GeneratedDescriptions(
            short_desc=short_desc,
            long_desc1=long_desc1,
            retail_desc=retail_desc,
            mobile_desc=mobile_desc,
            marketing_description=marketing_desc,
            item_features=item_features,
            application=app_text,
            confidence=0.85 if brand and prod else 0.60,
            rule=rule_name,
        )
