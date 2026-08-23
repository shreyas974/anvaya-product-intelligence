# ANVAYA Data Quality Rules

## Purpose

This document defines the validation rules used to determine whether
product data is complete, consistent, accurate, and ready for AI enrichment
or catalog approval.

The canonical product structure is defined in:

`data/schemas/product.schema.json`

---

## 1. Required Product Fields

Every product must contain:

- `id`
- `sku`
- `title`
- `description`
- `brand`
- `category`
- `price`
- `currency`
- `images`
- `attributes`
- `rawData`
- `qualityScore`
- `enrichmentStatus`
- `confidenceScore`
- `status`
- `timestamps`

Missing required fields should be reported as data-quality anomalies.

---

## 2. Product Identifier Rules

### Product ID

- Must be present.
- Must be unique within the catalog.
- Must be a non-empty string.

### SKU

- Must be present.
- Must be a non-empty string.
- Should uniquely identify the product.
- Duplicate SKUs should be flagged for investigation.

---

## 3. Text Field Rules

### Title

- Must not be empty.
- Should clearly identify the product.
- Should not contain excessive whitespace.
- Should not contain obvious placeholder values such as `N/A` or `unknown`.

### Description

- Must be present.
- Should provide meaningful product information.
- Empty or placeholder descriptions should reduce the quality score.

### Brand

- Must be present.
- Should use a normalized brand name.
- Case-only differences such as `SONY`, `Sony`, and `sony` should be normalized.

### Category

- Must be present.
- Should match the canonical taxonomy.
- Products assigned to invalid or unknown categories should be flagged.

---

## 4. Price and Currency Rules

### Price

- Must be numeric.
- Must be greater than or equal to `0`.
- Negative prices are invalid.
- Extremely unusual prices should be flagged as potential outliers.

### Currency

- Must be a valid ISO 4217 currency code.
- Examples include `INR`, `USD`, and `EUR`.
- Currency symbols such as `₹` or `$` should not be stored as the canonical currency value.

---

## 5. Image Rules

- `images` must be an array.
- Image references should contain valid URLs or approved asset references.
- Empty image arrays should reduce product completeness.
- Broken image references should be flagged for review.

---

## 6. Attribute Rules

Product attributes should:

- Use consistent attribute names.
- Use appropriate data types.
- Avoid unnecessary duplicate attributes.
- Use standardized units where applicable.
- Avoid storing multiple meanings in a single field.

Examples:

```text

## 7. Quality Score Rules

`qualityScore` must be between `0` and `100`.

| Score | Classification |
|---|---|
| 90–100 | Excellent |
| 75–89 | Good |
| 50–74 | Needs improvement |
| 0–49 | Poor |
Quality scores should consider:

- Completeness
- Consistency
- Accuracy
- Uniqueness

---

## 8. Confidence Score Rules

`confidenceScore` must be between `0.0` and `1.0`.

| Range | Classification |
|---|---|
| 0.90–1.00 | Very high confidence |
| 0.75–0.89 | High confidence |
| 0.50–0.74 | Moderate confidence |
| 0.00–0.49 | Low confidence |

AI-generated values below the configured confidence threshold should be eligible for manual review.

---

## 9. Enrichment Status Rules

Allowed enrichment states are:

- `pending`
- `in_progress`
- `enriched`
- `failed`
- `needs_review`

Rules:

- `pending` means enrichment has not started.
- `in_progress` means enrichment is currently running.
- `enriched` means enrichment completed successfully.
- `failed` means enrichment encountered an error.
- `needs_review` means enrichment requires human validation.

---

## 10. Product Status Rules

Allowed product lifecycle states are:

- `raw`
- `cleaned`
- `enriched`
- `flagged`
- `approved`

A product should not be marked `approved` when critical unresolved data-quality anomalies remain.

---

## 11. Duplicate Detection Rules

Potential duplicates should be identified using combinations of:

- SKU similarity
- Brand
- Product title similarity
- Category
- Key attributes
- Price similarity

High-confidence duplicate matches should be sent for review before merging or canonicalization.

---

## 12. Missing Attribute Rules

Missing attributes should be evaluated according to category requirements.

Each missing attribute may be classified as:

- `critical`
- `recommended`
- `optional`

Critical missing attributes should have a stronger impact on the product quality score.

---

## 13. Anomaly Severity

Data-quality anomalies should use these severity levels:

| Severity | Meaning |
|---|---|
| Critical | Major issue preventing reliable catalog use |
| High | Significant issue requiring prompt attention |
| Medium | Important issue that should be investigated |
| Low | Minor issue with limited impact |

---

## 14. Recommended Validation Pipeline

Product validation should follow this sequence:

1. Validate required fields.
2. Validate data types.
3. Validate ranges and allowed values.
4. Normalize text and categorical values.
5. Check category-specific attributes.
6. Detect duplicates.
7. Detect anomalies and outliers.
8. Calculate quality score.
9. Calculate confidence score.
10. Decide whether manual review is required.
11. Allow approval only when critical issues are resolved.

---

## 15. Data Traceability

Original source information should be preserved in `rawData`.

The system should retain enough source information to explain:

- Where a value originated.
- Whether it was normalized.
- Whether it was recovered by AI.
- What confidence was assigned.
- Whether the value was validated.

---

## 16. Ownership

Changes to these rules should be reviewed by the data/documentation team and communicated to the frontend, backend, AI, and QA teams.

The JSON Schema remains the machine-readable source of truth.

This document defines the operational quality rules applied around that schema.

