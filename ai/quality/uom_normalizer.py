"""
uom_normalizer.py -- Unit of Measure (UOM) Normalizer for Anvaya

WHAT: Normalizes freeform or inconsistent unit strings (e.g. '"', 'inches', 'volts', 'amps')
      into approved standard commercial UOM forms ('in', 'V', 'A', 'dBA', 'mm', 'ft').

WHY:  B2B e-commerce search, faceted filtering, and catalog delivery formats require
      exact canonical UOMs to ensure compliance with master data standards.

HOW:  Pattern matching and canonical lookup dictionaries.
"""

from dataclasses import dataclass
import re


@dataclass
class UOMNormalizationResult:
    """Represents the normalized UOM result."""
    original_uom: str
    normalized_uom: str
    confidence: float
    is_standard: bool


# Canonical mapping for common industrial and appliance UOMs
STANDARD_UOM_MAP: dict[str, str] = {
    # Length / Dimension
    '"': "in",
    "in": "in",
    "in.": "in",
    "inch": "in",
    "inches": "in",
    "'": "ft",
    "ft": "ft",
    "ft.": "ft",
    "feet": "ft",
    "foot": "ft",
    "mm": "mm",
    "cm": "cm",
    "m": "m",

    # Electrical
    "v": "V",
    "volt": "V",
    "volts": "V",
    "vac": "VAC",
    "vdc": "VDC",
    "a": "A",
    "amp": "A",
    "amps": "A",
    "ampere": "A",
    "amperes": "A",
    "w": "W",
    "watt": "W",
    "watts": "W",
    "kw": "kW",
    "hz": "Hz",

    # Acoustic / Noise
    "dba": "dBA",
    "db": "dB",
    "decibel": "dB",

    # Weight
    "lb": "lb",
    "lbs": "lb",
    "pound": "lb",
    "pounds": "lb",
    "oz": "oz",
    "kg": "kg",
    "g": "g",

    # Volume / Flow
    "gal": "gal",
    "gallon": "gal",
    "gallons": "gal",
    "gpm": "gpm",
    "cfm": "cfm",
    "psi": "psi",
}


class UOMNormalizer:
    """
    Normalizes and validates Units of Measure.
    """

    def normalize(self, raw_uom: str | None) -> UOMNormalizationResult:
        """
        Normalize a raw UOM string to its approved canonical form.
        """
        if not raw_uom or raw_uom.strip() == "" or raw_uom.lower() == "nan":
            return UOMNormalizationResult(
                original_uom="",
                normalized_uom="",
                confidence=1.0,
                is_standard=True,
            )

        clean = raw_uom.strip()
        lower = clean.lower()

        if lower in STANDARD_UOM_MAP:
            return UOMNormalizationResult(
                original_uom=clean,
                normalized_uom=STANDARD_UOM_MAP[lower],
                confidence=1.0,
                is_standard=True,
            )

        # Remove trailing periods or quotes
        stripped = lower.rstrip(".").rstrip('"').rstrip("'")
        if stripped in STANDARD_UOM_MAP:
            return UOMNormalizationResult(
                original_uom=clean,
                normalized_uom=STANDARD_UOM_MAP[stripped],
                confidence=0.95,
                is_standard=True,
            )

        # Fallback: keep trimmed original with lower confidence
        return UOMNormalizationResult(
            original_uom=clean,
            normalized_uom=clean,
            confidence=0.50,
            is_standard=False,
        )
