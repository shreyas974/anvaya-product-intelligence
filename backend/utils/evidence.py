from typing import Any

from backend.schemas.evidence import EvidenceItem


def create_evidence(
    source_file: str,
    file_type: str,
    source_location: str,
    field_name: str,
    value: Any,
    confidence: float = 1.0,
) -> EvidenceItem:
    return EvidenceItem(
        source_file=source_file,
        file_type=file_type,
        source_location=source_location,
        field_name=field_name,
        extracted_value=str(value),
        confidence=confidence,
    )