"""
cleaner.py -- ProductCleaner for Anvaya Enrichment Pipeline

WHAT: Takes a raw DataFrame row (or batch) and returns a cleaned version.
      "Cleaning" = mechanical data-quality fixes, no AI judgment.

WHY:  Raw data has known issues:
      - Brand columns contain placeholder strings ("-- Unbranded --", etc.)
        that look like real values but mean "empty".
      - Text fields may have inconsistent whitespace.
      The rest of the pipeline should not worry about these -- the cleaner
      handles them once, at the top of the pipeline.

HOW:  1. Replace placeholder brand values with NaN (empty).
      2. Strip leading/trailing whitespace from all string columns.
      3. Return the cleaned DataFrame plus a change log for traceability.

EXAMPLE:
      Input:  E1_Brand = "-- Unbranded --"    -> Output: E1_Brand = NaN
      Input:  Part_Manuf = "  Freud Inc (2435) " -> Output: "Freud Inc (2435)"
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field

from ai.enrichment.schema import BRAND_PLACEHOLDERS, CLEAN_COLUMNS


# -------------------------------------------------------------------------
# Change log entry -- one per cell that was modified
# -------------------------------------------------------------------------
@dataclass
class CleaningChange:
    """Records a single cleaning action for traceability."""
    row_index: int
    column: str
    original_value: str
    cleaned_value: str | None   # None means "set to NaN"
    rule: str                   # which cleaning rule triggered this

    def __str__(self) -> str:
        cleaned_display = self.cleaned_value if self.cleaned_value is not None else "<empty>"
        return (
            f"Row {self.row_index}, {self.column}: "
            f"'{self.original_value}' -> '{cleaned_display}' [{self.rule}]"
        )


# -------------------------------------------------------------------------
# ProductCleaner
# -------------------------------------------------------------------------
@dataclass
class CleaningResult:
    """Holds the cleaned DataFrame and the change log."""
    data: pd.DataFrame
    changes: list[CleaningChange] = field(default_factory=list)

    @property
    def num_changes(self) -> int:
        return len(self.changes)

    def summary(self) -> str:
        """Human-readable summary of all changes."""
        if not self.changes:
            return "No changes made during cleaning."
        lines = [f"Cleaning made {self.num_changes} change(s):"]
        # Group by rule
        rules: dict[str, int] = {}
        for c in self.changes:
            rules[c.rule] = rules.get(c.rule, 0) + 1
        for rule, count in sorted(rules.items()):
            lines.append(f"  {rule}: {count} change(s)")
        return "\n".join(lines)


class ProductCleaner:
    """
    Cleans raw product data by applying deterministic rules.

    Rules applied (in order):
      1. strip_whitespace  -- trim leading/trailing spaces from all strings
      2. replace_placeholders -- replace known placeholder brand values with NaN
    """

    # Columns to check for placeholder values
    BRAND_COLUMNS = ["E1_Brand", "Unilog_Brand", "DIB_Brand"]

    def clean(self, df: pd.DataFrame) -> CleaningResult:
        """
        Clean the input DataFrame.

        Args:
            df: Raw input DataFrame (not modified in-place).

        Returns:
            CleaningResult with the cleaned DataFrame and a change log.
        """
        # Work on a copy so we never mutate the caller's data
        cleaned = df.copy()
        changes: list[CleaningChange] = []

        # --- Rule 1: Strip whitespace from all string columns ---
        for col in cleaned.columns:
            if pd.api.types.is_string_dtype(cleaned[col]) or cleaned[col].dtype == object:  # string columns
                stripped = cleaned[col].astype(str).str.strip()
                # Handle cases where original was NaN/None
                is_na = cleaned[col].isna()
                stripped = stripped.mask(is_na, cleaned[col])
                # Find rows where stripping changed the value
                mask = (cleaned[col] != stripped) & cleaned[col].notna()
                for idx in cleaned.index[mask]:
                    changes.append(CleaningChange(
                        row_index=idx,
                        column=col,
                        original_value=str(cleaned.at[idx, col]),
                        cleaned_value=str(stripped.at[idx]),
                        rule="strip_whitespace",
                    ))
                cleaned[col] = stripped

        # --- Rule 2: Replace placeholder brand values with NaN ---
        for col in self.BRAND_COLUMNS:
            if col not in cleaned.columns:
                continue
            mask = cleaned[col].isin(BRAND_PLACEHOLDERS)
            for idx in cleaned.index[mask]:
                changes.append(CleaningChange(
                    row_index=idx,
                    column=col,
                    original_value=str(cleaned.at[idx, col]),
                    cleaned_value=None,
                    rule="replace_placeholder",
                ))
            cleaned.loc[mask, col] = np.nan

        return CleaningResult(data=cleaned, changes=changes)


# -------------------------------------------------------------------------
# CLI entry point for quick testing
# -------------------------------------------------------------------------
def main():
    from ai.enrichment.loader import load_raw

    print("ProductCleaner -- Quick Test")
    print("=" * 50)

    raw = load_raw()
    cleaner = ProductCleaner()
    result = cleaner.clean(raw)

    print(f"\nInput:  {len(raw)} rows x {len(raw.columns)} columns")
    print(f"Output: {len(result.data)} rows x {len(result.data.columns)} columns")
    print()
    print(result.summary())

    # Show a few example changes
    print("\nFirst 10 changes:")
    for change in result.changes[:10]:
        print(f"  {change}")

    # Show brand column stats before/after
    print("\nBrand column stats (non-null counts):")
    for col in ProductCleaner.BRAND_COLUMNS:
        raw_count = raw[col].notna().sum()
        clean_count = result.data[col].notna().sum()
        print(f"  {col}: {raw_count} -> {clean_count} "
              f"({raw_count - clean_count} placeholders removed)")


if __name__ == "__main__":
    main()
