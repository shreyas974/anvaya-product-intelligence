"""
runner.py -- EvaluationRunner for Anvaya Enrichment Pipeline

WHAT: Runs the enrichment pipeline on raw data and compares its output
      against the ground truth (expected_output_delivery_format.csv).
      Reports field-level accuracy per column and overall coverage.

WHY:  We need to measure how well the pipeline is doing BEFORE adding
      complexity. This gives us a baseline to improve against.

HOW:  1. Load raw data and run the pipeline.
      2. Load expected output and find matching rows by Mfg_Part_Num.
      3. For each matching row, compare every column: exact match, partial
         match (case-insensitive / substring), or mismatch.
      4. Report accuracy per column and overall.

NOTE: The expected output only has 2 rows, so this is a development/debugging
      tool, not a statistical evaluation. Still essential for catching regressions.
"""

import pandas as pd
import numpy as np
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class ColumnScore:
    """Accuracy metrics for a single output column."""
    column: str
    total: int          # rows where expected has a value
    exact_match: int    # pipeline output == expected (exact)
    partial_match: int  # case-insensitive or substring match
    mismatch: int       # pipeline produced wrong value
    missing: int        # pipeline produced NaN, expected had a value

    @property
    def accuracy(self) -> float:
        """Exact match accuracy (0.0 to 1.0)."""
        return self.exact_match / self.total if self.total > 0 else 0.0

    @property
    def coverage(self) -> float:
        """Fraction of expected values that pipeline attempted (non-NaN)."""
        attempted = self.exact_match + self.partial_match + self.mismatch
        return attempted / self.total if self.total > 0 else 0.0


@dataclass
class EvaluationReport:
    """Full evaluation report across all columns."""
    column_scores: list[ColumnScore] = field(default_factory=list)
    matched_rows: int = 0
    total_expected_rows: int = 0

    @property
    def overall_accuracy(self) -> float:
        """Weighted accuracy across all columns with expected values."""
        total = sum(s.total for s in self.column_scores)
        exact = sum(s.exact_match for s in self.column_scores)
        return exact / total if total > 0 else 0.0

    @property
    def overall_coverage(self) -> float:
        """Fraction of expected values the pipeline attempted."""
        total = sum(s.total for s in self.column_scores)
        attempted = sum(
            s.exact_match + s.partial_match + s.mismatch
            for s in self.column_scores
        )
        return attempted / total if total > 0 else 0.0

    def summary(self) -> str:
        """Human-readable evaluation summary."""
        lines = [
            "=" * 70,
            "  Anvaya Enrichment Pipeline -- Evaluation Report",
            "=" * 70,
            f"  Ground truth rows: {self.total_expected_rows}",
            f"  Matched rows:      {self.matched_rows}",
            f"  Overall accuracy:  {self.overall_accuracy:.1%}",
            f"  Overall coverage:  {self.overall_coverage:.1%}",
            "",
            "  Per-column results (only columns with expected values):",
            f"  {'Column':<45} {'Acc':>5} {'Cov':>5} {'Exact':>5} "
            f"{'Part':>5} {'Miss':>5} {'Wrong':>5}",
            "  " + "-" * 66,
        ]

        for s in sorted(self.column_scores, key=lambda x: x.column):
            if s.total == 0:
                continue
            lines.append(
                f"  {s.column:<45} {s.accuracy:>5.0%} {s.coverage:>5.0%} "
                f"{s.exact_match:>5} {s.partial_match:>5} {s.missing:>5} "
                f"{s.mismatch:>5}"
            )

        lines.append("=" * 70)
        return "\n".join(lines)


class EvaluationRunner:
    """
    Runs the pipeline and compares output against ground truth.
    """

    def __init__(self):
        from ai.enrichment.pipeline import EnrichmentPipeline
        self.pipeline = EnrichmentPipeline()

    def evaluate(
        self,
        raw: pd.DataFrame,
        expected: pd.DataFrame,
        join_key: str = "Mfg_Part_Num",
    ) -> EvaluationReport:
        """
        Run pipeline on raw data and compare against expected output.

        Args:
            raw:      Raw input DataFrame.
            expected: Ground truth DataFrame.
            join_key: Column to match rows between pipeline output and expected.

        Returns:
            EvaluationReport with per-column scores.
        """
        # Run the pipeline
        result = self.pipeline.run(raw)
        predicted = result.enriched_data

        # Find overlapping rows
        common_keys = set(predicted[join_key]) & set(expected[join_key])
        if not common_keys:
            return EvaluationReport(
                matched_rows=0,
                total_expected_rows=len(expected),
            )

        # Index both by join_key for easy lookup
        pred_indexed = predicted.set_index(join_key)
        exp_indexed = expected.set_index(join_key)

        # Compare each column
        column_scores = []
        for col in expected.columns:
            if col == join_key:
                continue
            if col not in predicted.columns:
                continue

            total = 0
            exact = 0
            partial = 0
            mismatch = 0
            missing = 0

            for key in common_keys:
                exp_val = exp_indexed.at[key, col]
                if pd.isna(exp_val):
                    continue  # no expected value -- skip

                total += 1
                pred_val = pred_indexed.at[key, col]

                if pd.isna(pred_val):
                    missing += 1
                elif str(pred_val).strip() == str(exp_val).strip():
                    exact += 1
                elif str(pred_val).strip().lower() == str(exp_val).strip().lower():
                    partial += 1
                elif str(exp_val).strip().lower() in str(pred_val).strip().lower():
                    partial += 1
                elif str(pred_val).strip().lower() in str(exp_val).strip().lower():
                    partial += 1
                else:
                    mismatch += 1

            column_scores.append(ColumnScore(
                column=col,
                total=total,
                exact_match=exact,
                partial_match=partial,
                mismatch=mismatch,
                missing=missing,
            ))

        return EvaluationReport(
            column_scores=column_scores,
            matched_rows=len(common_keys),
            total_expected_rows=len(expected),
        )


# -------------------------------------------------------------------------
# CLI entry point
# -------------------------------------------------------------------------
def main():
    from ai.enrichment.loader import load_raw, load_expected

    print("Anvaya Enrichment Pipeline -- Evaluation")
    print("=" * 70)

    raw = load_raw()
    expected = load_expected()

    runner = EvaluationRunner()
    report = runner.evaluate(raw, expected)
    print(report.summary())


if __name__ == "__main__":
    main()
