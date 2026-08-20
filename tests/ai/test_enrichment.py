"""
Tests for the deterministic enrichment components:
  - ProductCleaner
  - Field Extractor
  - ManufacturerMatcher / BrandMatcher
  - Schema validation
"""

import pytest
import pandas as pd
import numpy as np


# =========================================================================
# ProductCleaner tests
# =========================================================================
class TestProductCleaner:
    """Tests for ai.enrichment.cleaner.ProductCleaner."""

    def _make_row(self, **kwargs) -> pd.DataFrame:
        """Helper: create a 1-row DataFrame with default values."""
        defaults = {
            "Mfg_Part_Num": "TEST001",
            "Part_Desc": "Test Product Description",
            "E1_Brand": "-- Unbranded --",
            "Unilog_Brand": "-- No Unilog Brand --",
            "DIB_Brand": "-- No DIB Brand --",
            "Part_Manuf": "Test Manufacturer (TEST)",
        }
        defaults.update(kwargs)
        return pd.DataFrame([defaults])

    def test_placeholder_replaced_with_nan(self):
        """Placeholder brand values should become NaN after cleaning."""
        from ai.enrichment.cleaner import ProductCleaner

        df = self._make_row()
        result = ProductCleaner().clean(df)

        assert pd.isna(result.data.iloc[0]["E1_Brand"])
        assert pd.isna(result.data.iloc[0]["Unilog_Brand"])
        assert pd.isna(result.data.iloc[0]["DIB_Brand"])

    def test_real_brand_preserved(self):
        """Non-placeholder brand values should be preserved."""
        from ai.enrichment.cleaner import ProductCleaner

        df = self._make_row(E1_Brand="Diablo", DIB_Brand="DEWALT")
        result = ProductCleaner().clean(df)

        assert result.data.iloc[0]["E1_Brand"] == "Diablo"
        assert result.data.iloc[0]["DIB_Brand"] == "DEWALT"

    def test_whitespace_stripped(self):
        """Leading/trailing whitespace should be removed."""
        from ai.enrichment.cleaner import ProductCleaner

        df = self._make_row(Part_Manuf="  Freud Inc (2435)  ")
        result = ProductCleaner().clean(df)

        assert result.data.iloc[0]["Part_Manuf"] == "Freud Inc (2435)"

    def test_change_log_populated(self):
        """Changes should be tracked in the change log."""
        from ai.enrichment.cleaner import ProductCleaner

        df = self._make_row()  # has 3 placeholders
        result = ProductCleaner().clean(df)

        assert result.num_changes >= 3  # at least the 3 placeholder replacements
        rules = [c.rule for c in result.changes]
        assert "replace_placeholder" in rules

    def test_passthrough_columns_unchanged(self):
        """Mfg_Part_Num and Part_Desc should pass through unchanged."""
        from ai.enrichment.cleaner import ProductCleaner

        df = self._make_row(Mfg_Part_Num="ABC-123", Part_Desc="My Product")
        result = ProductCleaner().clean(df)

        assert result.data.iloc[0]["Mfg_Part_Num"] == "ABC-123"
        assert result.data.iloc[0]["Part_Desc"] == "My Product"

    def test_does_not_mutate_input(self):
        """Cleaning should not modify the original DataFrame."""
        from ai.enrichment.cleaner import ProductCleaner

        df = self._make_row()
        original_brand = df.iloc[0]["E1_Brand"]
        ProductCleaner().clean(df)

        assert df.iloc[0]["E1_Brand"] == original_brand  # unchanged


# =========================================================================
# Extractor tests
# =========================================================================
class TestExtractor:
    """Tests for ai.enrichment.extractor functions."""

    def test_distributor_parse_standard(self):
        """Standard 'Name (CODE)' format should parse correctly."""
        from ai.enrichment.extractor import extract_distributor_info

        name_r, code_r = extract_distributor_info("Freud Inc (2435)")
        assert name_r.value == "Freud Inc"
        assert code_r.value == "2435"
        assert name_r.confidence == 1.0

    def test_distributor_parse_alpha_code(self):
        """Alphabetic codes like (KICLI) should parse correctly."""
        from ai.enrichment.extractor import extract_distributor_info

        name_r, code_r = extract_distributor_info("Kichler Lighting (KICLI)")
        assert name_r.value == "Kichler Lighting"
        assert code_r.value == "KICLI"

    def test_distributor_parse_dash(self):
        """A dash '-' means no manufacturer data."""
        from ai.enrichment.extractor import extract_distributor_info

        name_r, code_r = extract_distributor_info("-")
        assert name_r.value is None
        assert code_r.value is None

    def test_mfg_part_number_passthrough(self):
        """MANUFACTURER_PART_NUMBER should equal Mfg_Part_Num."""
        from ai.enrichment.extractor import extract_manufacturer_part_number

        result = extract_manufacturer_part_number("PDSH4816AF")
        assert result.value == "PDSH4816AF"
        assert result.confidence == 1.0

    def test_product_name_dishwasher(self):
        """Should extract 'Dishwasher' from a dishwasher description."""
        from ai.enrichment.extractor import extract_product_name

        result = extract_product_name("PDSH4816AF Dishwasher SS - Display Only")
        assert result.value == "Dishwasher"
        assert result.confidence >= 0.8

    def test_product_name_sanding_belt(self):
        """Should extract 'Sanding Belt' from description."""
        from ai.enrichment.extractor import extract_product_name

        result = extract_product_name(
            'DCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc'
        )
        assert result.value == "Sanding Belt"

    def test_product_name_no_match(self):
        """Should return None when no product keyword matches."""
        from ai.enrichment.extractor import extract_product_name

        result = extract_product_name("XYZ123 Unknown Widget Thing")
        assert result.value is None
        assert result.confidence == 0.0

    def test_dimensions_wxh(self):
        """Should extract W x H dimensions."""
        from ai.enrichment.extractor import extract_dimensions

        results = extract_dimensions('Diablo 1/2"x18" Sanding Belt')
        dim_results = [r for r in results if r.rule == "dimension_wxh"]
        assert len(dim_results) == 1
        assert "1/2" in dim_results[0].value
        assert "18" in dim_results[0].value

    def test_piece_count(self):
        """Should extract piece count like '6pc'."""
        from ai.enrichment.extractor import extract_dimensions

        results = extract_dimensions("Sanding Belt 6pc")
        pc_results = [r for r in results if r.rule == "piece_count"]
        assert len(pc_results) == 1
        assert pc_results[0].value == "6"

    def test_grit_extraction(self):
        """Should extract grit value like 'P150'."""
        from ai.enrichment.extractor import extract_dimensions

        results = extract_dimensions("775L Stikit Film P150 Cubitron II")
        grit_results = [r for r in results if r.rule == "grit_value"]
        assert len(grit_results) == 1
        assert grit_results[0].value == "150"

    def test_invoice_desc_uppercased(self):
        """INVOICE_DESC should be uppercase."""
        from ai.enrichment.extractor import extract_invoice_desc

        result = extract_invoice_desc("PDSH4816AF Dishwasher SS")
        assert result.value == "DISHWASHER SS"
        assert result.value == result.value.upper()

    def test_extraction_result_status(self):
        """ExtractionResult.status should reflect confidence threshold."""
        from ai.enrichment.extractor import ExtractionResult

        high = ExtractionResult("x", 0.9, "r", "c", "v")
        low = ExtractionResult("x", 0.3, "r", "c", "v")
        assert high.status == "AUTO_APPROVED"
        assert low.status == "HUMAN_REVIEW_REQUIRED"


# =========================================================================
# Matcher tests
# =========================================================================
class TestMatchers:
    """Tests for ai.enrichment.matcher."""

    def test_brand_from_e1_brand(self):
        """BrandMatcher should prefer E1_Brand when available."""
        from ai.enrichment.matcher import BrandMatcher

        result = BrandMatcher().match(
            e1_brand="Diablo", dib_brand=None, part_desc="Some product"
        )
        assert result.value == "Diablo"
        assert result.rule == "brand_from_e1_brand"
        assert result.confidence >= 0.8

    def test_brand_from_dib_brand(self):
        """BrandMatcher should use DIB_Brand when E1_Brand is NaN."""
        from ai.enrichment.matcher import BrandMatcher

        result = BrandMatcher().match(
            e1_brand=np.nan, dib_brand="DEWALT", part_desc="Some product"
        )
        assert result.value == "DEWALT"
        assert result.rule == "brand_from_dib_brand"

    def test_brand_from_desc_hint(self):
        """BrandMatcher should infer brand from Part_Desc keywords."""
        from ai.enrichment.matcher import BrandMatcher

        result = BrandMatcher().match(
            e1_brand=np.nan, dib_brand=np.nan,
            part_desc="49-94-0501 Milw Metal Grinding Wheel"
        )
        assert result.value == "Milwaukee"
        assert result.rule == "brand_from_desc_hint"

    def test_brand_no_match(self):
        """BrandMatcher should return None when nothing matches."""
        from ai.enrichment.matcher import BrandMatcher

        result = BrandMatcher().match(
            e1_brand=np.nan, dib_brand=np.nan,
            part_desc="Unknown widget XYZ"
        )
        assert result.value is None
        assert result.needs_review is True

    def test_manufacturer_fallback_to_distributor(self):
        """ManufacturerMatcher should use distributor name with low confidence."""
        from ai.enrichment.matcher import ManufacturerMatcher

        result = ManufacturerMatcher().match(
            part_manuf="Freud Inc (2435)",
            part_desc="Diablo Belt",
            distributor_name="Freud Inc",
        )
        assert result.value == "Freud Inc"
        assert result.confidence < 0.5  # low confidence for fallback
        assert result.needs_review is True

    def test_manufacturer_no_data(self):
        """ManufacturerMatcher with no data should return None."""
        from ai.enrichment.matcher import ManufacturerMatcher

        result = ManufacturerMatcher().match(
            part_manuf="-", part_desc="Something",
            distributor_name=None,
        )
        assert result.value is None

    def test_match_result_status(self):
        """MatchResult.status should reflect confidence threshold."""
        from ai.enrichment.matcher import MatchResult

        high = MatchResult("x", 0.9, "r", "s")
        low = MatchResult("x", 0.3, "r", "s")
        assert high.status == "AUTO_APPROVED"
        assert low.status == "HUMAN_REVIEW_REQUIRED"


# =========================================================================
# Schema tests
# =========================================================================
class TestSchema:
    """Tests for ai.enrichment.schema."""

    def test_all_columns_categorized_once(self):
        """Every output column should appear in exactly one category."""
        from ai.enrichment.schema import (
            PASSTHROUGH_COLUMNS, CLEAN_COLUMNS, DETERMINISTIC_COLUMNS,
            AI_ENRICHMENT_COLUMNS, EXTERNAL_DATA_COLUMNS, OUTPUT_COLUMN_ORDER,
        )

        all_cats = (
            PASSTHROUGH_COLUMNS + CLEAN_COLUMNS + DETERMINISTIC_COLUMNS
            + AI_ENRICHMENT_COLUMNS + EXTERNAL_DATA_COLUMNS
        )
        assert len(all_cats) == len(OUTPUT_COLUMN_ORDER)
        assert set(all_cats) == set(OUTPUT_COLUMN_ORDER)

        # No duplicates
        assert len(all_cats) == len(set(all_cats))

    def test_output_column_order_has_252(self):
        """Output schema should have exactly 252 columns."""
        from ai.enrichment.schema import OUTPUT_COLUMN_ORDER
        assert len(OUTPUT_COLUMN_ORDER) == 252

    def test_columns_for_phase(self):
        """columns_for_phase should return non-empty lists for phases 1-3."""
        from ai.enrichment.schema import columns_for_phase

        assert len(columns_for_phase(1)) > 0
        assert len(columns_for_phase(2)) > 0
        assert len(columns_for_phase(3)) > 0

    def test_brand_placeholders_are_frozenset(self):
        """BRAND_PLACEHOLDERS should be an immutable set."""
        from ai.enrichment.schema import BRAND_PLACEHOLDERS

        assert isinstance(BRAND_PLACEHOLDERS, frozenset)
        assert "-- Unbranded --" in BRAND_PLACEHOLDERS


# =========================================================================
# AI / Semantic components tests
# =========================================================================
class TestAIComponents:
    """Tests for SemanticMatcher, CategoryClassifier, and DescriptionGenerator."""

    def test_semantic_matcher_accuracy(self):
        """SemanticMatcher should match queries to correct semantic category."""
        from ai.embeddings.semantic_matcher import SemanticMatcher

        candidates = [
            "Appliances > Kitchen Appliances > Built-In Dishwashers",
            "Tools & Hardware > Power Tools > Grinders",
            "Building Materials > Decking",
        ]
        matcher = SemanticMatcher(candidates)
        matches = matcher.match_one("WDTS7024RZ Dishwasher SS - Display Only")
        assert len(matches) == 1
        assert "Dishwashers" in matches[0].target
        assert matches[0].score > 0.40

    def test_category_classifier_dishwasher(self):
        """CategoryClassifier should predict Appliances/Dishwashers."""
        from ai.classification.classifier import CategoryClassifier

        classifier = CategoryClassifier()
        result = classifier.classify_one("PDSH4816AF Dishwasher SS - Display Only", "Dishwasher")
        assert result.dept == "Appliances"
        assert result.fine == "Dishwashers"
        assert "Dishwashers" in result.classpath
        assert result.confidence > 0.35

    def test_category_classifier_batch(self):
        """CategoryClassifier should handle batches consistently."""
        from ai.classification.classifier import CategoryClassifier

        classifier = CategoryClassifier()
        results = classifier.classify_batch(
            descriptions=[
                "PDSH4816AF Dishwasher SS",
                "49-94-0501 Milw 4\"x1/4\" Metal Grinding Wheel",
            ],
            product_names=["Dishwasher", "Grinding Wheel"],
        )
        assert len(results) == 2
        assert results[0].dept == "Appliances"
        assert results[1].dept == "Tools & Hardware"

    def test_description_generator(self):
        """DescriptionGenerator should produce all 4 standard descriptions."""
        from ai.enrichment.description_generator import DescriptionGenerator

        gen = DescriptionGenerator().generate(
            mfg_part_num="PDSH4816AF",
            part_desc="PDSH4816AF Dishwasher SS",
            brand_name="FRIGIDAIRE",
            mfg_name="Rheem Manufacturing",
            product_name="Dishwasher",
            dimensions="24 in W x 24 in D",
        )
        assert "FRIGIDAIRE" in gen.short_desc
        assert "PDSH4816AF" in gen.short_desc
        assert "FRIGIDAIRE" in gen.retail_desc
        assert "Rheem Manufacturing" in gen.mobile_desc
        assert len(gen.long_desc1) > 20

    def test_pipeline_end_to_end_shape(self):
        """Full pipeline run should produce 252 columns and preserve row count."""
        from ai.enrichment.pipeline import EnrichmentPipeline

        raw_df = pd.DataFrame([{
            "Mfg_Part_Num": "WDTS7024RZ",
            "Part_Desc": "WDTS7024RZ Dishwasher SS - Display Only",
            "E1_Brand": "-- Unbranded --",
            "Unilog_Brand": "-- No Unilog Brand --",
            "DIB_Brand": "-- No DIB Brand --",
            "Part_Manuf": "Appliance Dealers Cooperative (APPDE)",
        }])
        pipeline = EnrichmentPipeline()
        output = pipeline.run(raw_df)

        assert len(output.enriched_data) == 1
        assert len(output.enriched_data.columns) == 252
        assert output.enriched_data.iloc[0]["Mfg_Part_Num"] == "WDTS7024RZ"
        assert output.enriched_data.iloc[0]["Dept"] == "Appliances"
        assert output.enriched_data.iloc[0]["Fine"] == "Dishwashers"
        assert pd.isna(output.enriched_data.iloc[0]["E1_Brand"])  # cleaned!


# =========================================================================
# Quality & Attribute Extraction tests
# =========================================================================
class TestQualityAndAttributes:
    """Tests for UOMNormalizer, LOVValidator, AttributeExtractor, and ConfidenceScorer."""

    def test_uom_normalizer_canonical(self):
        """UOMNormalizer should convert common unit strings to approved canonical forms."""
        from ai.quality.uom_normalizer import UOMNormalizer

        norm = UOMNormalizer()
        assert norm.normalize('"').normalized_uom == "in"
        assert norm.normalize("inches").normalized_uom == "in"
        assert norm.normalize("volts").normalized_uom == "V"
        assert norm.normalize("amps").normalized_uom == "A"
        assert norm.normalize("dba").normalized_uom == "dBA"

    def test_lov_validator(self):
        """LOVValidator should validate exact, case-insensitive, and substring matches."""
        from ai.quality.lov_validator import LOVValidator

        validator = LOVValidator()
        res_exact = validator.validate("Material", "Stainless Steel")
        assert res_exact.is_valid is True
        assert res_exact.validated_value == "Stainless Steel"

        res_case = validator.validate("Mounting Type", "built-in")
        assert res_case.is_valid is True
        assert res_case.validated_value == "Built-in"

        res_bad = validator.validate("Material", "Alien Vibranium")
        assert res_bad.is_valid is False

    def test_attribute_extractor(self):
        """AttributeExtractor should extract Voltage, Amperage, Sound, Material triplets."""
        from ai.extraction.attribute_extractor import AttributeExtractor

        extractor = AttributeExtractor()
        text = "WDTS7024RZ Dishwasher 120V 10A 41 dBA Stainless Steel Built-in"
        triplets = extractor.extract_triplets(text)

        labels = [t.label for t in triplets]
        assert "Voltage Rating" in labels
        assert "Amperage Rating" in labels
        assert "Sound Level" in labels
        assert "Material" in labels
        assert "Mounting Type" in labels

    def test_confidence_scorer(self):
        """ConfidenceScorer should accurately assess record quality."""
        from ai.quality.confidence_scorer import ConfidenceScorer

        scorer = ConfidenceScorer()
        good_record = {
            "BRAND_NAME": "Whirlpool",
            "Dept": "Appliances",
            "Fine": "Dishwashers",
            "Product Name": "Dishwasher",
            "MANUFACTURER_NAME": "Whirlpool Corporation",
        }
        res_good = scorer.evaluate_record(good_record)
        assert res_good.status == "AUTO_APPROVED"
        assert res_good.overall_confidence >= 0.75

        bad_record = {
            "BRAND_NAME": None,
            "Dept": None,
            "Fine": None,
            "Product Name": None,
            "MANUFACTURER_NAME": None,
        }
        res_bad = scorer.evaluate_record(bad_record)
        assert res_bad.status == "HUMAN_REVIEW_REQUIRED"
        assert res_bad.overall_confidence == 0.0


