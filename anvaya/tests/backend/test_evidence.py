import pytest
from pydantic import ValidationError

from backend.schemas.evidence import EvidenceItem
from backend.utils.evidence import create_evidence


def test_create_evidence():
    evidence = create_evidence(
        source_file="products.csv",
        file_type="csv",
        source_location="row 2",
        field_name="price",
        value=1250,
    )

    assert evidence.source_file == "products.csv"
    assert evidence.file_type == "csv"
    assert evidence.source_location == "row 2"
    assert evidence.field_name == "price"
    assert evidence.extracted_value == "1250"
    assert evidence.confidence == 1.0


def test_evidence_confidence_range():
    with pytest.raises(ValidationError):
        EvidenceItem(
            source_file="products.csv",
            file_type="csv",
            source_location="row 2",
            field_name="price",
            extracted_value="1250",
            confidence=2.0,
        )