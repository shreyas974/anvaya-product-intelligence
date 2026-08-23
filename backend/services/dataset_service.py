import os
import io
import json
import logging
from typing import Any, Optional
import pandas as pd
from sqlalchemy.orm import Session

from backend.models.product import Dataset, Product, ProvenanceRecord, ReviewItem, ValidationIssue, AuditLog
from backend.services.enrichment_pipeline import enrich_product_record

logger = logging.getLogger("anvaya.dataset_service")


def detect_file_format(filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    if ext in [".csv"]:
        return "CSV"
    if ext in [".xlsx", ".xls"]:
        return "XLSX"
    if ext in [".tsv", ".tab"]:
        return "TSV"
    if ext in [".json"]:
        return "JSON"
    return "CSV"


def parse_uploaded_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
    fmt = detect_file_format(filename)
    try:
        if fmt == "CSV":
            try:
                df = pd.read_csv(io.BytesIO(file_bytes), encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(file_bytes), encoding="latin1")
        elif fmt == "TSV":
            try:
                df = pd.read_csv(io.BytesIO(file_bytes), sep="\t", encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(io.BytesIO(file_bytes), sep="\t", encoding="latin1")
        elif fmt == "XLSX":
            df = pd.read_excel(io.BytesIO(file_bytes))
        elif fmt == "JSON":
            try:
                data = json.loads(file_bytes.decode("utf-8"))
                if isinstance(data, list):
                    df = pd.DataFrame(data)
                elif isinstance(data, dict) and "items" in data and isinstance(data["items"], list):
                    df = pd.DataFrame(data["items"])
                elif isinstance(data, dict) and "products" in data and isinstance(data["products"], list):
                    df = pd.DataFrame(data["products"])
                else:
                    df = pd.DataFrame([data])
            except Exception as e:
                raise ValueError(f"Invalid JSON format: {e}")
        else:
            df = pd.read_csv(io.BytesIO(file_bytes))
    except Exception as e:
        logger.error(f"Failed to parse file {filename}: {e}")
        raise ValueError(f"Could not parse file '{filename}'. Please ensure it is a valid CSV, XLSX, JSON, or TSV.")

    # Clean whitespace from column headers
    df.columns = [str(c).strip() for c in df.columns]
    return df


def infer_column_role(col_name: str, sample_series: pd.Series) -> str:
    """Dynamically infer the semantic role of a column based on name & data."""
    c_lower = col_name.lower().replace("_", " ").replace("-", " ")

    # 1. MPN / SKU / Product Identifier
    if any(k in c_lower for k in ["part num", "partnum", "part_num", "part_no", "part no", "mpn", "sku", "item code", "item_code", "product code", "item id", "model number", "mfg part"]):
        return "mpn"
    if c_lower in ["part", "sku", "mpn", "code", "item", "id", "model"]:
        return "mpn"

    # 2. Description / Title
    if any(k in c_lower for k in ["desc", "description", "title", "product name", "item name", "item desc", "part desc", "part name", "name"]):
        return "description"

    # 3. Brand
    if any(k in c_lower for k in ["brand", "e1 brand", "unilog brand", "dib brand", "brand name"]):
        return "brand"

    # 4. Manufacturer
    if any(k in c_lower for k in ["manuf", "manufacturer", "mfr", "producer", "supplier", "part manuf", "vendor"]):
        return "manufacturer"

    # 5. Category / Taxonomy
    if any(k in c_lower for k in ["category", "cat", "subcategory", "class", "dept", "department", "taxonomy", "family", "product type"]):
        return "category"

    # 6. Price / Cost
    if any(k in c_lower for k in ["price", "cost", "msrp", "amount", "unit price"]):
        return "price"

    # 7. Default to Technical Attribute
    return "attribute"


def profile_dataframe(df: pd.DataFrame) -> dict[str, Any]:
    """Generates dynamic profiling metadata across any arbitrary dataset schema."""
    total_rows = len(df)
    total_cols = len(df.columns)
    column_stats = []
    inferred_mappings = {}

    for col in df.columns:
        series = df[col]
        non_null = int(series.notna().sum())
        null_count = int(series.isna().sum())
        null_rate = round((null_count / total_rows) * 100, 1) if total_rows > 0 else 0.0
        unique_count = int(series.nunique())

        # Sample values
        sample_vals = series.dropna().astype(str).unique()[:3].tolist()

        # Inferred role
        role = infer_column_role(col, series)
        inferred_mappings[col] = role

        # Data type
        if pd.api.types.is_numeric_dtype(series):
            dtype_label = "number"
        elif pd.api.types.is_bool_dtype(series):
            dtype_label = "boolean"
        else:
            dtype_label = "string"

        column_stats.append({
            "name": col,
            "role": role,
            "data_type": dtype_label,
            "non_null_count": non_null,
            "null_count": null_count,
            "null_rate_percent": null_rate,
            "unique_count": unique_count,
            "sample_values": sample_vals,
        })

    # Duplicate part number detection (if MPN column exists)
    mpn_cols = [c for c, r in inferred_mappings.items() if r == "mpn"]
    duplicates_count = 0
    if mpn_cols:
        primary_mpn_col = mpn_cols[0]
        duplicates_count = int(df[primary_mpn_col].duplicated().sum())

    return {
        "total_rows": total_rows,
        "total_columns": total_cols,
        "duplicate_rows": duplicates_count,
        "overall_null_rate": round(float(df.isna().mean().mean()) * 100, 1) if total_rows > 0 else 0.0,
        "columns": column_stats,
        "inferred_mappings": inferred_mappings,
        "sample_records": df.head(5).fillna("").to_dict(orient="records"),
    }


def create_and_profile_dataset(
    db: Session,
    filename: str,
    file_bytes: bytes,
    workspace_id: str = "ws-default",
    uploaded_by: str = "Enterprise User",
) -> Dataset:
    """Parses raw upload, profiles schema, saves Dataset row in DB."""
    df = parse_uploaded_file(file_bytes, filename)
    profiling = profile_dataframe(df)

    dataset_name = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ").title()

    # Save raw CSV for downstream processing
    raw_csv_path = os.path.join("data", "uploads", f"dataset_{filename}")
    os.makedirs(os.path.dirname(raw_csv_path), exist_ok=True)
    df.to_csv(raw_csv_path, index=False)

    dataset = Dataset(
        workspace_id=workspace_id,
        name=dataset_name,
        file_name=filename,
        file_size_bytes=len(file_bytes),
        file_format=detect_file_format(filename),
        row_count=profiling["total_rows"],
        column_count=profiling["total_columns"],
        status="PROFILED",
        version="v1.0",
        uploaded_by=uploaded_by,
        profiling_json=json.dumps(profiling),
        column_mapping_json=json.dumps(profiling["inferred_mappings"]),
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    # Log audit event
    audit = AuditLog(
        dataset_id=dataset.id,
        event_type="DATASET_UPLOAD",
        entity_type="DATASET",
        entity_id=str(dataset.id),
        description=f"Uploaded and profiled catalog '{filename}' with {dataset.row_count} rows and {dataset.column_count} columns.",
        details_json=json.dumps({"file_name": filename, "format": dataset.file_format, "rows": dataset.row_count}),
    )
    db.add(audit)
    db.commit()

    return dataset


def process_dataset_records(
    db: Session,
    dataset_id: int,
    custom_mappings: Optional[dict[str, str]] = None,
) -> dict[str, Any]:
    """Executes the 8-stage intelligence pipeline on the specified dataset rows."""
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise ValueError(f"Dataset #{dataset_id} not found")

    raw_csv_path = os.path.join("data", "uploads", f"dataset_{dataset.file_name}")
    if not os.path.exists(raw_csv_path):
        raise ValueError(f"Raw data file for dataset #{dataset_id} is missing")

    df = pd.read_csv(raw_csv_path)

    # Use confirmed column mapping
    mapping = custom_mappings or dataset.column_mapping or {}
    dataset.column_mapping_json = json.dumps(mapping)
    dataset.status = "PROCESSING"
    db.commit()

    # Find role mappings
    mpn_cols = [c for c, r in mapping.items() if r == "mpn"]
    desc_cols = [c for c, r in mapping.items() if r == "description"]
    brand_cols = [c for c, r in mapping.items() if r == "brand"]
    manuf_cols = [c for c, r in mapping.items() if r == "manufacturer"]

    mpn_col = mpn_cols[0] if mpn_cols else (df.columns[0] if len(df.columns) > 0 else "id")
    desc_col = desc_cols[0] if desc_cols else None
    brand_col = brand_cols[0] if brand_cols else None
    manuf_col = manuf_cols[0] if manuf_cols else None

    # Clear prior products for this dataset if re-processing
    db.query(Product).filter(Product.dataset_id == dataset_id).delete()
    db.query(ReviewItem).filter(ReviewItem.dataset_id == dataset_id).delete()
    db.query(ValidationIssue).filter(ValidationIssue.dataset_id == dataset_id).delete()
    db.commit()

    processed_count = 0
    review_count = 0
    passed_count = 0

    for idx, row in df.iterrows():
        raw_dict = row.to_dict()
        mfg_part_num = str(raw_dict.get(mpn_col, f"SKU-{idx+1}")).strip()
        part_desc = str(raw_dict.get(desc_col, "")).strip() if desc_col else ""
        part_manuf = str(raw_dict.get(manuf_col, "")).strip() if manuf_col else ""
        e1_brand = str(raw_dict.get(brand_col, "")).strip() if brand_col else ""

        # Run 8-stage enrichment
        enriched = enrich_product_record({
            "mfg_part_num": mfg_part_num,
            "part_desc": part_desc,
            "part_manuf": part_manuf,
            "e1_brand": e1_brand,
            "unilog_brand": e1_brand,
            "dib_brand": e1_brand,
        })

        val_status = enriched.get("validation_status", "PASS")
        review_status = enriched.get("review_status", "NONE")

        if val_status == "PASS":
            passed_count += 1
        if review_status == "PENDING_REVIEW":
            review_count += 1

        product = Product(
            dataset_id=dataset_id,
            workspace_id=dataset.workspace_id,
            mfg_part_num=mfg_part_num,
            part_desc=part_desc,
            part_manuf=part_manuf,
            e1_brand=e1_brand,
            unilog_brand=e1_brand,
            raw_json=json.dumps({str(k): str(v) for k, v in raw_dict.items() if pd.notna(v)}),
            cleaned_name=enriched.get("cleaned_name") or part_desc or mfg_part_num,
            canonical_brand=enriched.get("canonical_brand") or e1_brand or "Generic / Unbranded",
            manufacturer_name=enriched.get("manufacturer_name") or part_manuf or "Generic Manufacturer",
            category=enriched.get("category") or "General Hardware",
            subcategory=enriched.get("subcategory") or "Standard Components",
            product_type=enriched.get("product_type") or "Component",
            attributes_json=json.dumps(enriched.get("attributes", {})),
            descriptions_json=json.dumps(enriched.get("descriptions", {})),
            completeness_score=float(enriched.get("completeness_score", 90.0)),
            confidence_score=float(enriched.get("confidence_score", 95.0)),
            enrichment_status="ENRICHED",
            validation_status=val_status,
            review_status=review_status,
        )
        db.add(product)
        db.flush()

        # Add provenance records
        for prov in enriched.get("provenance", []):
            db.add(ProvenanceRecord(
                product_id=product.id,
                field_name=prov.get("field_name", "General"),
                value=prov.get("value", ""),
                source=prov.get("source", "Part_Desc"),
                evidence=prov.get("evidence", ""),
                method=prov.get("method", "deterministic_rule"),
                confidence=float(prov.get("confidence", 0.95)),
            ))

        # Add validation issues
        for issue in enriched.get("validation_issues", []):
            db.add(ValidationIssue(
                product_id=product.id,
                dataset_id=dataset_id,
                field_name=issue.get("field", "General"),
                rule_name=issue.get("rule", "RULE_CHECK"),
                severity=issue.get("severity", "WARNING"),
                message=issue.get("message", "Validation notice"),
            ))

        # Add review item if escalated
        if review_status == "PENDING_REVIEW":
            db.add(ReviewItem(
                product_id=product.id,
                dataset_id=dataset_id,
                sku=product.mfg_part_num,
                cleaned_name=product.cleaned_name,
                raw_description=product.part_desc,
                reason="Low confidence brand/attribute resolution or LOV validation warning",
                field_name="Brand / Specification",
                current_value=e1_brand or "Unbranded",
                suggested_value=product.canonical_brand,
                status="PENDING",
            ))

        processed_count += 1

    dataset.status = "PROCESSED"
    db.commit()

    # Log audit event
    audit = AuditLog(
        dataset_id=dataset.id,
        event_type="DATASET_PROCESSED",
        entity_type="DATASET",
        entity_id=str(dataset.id),
        description=f"Completed 8-stage processing for dataset '{dataset.name}'. {processed_count} products enriched, {passed_count} validated, {review_count} queued for review.",
        details_json=json.dumps({"processed": processed_count, "passed": passed_count, "review": review_count}),
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "dataset_id": dataset_id,
        "processed_count": processed_count,
        "passed_count": passed_count,
        "review_count": review_count,
        "auto_pass_rate": round((passed_count / processed_count) * 100, 1) if processed_count > 0 else 0.0,
    }
