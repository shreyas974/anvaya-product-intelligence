from pathlib import Path

from backend.utils.data_normalization import (
    normalize_columns,
    normalize_product_rows,
)
from backend.utils.data_validation import (
    validate_columns,
    validate_product_rows,
)
from backend.utils.document_processor import process_document
from backend.utils.evidence import create_evidence


def process_uploaded_document(path: str) -> dict:
    result = process_document(path)

    result["evidence"] = []

    if result["file_type"] in {"csv", "xlsx", "xls"}:
        columns = result["columns"]
        rows = result["data"]

        normalized_columns = normalize_columns(columns)

        validate_columns(normalized_columns)

        normalized_rows = normalize_product_rows(rows)
        validated_rows = validate_product_rows(normalized_rows)

        result["columns"] = normalized_columns
        result["data"] = validated_rows

        source_file = Path(path).name

        for row_index, row in enumerate(validated_rows, start=1):
            for field_name in ("name", "price"):
                if field_name in row:
                    result["evidence"].append(
                        create_evidence(
                            source_file=source_file,
                            file_type=result["file_type"],
                            source_location=f"row {row_index}",
                            field_name=field_name,
                            value=row[field_name],
                            confidence=1.0,
                        )
                    )

    result["source_file"] = Path(path).name

    return result