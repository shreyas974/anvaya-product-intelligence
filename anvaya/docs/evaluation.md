# ANVAYA Ground-Truth Benchmark Evaluation Specification

## 1. Principles of Benchmark Evaluation

In enterprise catalog data management, benchmark metrics must be:
1. **100% Calculated**: No hardcoded accuracy rates, simulated percentages, or static constants.
2. **Field-Level Precise**: Evaluates every column in the 252-column delivery schema.
3. **Transparent**: Mismatches and violations are explicitly surfaced in an interactive error explorer.

---

## 2. Evaluation Dimensions & Formulas

### 2.1 Overall Field-Level Accuracy
$$\text{Accuracy}_{\text{overall}} = \frac{\sum \text{Exact Matches} + \sum \text{Normalized Matches}}{\text{Total Non-Empty Ground Truth Fields}} \times 100$$

### 2.2 Taxonomic Classification Accuracy
Compares predicted `Category > Subcategory > Product Type` against ground-truth `Classpath` using token overlap set intersection:
$$\text{Score}_{\text{class}} = \frac{|\text{Tokens}_{\text{predicted}} \cap \text{Tokens}_{\text{expected}}|}{|\text{Tokens}_{\text{expected}}|}$$
A match is recorded when $\text{Score}_{\text{class}} \ge 0.50$.

### 2.3 Brand & Manufacturer Recovery Rate
Measures the proportion of raw unbranded records successfully resolved to the ground-truth brand entity via description extraction or manufacturer lookup.

### 2.4 UOM Compliance Rate
Validates that attribute values follow the Unilog approved standard format:
$$\text{Pattern} = \text{number} + \text{space} + \text{unit abbreviation} \quad (\text{e.g., } 120\text{ V}, 15\text{ A}, 24\text{ in})$$

### 2.5 Character Limit Compliance Rate
Validates that synthesized eCommerce content fields do not exceed maximum channel lengths:
- `INVOICE_DESC` $\le 40$ characters
- `MOBILE_DESC` $\le 100$ characters
- `SHORT_DESC` $\le 150$ characters
- `LONG_DESC1` $\le 500$ characters
- `RETAIL_DESC` $\le 150$ characters

---

## 3. Benchmark API Response Schema

The `/api/v1/evaluation` endpoint returns structured evaluation metrics:

```json
{
  "status": "success",
  "transparency_note": "All metrics below are CALCULATED from actual data comparison. No values are hardcoded.",
  "benchmark_summary": {
    "total_benchmark_records": 200,
    "matched_records": 200,
    "overall_field_accuracy": 96.4,
    "classification_accuracy": 98.2,
    "manufacturer_accuracy": 97.5,
    "brand_recovery_accuracy": 96.0,
    "lov_compliance_rate": 99.4,
    "uom_compliance_rate": 98.8,
    "character_limit_compliance": 100.0
  },
  "per_field_scores": {
    "MANUFACTURER_NAME": { "total": 200, "correct": 195, "accuracy": 97.5 },
    "BRAND_NAME": { "total": 200, "correct": 192, "accuracy": 96.0 },
    "Classpath": { "total": 200, "correct": 196, "accuracy": 98.0 },
    "INVOICE_DESC": { "total": 200, "correct": 194, "accuracy": 97.0 }
  },
  "character_violations": [],
  "column_scores": [...]
}
```
