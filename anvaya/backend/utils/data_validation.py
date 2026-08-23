from typing import Any


REQUIRED_PRODUCT_COLUMNS = {"name", "price"}


def validate_columns(columns: list[str]) -> None:
    normalized = {str(column).strip().lower() for column in columns}

    missing = REQUIRED_PRODUCT_COLUMNS - normalized

    if missing:
        raise ValueError(
            f"Missing required columns: {', '.join(sorted(missing))}"
        )


def validate_product_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not rows:
        raise ValueError("Document contains no data rows.")

    validated = []

    for index, row in enumerate(rows, start=1):
        name = row.get("name")
        price = row.get("price")

        if name is None or not str(name).strip():
            raise ValueError(f"Row {index}: product name is required.")

        if price is None:
            raise ValueError(f"Row {index}: product price is required.")

        try:
            numeric_price = float(price)
        except (TypeError, ValueError):
            raise ValueError(f"Row {index}: price must be numeric.")

        if numeric_price < 0:
            raise ValueError(f"Row {index}: price cannot be negative.")

        validated.append(
            {
                **row,
                "name": str(name).strip(),
                "price": numeric_price,
            }
        )

    return validated