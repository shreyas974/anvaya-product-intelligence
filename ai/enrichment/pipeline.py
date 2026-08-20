"""
pipeline.py -- EnrichmentPipeline orchestrator for Anvaya

WHAT: Chains the cleaning, extraction, and matching stages in sequence.
      Reads raw data, runs each stage, writes results to data/cleaned/
      and data/processed/.

WHY:  One command to run the full pipeline end-to-end. Also provides a
      clean function interface that a future API can call for single-record
      or batch enrichment.

HOW:  raw CSV -> ProductCleaner -> Extractor -> Matchers -> enriched DataFrame
      Each stage's output feeds the next. Change logs from all stages are
      collected into a single traceability report.

USAGE:
    # Run full pipeline from CLI:
    python -m ai.enrichment.pipeline

    # Call from code (single record or batch):
    from ai.enrichment.pipeline import EnrichmentPipeline
    pipeline = EnrichmentPipeline()
    result = pipeline.run(df)  # returns EnrichmentOutput
"""

import pandas as pd
import numpy as np
from pathlib import Path
from dataclasses import dataclass, field
from datetime import datetime

from ai.enrichment.schema import (
    PASSTHROUGH_COLUMNS, OUTPUT_COLUMN_ORDER, BRAND_PLACEHOLDERS,
)
from ai.enrichment.cleaner import ProductCleaner, CleaningResult
from ai.enrichment.extractor import (
    extract_all, extract_distributor_info, extract_product_name,
    extract_invoice_desc, extract_manufacturer_part_number,
)
from ai.enrichment.matcher import ManufacturerMatcher, BrandMatcher
from ai.classification.classifier import CategoryClassifier
from ai.enrichment.description_generator import DescriptionGenerator
from ai.extraction.attribute_extractor import AttributeExtractor
from ai.quality.confidence_scorer import ConfidenceScorer


# -------------------------------------------------------------------------
# Pipeline output
# -------------------------------------------------------------------------
@dataclass
class EnrichmentOutput:
    """Complete output of the enrichment pipeline."""
    enriched_data: pd.DataFrame       # the enriched records
    cleaning_result: CleaningResult    # cleaning stage details
    stats: dict = field(default_factory=dict)
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

    def summary(self) -> str:
        """Human-readable pipeline summary."""
        lines = [
            "=" * 60,
            "  Anvaya Enrichment Pipeline -- Run Summary",
            f"  Timestamp: {self.timestamp}",
            "=" * 60,
            f"  Input rows:  {self.stats.get('input_rows', '?')}",
            f"  Output rows: {self.stats.get('output_rows', '?')}",
            f"  Output cols: {self.stats.get('output_cols', '?')}",
            "",
            "  Cleaning:",
            f"    {self.cleaning_result.summary()}",
            "",
            "  Extraction & Quality:",
            f"    Product Name resolved:  {self.stats.get('product_name_filled', 0)}"
            f" / {self.stats.get('input_rows', 0)}",
            f"    Dimensions extracted:   {self.stats.get('dims_filled', 0)}"
            f" / {self.stats.get('input_rows', 0)}",
            f"    Attributes extracted:   {self.stats.get('attributes_extracted', 0)}"
            f" across all items",
            "",
            "  Matching:",
            f"    Manufacturer resolved:  {self.stats.get('mfg_resolved', 0)}"
            f" / {self.stats.get('input_rows', 0)}",
            f"    Brand resolved:         {self.stats.get('brand_resolved', 0)}"
            f" / {self.stats.get('input_rows', 0)}",
            f"    Needs human review:     {self.stats.get('needs_review', 0)}"
            f" / {self.stats.get('input_rows', 0)}",
            "",
            "  AI Classification & Generation:",
            f"    Classified categories:  {self.stats.get('classified_rows', 0)}"
            f" / {self.stats.get('input_rows', 0)}",
            f"    Descriptions generated: {self.stats.get('descriptions_generated', 0)}"
            f" / {self.stats.get('input_rows', 0)}",
            "",
            f"  Columns populated (non-null in any row):",
            f"    {self.stats.get('cols_with_data', 0)} / {self.stats.get('output_cols', 0)}",
            "=" * 60,
        ]
        return "\n".join(lines)


# -------------------------------------------------------------------------
# EnrichmentPipeline
# -------------------------------------------------------------------------
class EnrichmentPipeline:
    """
    Orchestrates the full hybrid AI + deterministic enrichment pipeline.

    Stages:
      1. CLEAN:     ProductCleaner removes placeholders, trims whitespace
      2. EXTRACT:   Deterministic parsing of Part_Desc and Part_Manuf
      3. MATCH:     Manufacturer and brand resolution
      4. CLASSIFY:  Semantic embedding taxonomy classifier (Dept, Class, Fine, Classpath)
      5. GENERATE:  Standardized commercial & technical descriptions
      6. ATTRIBUTES: Extract, validate, and normalize structured attribute triplets
      7. QUALITY:   Calculate quality confidence score and governance status
      8. ASSEMBLE:  Combine all results into the 252-column output schema
    """

    def __init__(self, use_kimi: bool = False, kimi_api_key: str | None = None):
        self.cleaner = ProductCleaner()
        self.mfg_matcher = ManufacturerMatcher()
        self.brand_matcher = BrandMatcher()
        self.classifier = CategoryClassifier()
        self.desc_generator = DescriptionGenerator(use_kimi=use_kimi, kimi_api_key=kimi_api_key)
        self.attr_extractor = AttributeExtractor()
        self.confidence_scorer = ConfidenceScorer()

    def run(self, df: pd.DataFrame) -> EnrichmentOutput:
        """
        Run the full pipeline on a DataFrame.

        This is the main entry point -- callable from CLI, API, or tests.

        Args:
            df: Raw input DataFrame with columns matching RAW_INPUT_COLUMNS.

        Returns:
            EnrichmentOutput with enriched data and statistics.
        """
        input_rows = len(df)

        # ----- Stage 1: CLEAN -----
        cleaning_result = self.cleaner.clean(df)
        cleaned = cleaning_result.data

        # ----- Stage 2: EXTRACT -----
        extracted = extract_all(cleaned)

        # ----- Stage 3: MATCH -----
        mfg_names = []
        brand_names = []
        review_flags = []

        for _, row in extracted.iterrows():
            # Manufacturer matching
            mfg_r = self.mfg_matcher.match(
                part_manuf=str(row["Part_Manuf"]),
                part_desc=str(row["Part_Desc"]),
                distributor_name=row.get("_distributor_name"),
            )
            mfg_names.append(mfg_r.value)

            # Brand matching
            brand_r = self.brand_matcher.match(
                e1_brand=row.get("E1_Brand"),
                dib_brand=row.get("DIB_Brand"),
                part_desc=str(row["Part_Desc"]),
            )
            brand_names.append(brand_r.value)

            # Any stage flagging review?
            review_flags.append(mfg_r.needs_review or brand_r.needs_review)

        extracted["MANUFACTURER_NAME"] = mfg_names
        extracted["BRAND_NAME"] = brand_names

        # ----- Stage 4: CLASSIFY (Semantic AI) -----
        cls_results = self.classifier.classify_batch(
            descriptions=extracted["Part_Desc"].tolist(),
            product_names=extracted["Product Name"].tolist(),
        )
        extracted["Dept"] = [r.dept for r in cls_results]
        extracted["Class"] = [r.class_name for r in cls_results]
        extracted["Fine"] = [r.fine for r in cls_results]
        extracted["Classpath"] = [r.classpath for r in cls_results]

        for i, r in enumerate(cls_results):
            if r.status == "HUMAN_REVIEW_REQUIRED":
                review_flags[i] = True

        # ----- Stage 5: GENERATE DESCRIPTIONS (Kimi / Generative AI) -----
        short_descs = []
        long_descs = []
        retail_descs = []
        mobile_descs = []
        marketing_descs = []
        feature_dict = {f"ITEM_FEATURES_{i}": [None] * input_rows for i in range(1, 21)}

        for row_idx, (_, row) in enumerate(extracted.iterrows()):
            gen = self.desc_generator.generate(
                mfg_part_num=str(row["Mfg_Part_Num"]),
                part_desc=str(row["Part_Desc"]),
                brand_name=row.get("BRAND_NAME"),
                mfg_name=row.get("MANUFACTURER_NAME"),
                product_name=row.get("Product Name"),
                dimensions=row.get("_extracted_dimensions"),
                category=row.get("Classpath"),
            )
            short_descs.append(gen.short_desc)
            long_descs.append(gen.long_desc1)
            retail_descs.append(gen.retail_desc)
            mobile_descs.append(gen.mobile_desc)
            marketing_descs.append(gen.marketing_description)
            for f_idx, feat in enumerate((gen.item_features or [])[:20], start=1):
                feature_dict[f"ITEM_FEATURES_{f_idx}"][row_idx] = feat

        extracted["SHORT_DESC"] = short_descs
        extracted["LONG_DESC1"] = long_descs
        extracted["RETAIL_DESC"] = retail_descs
        extracted["MOBILE_DESC"] = mobile_descs
        extracted["MARKETING_DESCRIPTION"] = marketing_descs
        feat_df = pd.DataFrame(feature_dict, index=extracted.index)
        extracted = pd.concat([extracted, feat_df], axis=1)

        # ----- Stage 6: STRUCTURED ATTRIBUTE TRIPLETS -----
        # Pre-allocate dictionary of lists for all 50 triplets
        attr_dict = {}
        for i in range(1, 51):
            attr_dict[f"ATTRIBUTE_LABEL {i}"] = [None] * input_rows
            attr_dict[f"ATTRIBUTE_VALUE {i}"] = [None] * input_rows
            attr_dict[f"ATTRIBUTE_UOM {i}"] = [None] * input_rows

        total_extracted_attributes = 0
        for row_idx, (_, row) in enumerate(extracted.iterrows()):
            triplets = self.attr_extractor.extract_triplets(
                part_desc=str(row["Part_Desc"]),
                extra_text=str(row.get("LONG_DESC1", "")),
            )
            total_extracted_attributes += len(triplets)
            for t_idx, triplet in enumerate(triplets[:50], start=1):
                attr_dict[f"ATTRIBUTE_LABEL {t_idx}"][row_idx] = triplet.label
                attr_dict[f"ATTRIBUTE_VALUE {t_idx}"][row_idx] = triplet.value
                attr_dict[f"ATTRIBUTE_UOM {t_idx}"][row_idx] = triplet.uom if triplet.uom else None

        attr_df = pd.DataFrame(attr_dict, index=extracted.index)
        extracted = pd.concat([extracted, attr_df], axis=1)

        # ----- Stage 7: QUALITY ASSESSMENT -----
        quality_scores = []
        for _, row in extracted.iterrows():
            assessment = self.confidence_scorer.evaluate_record(row)
            quality_scores.append(assessment.overall_confidence)

        extracted["_quality_confidence"] = quality_scores
        extracted["_needs_review"] = review_flags

        # ----- Stage 8: ASSEMBLE into output schema -----
        enriched = self._assemble_output(extracted)

        # ----- Statistics -----
        stats = {
            "input_rows": input_rows,
            "output_rows": len(enriched),
            "output_cols": len(enriched.columns),
            "product_name_filled": enriched["Product Name"].notna().sum(),
            "dims_filled": extracted["_extracted_dimensions"].notna().sum(),
            "attributes_extracted": total_extracted_attributes,
            "mfg_resolved": sum(1 for v in mfg_names if v is not None),
            "brand_resolved": sum(1 for v in brand_names if v is not None),
            "classified_rows": sum(1 for r in cls_results if r.dept != ""),
            "descriptions_generated": sum(1 for s in short_descs if s != ""),
            "needs_review": sum(review_flags),
            "cols_with_data": sum(
                1 for c in enriched.columns if enriched[c].notna().any()
            ),
        }

        return EnrichmentOutput(
            enriched_data=enriched,
            cleaning_result=cleaning_result,
            stats=stats,
        )

    def enrich_single(self, record: dict) -> dict:
        """
        Enrich a single record (dict -> dict).

        Convenience method for future API integration.

        Args:
            record: Dict with keys matching RAW_INPUT_COLUMNS.

        Returns:
            Dict with all 252 output columns.
        """
        df = pd.DataFrame([record])
        result = self.run(df)
        return result.enriched_data.iloc[0].to_dict()

    def _assemble_output(self, extracted: pd.DataFrame) -> pd.DataFrame:
        """
        Map extracted/matched/generated columns into the full 252-column output schema.
        Columns that can't be populated yet are left as NaN.
        """
        # Build all columns at once in a dict for efficiency
        all_columns = {}
        for col in OUTPUT_COLUMN_ORDER:
            if col in extracted.columns:
                all_columns[col] = extracted[col].values
            else:
                all_columns[col] = np.nan

        return pd.DataFrame(all_columns, index=extracted.index)


# -------------------------------------------------------------------------
# Paths
# -------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
CLEANED_DIR = REPO_ROOT / "data" / "cleaned"
PROCESSED_DIR = REPO_ROOT / "data" / "processed"


# -------------------------------------------------------------------------
# CLI entry point
# -------------------------------------------------------------------------
def main():
    from ai.enrichment.loader import load_raw

    print("Anvaya Enrichment Pipeline")
    print("=" * 60)

    # Load
    raw = load_raw()
    print(f"Loaded {len(raw)} rows from raw input")

    # Run pipeline
    pipeline = EnrichmentPipeline()
    result = pipeline.run(raw)

    # Print summary
    print(result.summary())

    # Save outputs
    CLEANED_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    cleaned_path = CLEANED_DIR / "cleaned_products.csv"
    processed_path = PROCESSED_DIR / "enriched_products.csv"

    result.cleaning_result.data.to_csv(cleaned_path, index=False)
    result.enriched_data.to_csv(processed_path, index=False)

    print(f"\nOutputs saved:")
    print(f"  Cleaned:  {cleaned_path}")
    print(f"  Enriched: {processed_path}")


if __name__ == "__main__":
    main()
