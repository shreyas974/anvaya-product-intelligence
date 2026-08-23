from pathlib import Path

import pandas as pd

from backend.controllers.document_controller import process_uploaded_document
from backend.utils.document_processor import process_document


def test_process_csv(tmp_path: Path):
    file_path = tmp_path / "products.csv"

    pd.DataFrame(
        {
            "name": ["Product A"],
            "price": [100],
        }
    ).to_csv(file_path, index=False)

    result = process_document(str(file_path))

    assert result["file_type"] == "csv"
    assert result["rows"] == 1
    assert result["columns"] == ["name", "price"]


def test_process_excel(tmp_path: Path):
    file_path = tmp_path / "products.xlsx"

    pd.DataFrame(
        {
            "name": ["Product A"],
            "price": [100],
        }
    ).to_excel(file_path, index=False)

    result = process_document(str(file_path))

    assert result["file_type"] == "xlsx"
    assert result["rows"] == 1


def test_unsupported_document(tmp_path: Path):
    file_path = tmp_path / "test.txt"
    file_path.write_text("test")

    try:
        process_document(str(file_path))
        assert False
    except ValueError as exc:
        assert "Unsupported document type" in str(exc)


def test_process_uploaded_document_normalizes_and_validates(
    tmp_path: Path,
):
    file_path = tmp_path / "products.csv"

    pd.DataFrame(
        {
            "Product Name": ["  Product A  "],
            "Cost": [100],
        }
    ).to_csv(file_path, index=False)

    result = process_uploaded_document(str(file_path))

    assert result["source_file"] == "products.csv"
    assert result["data"][0]["name"] == "Product A"
    assert result["data"][0]["price"] == 100.0
    assert len(result["evidence"]) == 2


def test_process_uploaded_document_rejects_missing_required_column(
    tmp_path: Path,
):
    file_path = tmp_path / "products.csv"

    pd.DataFrame(
        {
            "Product Name": ["Product A"],
        }
    ).to_csv(file_path, index=False)

    try:
        process_uploaded_document(str(file_path))
        assert False
    except ValueError as exc:
        assert "Missing required columns" in str(exc)


def test_process_uploaded_document_rejects_empty_data(
    tmp_path: Path,
):
    file_path = tmp_path / "products.csv"

    pd.DataFrame(
        {
            "name": [],
            "price": [],
        }
    ).to_csv(file_path, index=False)

    try:
        process_uploaded_document(str(file_path))
        assert False
    except ValueError as exc:
        assert "no data rows" in str(exc)


def test_process_uploaded_document_rejects_invalid_price(
    tmp_path: Path,
):
    file_path = tmp_path / "products.csv"

    pd.DataFrame(
        {
            "name": ["Product A"],
            "price": ["not-a-number"],
        }
    ).to_csv(file_path, index=False)

    try:
        process_uploaded_document(str(file_path))
        assert False
    except ValueError as exc:
        assert "price must be numeric" in str(exc)


def test_process_uploaded_document_rejects_negative_price(
    tmp_path: Path,
):
    file_path = tmp_path / "products.csv"

    pd.DataFrame(
        {
            "name": ["Product A"],
            "price": [-100],
        }
    ).to_csv(file_path, index=False)

    try:
        process_uploaded_document(str(file_path))
        assert False
    except ValueError as exc:
        assert "price cannot be negative" in str(exc)