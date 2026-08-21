from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models.product import Product


def calculate_quality_metrics(db: Session) -> dict:
    products = list(db.scalars(select(Product)).all())

    total_products = len(products)

    if total_products == 0:
        return {
            "overallQualityScore": 0.0,
            "dimensions": {
                "completeness": 0.0,
                "consistency": 0.0,
                "accuracy": 0.0,
                "uniqueness": 0.0,
            },
            "totalProductsAudited": 0,
            "totalAnomaliesCount": 0,
            "criticalAnomaliesCount": 0,
            "highAnomaliesCount": 0,
            "mediumAnomaliesCount": 0,
            "lowAnomaliesCount": 0,
            "resolvedAnomaliesCount": 0,
            "categoryBreakdown": [],
            "historicalTrend": [],
        }

    # Completeness:
    # part_number, brand, model and description
    total_fields = total_products * 4

    completed_fields = sum(
        sum(
            value is not None and str(value).strip() != ""
            for value in (
                product.part_number,
                product.brand,
                product.model,
                product.description,
            )
        )
        for product in products
    )

    completeness = (completed_fields / total_fields) * 100

    # Uniqueness based on part numbers.
    unique_part_numbers = len(
        {product.part_number for product in products}
    )

    uniqueness = (unique_part_numbers / total_products) * 100

    # Current schema does not contain enough information
    # for independent accuracy/consistency checks.
    consistency = 100.0
    accuracy = 100.0

    overall_score = (
        completeness
        + consistency
        + accuracy
        + uniqueness
    ) / 4

    return {
        "overallQualityScore": round(overall_score, 2),
        "dimensions": {
            "completeness": round(completeness, 2),
            "consistency": consistency,
            "accuracy": accuracy,
            "uniqueness": round(uniqueness, 2),
        },
        "totalProductsAudited": total_products,
        "totalAnomaliesCount": 0,
        "criticalAnomaliesCount": 0,
        "highAnomaliesCount": 0,
        "mediumAnomaliesCount": 0,
        "lowAnomaliesCount": 0,
        "resolvedAnomaliesCount": 0,
        "categoryBreakdown": [],
        "historicalTrend": [],
    }
    