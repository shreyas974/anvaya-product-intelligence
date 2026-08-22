import pytest

from backend.utils.data_validation import (
    validate_columns,
    validate_product_rows,
)


def test_validate_columns_success():
    validate_columns(["name", "price"])


def test_validate_columns_missing():
    with pytest.raises(ValueError, match="Missing required columns"):
        validate_columns(["name"])


def test_validate_product_rows_success():
    result = validate_product_rows(
        [{"name": " Product A ", "price": "100"}]
    )

    assert result[0]["name"] == "Product A"
    assert result[0]["price"] == 100.0


def test_validate_product_rows_rejects_negative_price():
    with pytest.raises(ValueError, match="cannot be negative"):
        validate_product_rows(
            [{"name": "Product A", "price": -10}]
        )


def test_validate_product_rows_rejects_invalid_price():
    with pytest.raises(ValueError, match="must be numeric"):
        validate_product_rows(
            [{"name": "Product A", "price": "abc"}]
        )