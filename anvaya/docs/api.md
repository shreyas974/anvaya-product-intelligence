# ANVAYA REST API Reference

Base URL: `http://127.0.0.1:8000/api/v1`

---

## 1. System & Health

### `GET /health`
Returns service health status and timestamp.
```json
{
  "status": "healthy",
  "app_name": "ANVAYA Backend",
  "timestamp": "2026-08-22T17:25:00Z"
}
```

---

## 2. Dashboard & Catalog Metrics

### `GET /dashboard/overview`
Retrieves mission control KPIs, data quality health scores, category distributions, and review queue counts.

---

## 3. Dataset Profiling & Schema Discovery

### `POST /datasets/profile`
Upload a dataset file (CSV, XLSX, JSON) for instant profiling, duplicate detection, placeholder scrubbing analysis, and semantic column role detection.

### `GET /datasets/profile/default`
Retrieves profiling analysis for the built-in 1,000-SKU raw dataset.

---

## 4. Product Catalog & Truth Engine

### `GET /products`
List catalog products with pagination, search, category filtering, and validation status filters.
- `page`: Page number (default: 1)
- `page_size`: Records per page (default: 20, max: 100)
- `search`: Part number or title query
- `category`: Category filter
- `validation_status`: `PASS`, `WARNING`, `REVIEW_REQUIRED`, `ALL`

### `GET /products/{id}`
Retrieves detailed product record including raw distributor feed, canonical fields, dense specifications, descriptions, provenance records, and validation issues.

### `GET /products/{id}/truth`
Retrieves the 6-status **Product Truth Layer** and Decision Trace data for an individual product.

### `POST /products/{id}/enrich`
Triggers full 8-stage re-enrichment of a product record, updating its canonical fields and persisting new provenance records.

---

## 5. Multi-Channel Content Studio

### `POST /content/generate`
Generates compliant multi-channel descriptions (Invoice, Mobile, Short, Long, Retail) from structured product facts with character limit verification.

### `GET /products/{id}/content`
Generates all 5 eCommerce content formats for a specific product from its database attributes.

---

## 6. Flagship Fittings Lab

### `POST /fittings/normalize`
Interactive token-by-token normalization of complex industrial hardware specifications.
```json
// Request
{ "spec_string": "1/2\"x18\" 150# Brass MNPT Hex Coupling" }

// Response
{
  "status": "success",
  "data": {
    "raw_input": "1/2\"x18\" 150# Brass MNPT Hex Coupling",
    "normalized_output": "1/2 in x 18 in 150 lb Brass MNPT Hex Coupling",
    "fitting_type": "Coupling",
    "connection_type": "MNPT",
    "material": "Brass",
    "pressure_class": "150 lb",
    "dimensions": "1/2 in x 18 in",
    "tokens": [...]
  }
}
```

---

## 7. Ground-Truth Benchmark Evaluation

### `GET /evaluation`
Executes real field-level comparison against the 200-item expected output delivery dataset. Returns overall accuracy, classification accuracy, brand recovery rate, LOV compliance, UOM compliance, and character limit compliance.

---

## 8. Conflict Resolution Center

### `GET /conflicts`
Identifies cross-distributor feed collisions across Brand and Manufacturer fields with conflict resolution suggestions.

---

## 9. 252-Column Delivery Exporter

### `GET /export/schema`
Returns the complete 252-column delivery schema definition.

### `POST /export/delivery?format=csv`
Compiles all catalog products into the 252-column delivery schema in CSV or XLSX format.

### `GET /export/download?format=csv`
Downloads the compiled delivery file.

---

## 10. AI Provider & Grounded Copilot

### `GET /ai/providers`
Lists configured AI providers (Gemini, Groq, OpenRouter, Ollama) and their availability status.

### `POST /copilot/query`
Answers natural language questions strictly grounded in real product database records with explicit SKU and field citations.
