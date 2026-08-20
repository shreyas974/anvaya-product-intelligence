"""
matcher.py -- ManufacturerMatcher & BrandMatcher for Anvaya Enrichment Pipeline

WHAT: Attempts to resolve the actual manufacturer and brand for a product.

WHY:  The raw data's Part_Manuf field often contains a DISTRIBUTOR, not the
      actual manufacturer. Example:
        Part_Manuf = "Appliance Dealers Cooperative (APPDE)"
        Actual MANUFACTURER_NAME = "Rheem Manufacturing"  (different company!)

      Without the brand master list (UniCat_Manufacturer_and_Brand_List.xlsx),
      we can only:
        1. Extract the distributor name (already done by extractor.py)
        2. Try to infer the brand from Part_Desc keywords
        3. Use the non-placeholder E1_Brand / DIB_Brand if available

HOW:  Phase 1 (current): Simple rule-based matching using the raw columns.
      Phase 2 (future):   Once brand master list is available, do exact/fuzzy
                          matching against it.

EXTENSION POINT: The match() method accepts an optional `brand_master`
                 DataFrame. When the master list is added to data/schemas/,
                 pass it in to enable proper brand resolution.
"""

import re
import pandas as pd
import numpy as np
from dataclasses import dataclass


@dataclass
class MatchResult:
    """Result of a manufacturer/brand match attempt."""
    value: str | None
    confidence: float           # 0.0 to 1.0
    rule: str                   # which matching rule produced this
    source: str                 # what raw value was used
    needs_review: bool = False  # flag for human review queue

    @property
    def status(self) -> str:
        return "AUTO_APPROVED" if self.confidence >= 0.8 else "HUMAN_REVIEW_REQUIRED"


# -------------------------------------------------------------------------
# Known brand indicators in Part_Desc (manually observed from data)
# Maps a keyword found in Part_Desc -> likely brand name
# -------------------------------------------------------------------------
_DESC_BRAND_HINTS = {
    "Diablo": "Diablo",
    "Milw": "Milwaukee",
    "Milwaukee": "Milwaukee",
    "Dewalt": "DeWalt",
    "DEWALT": "DeWalt",
    "Makita": "Makita",
    "Festool": "Festool",
    "Kichler": "Kichler",
    "Trex": "Trex",
    "Azek": "AZEK",
    "Bosch": "Bosch",
    "Leviton": "Leviton",
    "Mirka": "Mirka",
    "Kreg": "Kreg",
    "3M": "3M",
}

# Pre-compile for speed (word-boundary matching, case insensitive)
_BRAND_HINT_PATTERNS = [
    (re.compile(rf"\b{re.escape(kw)}\b", re.IGNORECASE), brand)
    for kw, brand in sorted(_DESC_BRAND_HINTS.items(), key=lambda x: len(x[0]), reverse=True)
]


class ManufacturerMatcher:
    """
    Attempts to resolve MANUFACTURER_NAME from available data.

    Priority order:
      1. Brand master list lookup (when available)
      2. Infer from Part_Desc brand hints
      3. Fall back to distributor name (from Part_Manuf) with low confidence
    """

    def match(
        self,
        part_manuf: str | None,
        part_desc: str | None,
        distributor_name: str | None,
        brand_master: pd.DataFrame | None = None,
    ) -> MatchResult:
        """
        Resolve the manufacturer name.

        Args:
            part_manuf:       Raw Part_Manuf value
            part_desc:        Raw Part_Desc value
            distributor_name: Already-parsed distributor name (from extractor)
            brand_master:     Optional master list DataFrame with columns
                             ['manufacturer_name', 'brand_name', 'code']
        """
        # Strategy 1: Brand master list (future)
        if brand_master is not None:
            result = self._match_from_master(distributor_name, brand_master)
            if result:
                return result

        # Strategy 2: No master list available -- use distributor name with
        # low confidence and flag for review
        if distributor_name:
            return MatchResult(
                value=distributor_name,
                confidence=0.3,
                rule="manufacturer_from_distributor_fallback",
                source=str(part_manuf),
                needs_review=True,
            )

        return MatchResult(
            value=None, confidence=0.0,
            rule="manufacturer_no_data",
            source=str(part_manuf),
            needs_review=True,
        )

    def _match_from_master(
        self, distributor_name: str | None, master: pd.DataFrame
    ) -> MatchResult | None:
        """
        Look up distributor name in brand master list.
        Returns None if no match found (so caller can try next strategy).

        This is a PLACEHOLDER for when UniCat_Manufacturer_and_Brand_List.xlsx
        is added to data/schemas/.
        """
        # TODO: Implement exact match, then fuzzy match against master list
        #       columns. For now, return None to fall through.
        return None


class BrandMatcher:
    """
    Attempts to resolve BRAND_NAME from available data.

    Priority order:
      1. Brand master list lookup (when available)
      2. Non-placeholder E1_Brand or DIB_Brand
      3. Infer from Part_Desc brand hints
      4. No match -> flag for human review
    """

    def match(
        self,
        e1_brand: str | None,
        dib_brand: str | None,
        part_desc: str | None,
        brand_master: pd.DataFrame | None = None,
    ) -> MatchResult:
        """
        Resolve the brand name.

        Args:
            e1_brand:     Cleaned E1_Brand (NaN if was placeholder)
            dib_brand:    Cleaned DIB_Brand (NaN if was placeholder)
            part_desc:    Raw Part_Desc value
            brand_master: Optional master list DataFrame
        """
        # Strategy 1: Brand master list (future)
        if brand_master is not None:
            # TODO: Implement when master list is available
            pass

        # Strategy 2: Use non-null E1_Brand
        if e1_brand and str(e1_brand) != "nan":
            return MatchResult(
                value=str(e1_brand).strip(),
                confidence=0.85,
                rule="brand_from_e1_brand",
                source=str(e1_brand),
            )

        # Strategy 3: Use non-null DIB_Brand
        if dib_brand and str(dib_brand) != "nan":
            return MatchResult(
                value=str(dib_brand).strip(),
                confidence=0.75,
                rule="brand_from_dib_brand",
                source=str(dib_brand),
            )

        # Strategy 4: Infer from Part_Desc keywords
        if part_desc:
            for pattern, brand in _BRAND_HINT_PATTERNS:
                if pattern.search(str(part_desc)):
                    return MatchResult(
                        value=brand,
                        confidence=0.6,
                        rule="brand_from_desc_hint",
                        source=str(part_desc),
                        needs_review=True,
                    )

        # No match
        return MatchResult(
            value=None, confidence=0.0,
            rule="brand_no_match",
            source="",
            needs_review=True,
        )


# -------------------------------------------------------------------------
# CLI entry point
# -------------------------------------------------------------------------
def main():
    from ai.enrichment.loader import load_raw
    from ai.enrichment.cleaner import ProductCleaner

    print("Manufacturer/Brand Matcher -- Quick Test")
    print("=" * 50)

    raw = load_raw()
    cleaner = ProductCleaner()
    cleaned = cleaner.clean(raw).data

    mfg_matcher = ManufacturerMatcher()
    brand_matcher = BrandMatcher()

    # Run on all rows
    mfg_results = []
    brand_results = []

    for _, row in cleaned.iterrows():
        # Simple distributor name extraction inline
        import re as _re
        m = _re.match(r"^(.+?)\s*\(([^)]+)\)\s*$", str(row["Part_Manuf"]))
        dist_name = m.group(1).strip() if m else (
            str(row["Part_Manuf"]).strip()
            if str(row["Part_Manuf"]).strip() != "-" else None
        )

        mfg_r = mfg_matcher.match(
            part_manuf=str(row["Part_Manuf"]),
            part_desc=str(row["Part_Desc"]),
            distributor_name=dist_name,
        )
        brand_r = brand_matcher.match(
            e1_brand=row.get("E1_Brand"),
            dib_brand=row.get("DIB_Brand"),
            part_desc=str(row["Part_Desc"]),
        )
        mfg_results.append(mfg_r)
        brand_results.append(brand_r)

    # Stats
    mfg_found = sum(1 for r in mfg_results if r.value is not None)
    mfg_review = sum(1 for r in mfg_results if r.needs_review)
    brand_found = sum(1 for r in brand_results if r.value is not None)
    brand_review = sum(1 for r in brand_results if r.needs_review)

    print(f"\nMANUFACTURER_NAME:")
    print(f"  Resolved: {mfg_found}/{len(mfg_results)}")
    print(f"  Needs human review: {mfg_review}/{len(mfg_results)}")

    print(f"\nBRAND_NAME:")
    print(f"  Resolved: {brand_found}/{len(brand_results)}")
    print(f"  Needs human review: {brand_review}/{len(brand_results)}")

    # Rule distribution
    from collections import Counter
    print(f"\nBrand resolution rules used:")
    for rule, count in Counter(r.rule for r in brand_results).most_common():
        print(f"  {rule}: {count}")


if __name__ == "__main__":
    main()
