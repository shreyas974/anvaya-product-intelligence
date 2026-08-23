"""
attribute_extractor.py -- Structured Attribute Triplet Extractor for Anvaya

WHAT: Extracts structured attribute triplets (Label, Value, UOM) from product text
      and normalizes them using LOVValidator and UOMNormalizer.

WHY:  Populates the 50 attribute triplets (ATTRIBUTE_LABEL 1..50, ATTRIBUTE_VALUE 1..50,
      ATTRIBUTE_UOM 1..50) required by master catalog delivery formats.

HOW:  Uses regex pattern extractors for electrical ratings (V, A, W), acoustics (dBA),
      materials, mounting types, and dimensions, then passes them through quality gates.
"""

from dataclasses import dataclass
import re
from ai.quality.uom_normalizer import UOMNormalizer
from ai.quality.lov_validator import LOVValidator


@dataclass
class AttributeTriplet:
    """Represents a single extracted and normalized attribute."""
    label: str
    value: str
    uom: str = ""
    confidence: float = 1.0


# Regex extractors for standard attributes
_VOLTAGE_RE = re.compile(r"\b(\d{2,3})\s*(?:v|volt|volts|vac)\b", re.IGNORECASE)
_AMPERAGE_RE = re.compile(r"\b(\d{1,3}(?:\.\d+)?)\s*(?:a|amp|amps)\b", re.IGNORECASE)
_WATTAGE_RE = re.compile(r"\b(\d{1,4})\s*(?:w|watt|watts)\b", re.IGNORECASE)
_SOUND_RE = re.compile(r"\b(\d{2})\s*(?:dba|db)\b", re.IGNORECASE)
_MOUNTING_BUILTIN_RE = re.compile(r"\b(?:built[\s\-]in|builtin|builtln)\b", re.IGNORECASE)
_MOUNTING_LEG_RE = re.compile(r"\bleg\b", re.IGNORECASE)
_MATERIAL_SS_RE = re.compile(r"\b(?:stainless\s+steel|sst|ss)\b", re.IGNORECASE)
_SERIES_RE = re.compile(r"\b([A-Za-z0-9]+)\s+Series\b", re.IGNORECASE)


class AttributeExtractor:
    """
    Extracts ordered attribute triplets from product text descriptions.
    """

    def __init__(self):
        self.uom_normalizer = UOMNormalizer()
        self.lov_validator = LOVValidator()

    def extract_triplets(self, part_desc: str, extra_text: str | None = None) -> list[AttributeTriplet]:
        """
        Extract all identifiable attribute triplets from product text.
        """
        text = f"{part_desc} {extra_text or ''}".strip()
        triplets: list[AttributeTriplet] = []

        # 1. Series
        series_match = _SERIES_RE.search(text)
        if series_match:
            triplets.append(AttributeTriplet(
                label="Series",
                value=f"{series_match.group(1)} Series",
                uom="",
                confidence=0.90,
            ))

        # 2. Voltage Rating
        volt_match = _VOLTAGE_RE.search(text)
        if volt_match:
            uom_res = self.uom_normalizer.normalize("V")
            triplets.append(AttributeTriplet(
                label="Voltage Rating",
                value=volt_match.group(1),
                uom=uom_res.normalized_uom,
                confidence=0.95,
            ))

        # 3. Amperage Rating
        amp_match = _AMPERAGE_RE.search(text)
        if amp_match:
            uom_res = self.uom_normalizer.normalize("A")
            triplets.append(AttributeTriplet(
                label="Amperage Rating",
                value=amp_match.group(1),
                uom=uom_res.normalized_uom,
                confidence=0.95,
            ))

        # 4. Wattage / Power Rating
        watt_match = _WATTAGE_RE.search(text)
        if watt_match:
            uom_res = self.uom_normalizer.normalize("W")
            triplets.append(AttributeTriplet(
                label="Wattage",
                value=watt_match.group(1),
                uom=uom_res.normalized_uom,
                confidence=0.95,
            ))

        # 5. Mounting Type
        if _MOUNTING_BUILTIN_RE.search(text):
            lov_res = self.lov_validator.validate("Mounting Type", "Built-in")
            triplets.append(AttributeTriplet(
                label="Mounting Type",
                value=lov_res.validated_value,
                uom="",
                confidence=lov_res.confidence,
            ))
        elif _MOUNTING_LEG_RE.search(text):
            lov_res = self.lov_validator.validate("Mounting Type", "Leg")
            triplets.append(AttributeTriplet(
                label="Mounting Type",
                value=lov_res.validated_value,
                uom="",
                confidence=lov_res.confidence,
            ))

        # 6. Sound Level
        sound_match = _SOUND_RE.search(text)
        if sound_match:
            uom_res = self.uom_normalizer.normalize("dBA")
            triplets.append(AttributeTriplet(
                label="Sound Level",
                value=sound_match.group(1),
                uom=uom_res.normalized_uom,
                confidence=0.95,
            ))

        # 7. Material & Color
        if _MATERIAL_SS_RE.search(text):
            lov_mat = self.lov_validator.validate("Material", "Stainless Steel")
            lov_col = self.lov_validator.validate("Color", "Stainless Steel")
            triplets.append(AttributeTriplet(
                label="Material",
                value=lov_mat.validated_value,
                uom="",
                confidence=lov_mat.confidence,
            ))
            triplets.append(AttributeTriplet(
                label="Color",
                value=lov_col.validated_value,
                uom="",
                confidence=lov_col.confidence,
            ))

        return triplets
