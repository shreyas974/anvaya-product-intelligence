from backend.utils.data_normalization import (
    normalize_columns,
    normalize_product_rows,
)


def test_normalize_column_aliases():
    result = normalize_columns(
        ["Product Name", "Unit Price"]
    )

    assert result == ["name", "price"]


def test_normalize_product_rows():
    result = normalize_product_rows(
        [
            {
                "Product Name": "  Product A  ",
                "Unit Price": "100",
            }
        ]
    )

    assert result == [
        {
            "name": "Product A",
            "price": 100.0,
        }
    ]