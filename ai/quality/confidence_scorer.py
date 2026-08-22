"""
confidence_scorer.py -- Confidence Scoring & Review Flagging Engine for Anvaya

WHAT: Computes comprehensive field-level and record-level confidence scores.
      Classifies each enriched record as AUTO_APPROVED or HUMAN_REVIEW_REQUIRED.

WHY:  Traceability and governance are core product requirements. Automated catalogs
      must never publish low-confidence or hallucinated data without review.

HOW:  Aggregates confidence scores across cleaning, classification, brand matching,
      and attribute extraction with customizable thresholds.
"""

from dataclasses import dataclass, field
from typing import Mapping, Any


@dataclass
class QualityAssessment:
    """Represents the overall quality assessment for an enriched product record."""
    overall_confidence: float               # Range [0.0, 1.0]
    status: str                             # "AUTO_APPROVED" or "HUMAN_REVIEW_REQUIRED"
    field_confidences: dict[str, float] = field(default_factory=dict)
    flagged_reasons: list[str] = field(default_factory=list)


class ConfidenceScorer:
    """
    Evaluates enriched product records and assigns governance quality decisions.
    """

    def __init__(self, approval_threshold: float = 0.75):
        self.approval_threshold = approval_threshold

    def evaluate_record(
        self,
        record: Mapping[str, Any],
        field_confidences: Mapping[str, float] | None = None,
    ) -> QualityAssessment:
        """
        Evaluate an enriched record and return a QualityAssessment.
        """
        conf_dict: dict[str, float] = dict(field_confidences or {})
        flagged: list[str] = []

        # If individual field confidences were not provided, infer from presence of key fields
        if not conf_dict:
            # Check Brand
            brand = record.get("BRAND_NAME")
            if brand and str(brand).lower() != "nan":
                conf_dict["brand"] = 0.85
            else:
                conf_dict["brand"] = 0.0
                flagged.append("Missing or unresolved Brand Name")

            # Check Category
            dept = record.get("Dept")
            fine = record.get("Fine")
            if dept and fine and str(dept).lower() != "nan":
                conf_dict["taxonomy"] = 0.80
            else:
                conf_dict["taxonomy"] = 0.0
                flagged.append("Incomplete taxonomy classification")

            # Check Product Name
            prod = record.get("Product Name")
            if prod and str(prod).lower() != "nan":
                conf_dict["product_name"] = 0.90
            else:
                conf_dict["product_name"] = 0.0
                flagged.append("Uncertain product name type")

            # Check Manufacturer
            mfg = record.get("MANUFACTURER_NAME")
            if mfg and str(mfg).lower() != "nan":
                conf_dict["manufacturer"] = 0.50  # distributor fallback
            else:
                conf_dict["manufacturer"] = 0.0
                flagged.append("Missing manufacturer data")

        # Compute overall confidence (mean of known field confidences)
        if conf_dict:
            overall = sum(conf_dict.values()) / len(conf_dict)
        else:
            overall = 0.0

        # Determine approval status
        if overall >= self.approval_threshold and len(flagged) == 0:
            status = "AUTO_APPROVED"
        else:
            status = "HUMAN_REVIEW_REQUIRED"

        return QualityAssessment(
            overall_confidence=round(overall, 3),
            status=status,
            field_confidences=conf_dict,
            flagged_reasons=flagged,
        )
