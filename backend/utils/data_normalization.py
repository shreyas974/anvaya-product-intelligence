from typing import Any


COLUMN_ALIASES = {
    "product": "name",
    "product_name": "name",
    "product name": "name",
    "item": "name",
    "item_name": "name",
    "cost": "price",
    "unit_price": "price",
    "unit price": "price",
}


def normalize_column_name(column: Any) -> str:
    normalized = str(column).strip().lower()
    normalized = normalized.replace("-", "_")

    return COLUMN_ALIASES.get(normalized, normalized)


def normalize_columns(columns: list[Any]) -> list[str]:
    return [normalize_column_name(column) for column in columns]


def normalize_product_rows(
    rows: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    normalized_rows = []

    for row in rows:
        normalized_row = {
            normalize_column_name(key): value
            for key, value in row.items()
        }

        if "name" in normalized_row and normalized_row["name"] is not None:
            normalized_row["name"] = str(normalized_row["name"]).strip()

        if "price" in normalized_row and normalized_row["price"] is not None:
            try:
                normalized_row["price"] = float(normalized_row["price"])
            except (TypeError, ValueError):
                # Keep invalid value unchanged.
                # data_validation.py will provide the proper error.
                pass

        normalized_rows.append(normalized_row)

    return normalized_rows