import json
import logging
import os
import re
from pathlib import Path
from typing import Any
import pandas as pd
from sqlalchemy.orm import Session

from backend.models.product import Product, ProvenanceRecord, ValidationIssue, ReviewItem, AuditLog
from backend.db.database import SessionLocal, engine, Base

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("anvaya.seeding")

# Known Brand Dictionary for Industrial & Hardware Catalogs
KNOWN_BRANDS = {
    "diablo": "Diablo",
    "3m": "3M",
    "cubitron": "3M Cubitron II",
    "mirka": "Mirka",
    "hiolit": "Mirka Hiolit",
    "abranet": "Mirka Abranet",
    "milwaukee": "Milwaukee",
    "milw": "Milwaukee",
    "dewalt": "DeWalt",
    "bosch": "Bosch",
    "makita": "Makita",
    "freud": "Freud",
    "danfoss": "Danfoss",
    "schneider": "Schneider Electric",
    "siemens": "Siemens",
    "whirlpool": "Whirlpool",
    "frigidaire": "Frigidaire",
    "klein": "Klein Tools",
    "irwin": "Irwin",
    "lenox": "Lenox",
    "norton": "Norton Abrasives",
    "saint-gobain": "Saint-Gobain",
    "dremel": "Dremel",
    "ridgid": "RIDGID",
    "stanley": "Stanley",
    "black & decker": "Black & Decker",
    "craftsman": "Craftsman",
    "festool": "Festool",
}

CATEGORY_KEYWORDS = {
    "Abrasives > Sanding Belts": ["sanding belt", "belt", "sander belt"],
    "Abrasives > Sanding Discs": ["stikit", "disc", "film", "abranet", "hiolit", "hook & loop"],
    "Cutting Tools > Cut-Off Discs": ["cut-off disc", "cut off disc", "cut off", "metal cut", "steel demon"],
    "Cutting Tools > Saw Blades": ["blade", "saw blade", "circular saw", "reciprocating"],
    "Fasteners & Hardware": ["screw", "bolt", "nut", "washer", "anchor", "fastener"],
    "Industrial Valves & Actuators": ["valve", "solenoid", "actuator", "flange", "manifold"],
    "Electrical & Power Controls": ["breaker", "circuit breaker", "relay", "contactor", "mcb", "switch"],
    "Safety & PPE": ["glove", "glasses", "respirator", "mask", "earplug", "helmet"],
    "Hand Tools": ["wrench", "pliers", "screwdriver", "hammer", "cutter", "clamp"],
    "Power Tool Accessories": ["arbor", "mandrel", "chuck", "adapter", "backing pad"],
}


def clean_brand_field(val: str | None) -> str | None:
    if not val or not isinstance(val, str):
        return None
    val = val.strip()
    if val in ["-- Unbranded --", "-- No Unilog Brand --", "-- No DIB Brand --", "nan", "None", ""]:
        return None
    return val


def detect_brand(part_desc: str, part_manuf: str | None, raw_brands: list[str | None]) -> tuple[str, str, float]:
    """
    Returns (canonical_brand, evidence, confidence)
    """
    for rb in raw_brands:
        if rb:
            return rb, f"Direct raw brand field '{rb}'", 1.0

    desc_lower = part_desc.lower() if part_desc else ""
    manuf_lower = part_manuf.lower() if part_manuf else ""

    # Search in description first
    for token, brand_name in KNOWN_BRANDS.items():
        if re.search(rf"\b{re.escape(token)}\b", desc_lower):
            return brand_name, f"Identified in product description '{token}'", 0.95

    # Search in manufacturer name
    for token, brand_name in KNOWN_BRANDS.items():
        if re.search(rf"\b{re.escape(token)}\b", manuf_lower):
            return brand_name, f"Matched manufacturer entity '{token}'", 0.90

    if part_manuf:
        cleaned_mfg = re.sub(r"\s*\([^)]*\)", "", part_manuf).strip()
        if cleaned_mfg:
            return cleaned_mfg, f"Fallback to manufacturer name '{cleaned_mfg}'", 0.70

    return "Generic / Unbranded", "No brand match found in source", 0.40


def classify_product(part_desc: str) -> tuple[str, str, str, float]:
    """
    Returns (category, subcategory, product_type, confidence)
    """
    if not part_desc:
        return "Uncategorized", "General", "Item", 0.30

    desc_lower = part_desc.lower()
    for cat_path, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if re.search(rf"\b{re.escape(kw)}\b", desc_lower):
                parts = cat_path.split(" > ")
                main_cat = parts[0]
                sub_cat = parts[1] if len(parts) > 1 else parts[0]
                return main_cat, sub_cat, kw.title(), 0.92

    return "Industrial & MRO Supplies", "General Hardware", "Component", 0.60


def extract_attributes_and_provenance(part_desc: str) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    """
    Extracts dense specs (Grit, Dimensions, Pack Qty, Material, Tool Type) and provenance evidence.
    """
    attrs: dict[str, Any] = {}
    provenance: list[dict[str, Any]] = []

    if not part_desc:
        return attrs, provenance

    # 1. Grit Extraction (e.g. P80, P120, P150, P180, P220, P320, 80 Grit)
    grit_match = re.search(r"\b(P\d{2,4}|\d{2,4}\s*Grit)\b", part_desc, re.IGNORECASE)
    if grit_match:
        val = grit_match.group(1).upper()
        attrs["Grit Rating"] = val
        provenance.append({
            "field_name": "Grit Rating",
            "value": val,
            "source": "Part_Desc",
            "evidence": grit_match.group(0),
            "method": "regex_grit_extractor",
            "confidence": 0.98,
        })

    # 2. Dimension Extraction (e.g. 1/2"x18", 5", 6-1/2"x1/8"x5/8", 2.75x30)
    dim_match = re.search(r'(\d+(?:[-/]\d+)?(?:\s*in|\s*"|\s*mm)?(?:\s*x\s*\d+(?:[-/]\d+)?(?:\s*in|\s*"|\s*mm)?){1,3})', part_desc, re.IGNORECASE)
    if dim_match:
        raw_dim = dim_match.group(1).strip()
        attrs["Dimensions"] = raw_dim
        provenance.append({
            "field_name": "Dimensions",
            "value": raw_dim,
            "source": "Part_Desc",
            "evidence": dim_match.group(0),
            "method": "regex_dimension_normalizer",
            "confidence": 0.95,
        })

    # 3. Pack Quantity (e.g. 50 Disc/Box, 6pc, 10/pk)
    pack_match = re.search(r"(\d+)\s*(?:Disc/Box|pc|pk|pack|box|ea|pieces)\b", part_desc, re.IGNORECASE)
    if pack_match:
        pack_val = pack_match.group(0)
        attrs["Package Quantity"] = pack_val
        provenance.append({
            "field_name": "Package Quantity",
            "value": pack_val,
            "source": "Part_Desc",
            "evidence": pack_match.group(0),
            "method": "regex_pack_extractor",
            "confidence": 0.96,
        })

    # 4. Material / Target Application
    if "metal" in part_desc.lower() or "steel" in part_desc.lower():
        attrs["Application Material"] = "Metal & Ferrous Alloys"
        provenance.append({
            "field_name": "Application Material",
            "value": "Metal & Ferrous Alloys",
            "source": "Part_Desc",
            "evidence": "metal/steel term detected in description",
            "method": "domain_spec_rule",
            "confidence": 0.92,
        })
    elif "wood" in part_desc.lower():
        attrs["Application Material"] = "Wood & Timber"
        provenance.append({
            "field_name": "Application Material",
            "value": "Wood & Timber",
            "source": "Part_Desc",
            "evidence": "wood term detected in description",
            "method": "domain_spec_rule",
            "confidence": 0.92,
        })

    return attrs, provenance


def generate_clean_title(part_num: str, brand: str, product_type: str, attrs: dict[str, Any]) -> str:
    parts = []
    if brand and brand != "Generic / Unbranded":
        parts.append(brand)
    parts.append(product_type)
    if "Dimensions" in attrs:
        parts.append(f"({attrs['Dimensions']})")
    if "Grit Rating" in attrs:
        parts.append(f"Grit {attrs['Grit Rating']}")
    if "Package Quantity" in attrs:
        parts.append(f"[{attrs['Package Quantity']}]")
    parts.append(f"- SKU: {part_num}")
    return " ".join(parts)


def seed_database_from_csv(csv_path: str = "data/raw/sample_1000_items.csv", force: bool = False) -> int:
    """
    Seeds the SQLite database with the actual 1,000 items from the CSV.
    """
    if force:
        Base.metadata.drop_all(bind=engine)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing_count = db.query(Product).count()
        if existing_count > 0 and not force:
            logger.info(f"Database already contains {existing_count} records. Skipping seeding.")
            return existing_count

        path = Path(csv_path)
        if not path.exists():
            logger.error(f"Seeding dataset not found at {csv_path}")
            return 0

        logger.info(f"Loading actual raw dataset from {csv_path}...")
        df = pd.read_csv(csv_path)
        logger.info(f"Found {len(df)} records in CSV.")

        products_to_add = []
        review_count = 0
        validation_issue_count = 0
        seen_part_numbers = set()

        for _, row in df.iterrows():
            mfg_part_num = str(row.get("Mfg_Part_Num", "")).strip()
            if not mfg_part_num or mfg_part_num == "nan":
                continue

            part_desc = str(row.get("Part_Desc", "")).strip() if pd.notna(row.get("Part_Desc")) else None
            part_manuf = str(row.get("Part_Manuf", "")).strip() if pd.notna(row.get("Part_Manuf")) else None

            e1_brand = clean_brand_field(row.get("E1_Brand"))
            unilog_brand = clean_brand_field(row.get("Unilog_Brand"))
            dib_brand = clean_brand_field(row.get("DIB_Brand"))

            # Brand Detection
            canonical_brand, brand_evidence, brand_conf = detect_brand(
                part_desc or "",
                part_manuf,
                [e1_brand, unilog_brand, dib_brand]
            )

            # Category Classification
            category, subcategory, product_type, cat_conf = classify_product(part_desc or "")

            # Attribute Extraction & Provenance
            attributes, provenance_list = extract_attributes_and_provenance(part_desc or "")

            # Add core field provenance records
            provenance_list.append({
                "field_name": "Brand",
                "value": canonical_brand,
                "source": "Part_Desc" if "description" in brand_evidence else "Part_Manuf",
                "evidence": brand_evidence,
                "method": "brand_dictionary_matcher",
                "confidence": brand_conf,
            })
            provenance_list.append({
                "field_name": "Category",
                "value": f"{category} > {subcategory}",
                "source": "Part_Desc",
                "evidence": f"Matched taxonomy rule for '{product_type}'",
                "method": "hierarchical_classifier",
                "confidence": cat_conf,
            })

            # Clean Name & Descriptions
            cleaned_title = generate_clean_title(mfg_part_num, canonical_brand, product_type, attributes)

            descriptions = {
                "short_description": f"{canonical_brand} {product_type} {mfg_part_num}, engineered for industrial high-performance applications.",
                "long_description": f"{canonical_brand} {product_type} (Part Number: {mfg_part_num}). Raw Specs: {part_desc or 'N/A'}. Validated for professional precision.",
                "invoice_description": f"{canonical_brand.upper()} {product_type.upper()} {mfg_part_num}",
                "retail_description": cleaned_title,
            }

            # Completeness & Confidence Calculation
            num_critical_fields = 6  # Brand, Category, Dimensions, Grit/Spec, Description, Part#
            filled_fields = 2  # Part# & Description are always present
            if canonical_brand != "Generic / Unbranded":
                filled_fields += 1
            if category != "Uncategorized":
                filled_fields += 1
            if "Dimensions" in attributes:
                filled_fields += 1
            if "Grit Rating" in attributes or "Application Material" in attributes:
                filled_fields += 1

            completeness_score = round((filled_fields / num_critical_fields) * 100, 1)
            confidence_score = round(((brand_conf + cat_conf + (0.95 if attributes else 0.70)) / 3) * 100, 1)

            # Determine Validation Status & Review Needs
            validation_status = "PASS"
            review_status = "NONE"
            validation_issues = []
            review_items = []

            # Validation Rule 1: Duplicate Part Number Check
            if mfg_part_num in seen_part_numbers:
                validation_status = "WARNING"
                validation_issues.append(ValidationIssue(
                    field_name="Mfg_Part_Num",
                    rule_name="DUPLICATE_PART_NUMBER",
                    severity="WARNING",
                    message=f"Duplicate manufacturer part number '{mfg_part_num}' detected across suppliers in catalog.",
                ))
            else:
                seen_part_numbers.add(mfg_part_num)

            # Validation Rule 2: Missing Brand
            if canonical_brand == "Generic / Unbranded" or brand_conf < 0.75:
                validation_status = "REVIEW_REQUIRED"
                review_status = "PENDING_REVIEW"
                validation_issues.append(ValidationIssue(
                    field_name="Brand",
                    rule_name="REQUIRED_BRAND_RECOVERY",
                    severity="WARNING",
                    message="Brand could not be resolved with high confidence from raw distributor data.",
                ))
                review_items.append(ReviewItem(
                    reason="Low confidence brand detection",
                    field_name="Brand",
                    current_value=canonical_brand,
                    suggested_value="Review Manufacturer Catalog",
                    status="PENDING",
                ))

            # Validation Rule 3: Missing Dimensions
            if "Dimensions" not in attributes and "Abrasives" in category:
                if validation_status == "PASS":
                    validation_status = "WARNING"
                validation_issues.append(ValidationIssue(
                    field_name="Dimensions",
                    rule_name="RECOMMENDED_SPEC_MISSING",
                    severity="INFO",
                    message="Abrasive tool record missing explicit dimensional measurement in Part_Desc.",
                ))

            # Validation Rule 4: Category Confidence
            if cat_conf < 0.70:
                validation_status = "REVIEW_REQUIRED"
                review_status = "PENDING_REVIEW"
                validation_issues.append(ValidationIssue(
                    field_name="Category",
                    rule_name="CATEGORY_AMBIGUITY",
                    severity="WARNING",
                    message=f"Category '{category}' assigned with confidence {cat_conf:.2f}.",
                ))

            # Build Product Entity
            product = Product(
                mfg_part_num=mfg_part_num,
                part_desc=part_desc,
                part_manuf=part_manuf,
                e1_brand=e1_brand,
                unilog_brand=unilog_brand,
                dib_brand=dib_brand,
                cleaned_name=cleaned_title,
                canonical_brand=canonical_brand,
                manufacturer_name=part_manuf,
                category=category,
                subcategory=subcategory,
                product_type=product_type,
                attributes_json=json.dumps(attributes),
                descriptions_json=json.dumps(descriptions),
                completeness_score=completeness_score,
                confidence_score=confidence_score,
                enrichment_status="ENRICHED",
                validation_status=validation_status,
                review_status=review_status,
            )

            # Attach Provenance
            for prov in provenance_list:
                product.provenance_records.append(ProvenanceRecord(
                    field_name=prov["field_name"],
                    value=str(prov["value"]),
                    source=prov["source"],
                    evidence=prov.get("evidence"),
                    method=prov["method"],
                    confidence=prov["confidence"],
                ))

            # Attach Validation Issues
            for v_issue in validation_issues:
                product.validation_issues.append(v_issue)
                validation_issue_count += 1

            # Attach Review Items
            for r_item in review_items:
                product.review_items.append(r_item)
                review_count += 1

            products_to_add.append(product)

        # Bulk save
        db.add_all(products_to_add)

        # Add Audit log
        db.add(AuditLog(
            event_type="DATASET_INGESTION_COMPLETED",
            entity_type="CATALOG",
            entity_id="sample_1000_items",
            description=f"Successfully ingested and enriched {len(products_to_add)} products from sample_1000_items.csv with {review_count} items flagged for human review.",
            details_json=json.dumps({
                "total_products": len(products_to_add),
                "review_items_count": review_count,
                "validation_issues_count": validation_issue_count,
            }),
        ))

        db.commit()
        logger.info(f"Database seeded successfully with {len(products_to_add)} real products!")
        return len(products_to_add)

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}", exc_info=True)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    count = seed_database_from_csv(force=True)
    print(f"Seeded {count} products successfully.")
