"""
lov_validator.py -- Controlled Vocabulary (LOV) Validator for Anvaya

WHAT: Validates and maps candidate attribute values to controlled lists of values (LOVs).

WHY:  Master catalog databases do not accept arbitrary free-text for attributes like
      Material, Color, Mounting Type, or Certification. They require approved LOV terms.

HOW:  1. Exact matching against approved term dictionary.
      2. Semantic / fuzzy fallback mapping if term is close to an approved LOV entry.
      3. Flagging for Human Review if no approved term matches safely.
"""

from dataclasses import dataclass
from typing import Sequence


@dataclass
class LOVValidationResult:
    """Represents the LOV validation status and sanitized value."""
    original_value: str
    validated_value: str
    is_valid: bool
    confidence: float
    rule: str

    @property
    def status(self) -> str:
        return "AUTO_APPROVED" if self.confidence >= 0.80 else "HUMAN_REVIEW_REQUIRED"


# Default controlled vocabularies for standard attribute labels
STANDARD_LOVS: dict[str, list[str]] = {
    "Material": [
        "Stainless Steel", "Steel", "Aluminum", "Plastic", "Brass",
        "Cast Iron", "Composite", "Copper", "PVC", "Rubber", "Wood",
    ],
    "Color": [
        "Stainless Steel", "Black", "White", "Gray", "Silver",
        "Red", "Green", "Blue", "Yellow", "Clear", "Bronze",
    ],
    "Mounting Type": [
        "Built-in", "Leg", "Freestanding", "Wall Mount", "Under Cabinet",
        "Flush Mount", "Ceiling Mount", "Surface Mount",
    ],
    "Plug Type": [
        "3-Prong", "Direct Wire", "NEMA 5-15P", "NEMA 14-50P", "Hardwired",
    ],
}


class LOVValidator:
    """
    Validates attribute values against controlled lists of values.
    """

    def __init__(self, lov_tables: dict[str, list[str]] | None = None):
        self.lov_tables = lov_tables or STANDARD_LOVS

    def validate(self, attribute_label: str, attribute_value: str | None) -> LOVValidationResult:
        """
        Validate an attribute value against the LOV for its attribute label.
        """
        if not attribute_value or attribute_value.strip() == "" or attribute_value.lower() == "nan":
            return LOVValidationResult(
                original_value="",
                validated_value="",
                is_valid=True,
                confidence=1.0,
                rule="empty_value",
            )

        val = attribute_value.strip()
        label = attribute_label.strip()

        # If no LOV exists for this label, accept with general confidence
        if label not in self.lov_tables:
            return LOVValidationResult(
                original_value=val,
                validated_value=val,
                is_valid=True,
                confidence=0.75,
                rule="unconstrained_lov",
            )

        approved_terms = self.lov_tables[label]

        # 1. Exact match (case-sensitive)
        if val in approved_terms:
            return LOVValidationResult(
                original_value=val,
                validated_value=val,
                is_valid=True,
                confidence=1.0,
                rule="lov_exact_match",
            )

        # 2. Case-insensitive exact match
        for term in approved_terms:
            if val.lower() == term.lower():
                return LOVValidationResult(
                    original_value=val,
                    validated_value=term,  # return canonical casing
                    is_valid=True,
                    confidence=0.95,
                    rule="lov_case_insensitive_match",
                )

        # 3. Substring match (e.g. "Stainless" -> "Stainless Steel")
        for term in approved_terms:
            if val.lower() in term.lower() or term.lower() in val.lower():
                return LOVValidationResult(
                    original_value=val,
                    validated_value=term,
                    is_valid=True,
                    confidence=0.85,
                    rule="lov_substring_match",
                )

        # Fallback: value not in approved LOV
        return LOVValidationResult(
            original_value=val,
            validated_value=val,
            is_valid=False,
            confidence=0.40,
            rule="lov_rejected_unlisted",
        )
