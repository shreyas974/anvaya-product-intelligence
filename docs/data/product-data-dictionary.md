# ANVAYA Product Data Dictionary

## Purpose

This document explains the canonical product data contract used by the
ANVAYA Product Intelligence platform.

The source of truth is:

`data/schemas/product.schema.json`

This document helps the frontend, backend, AI, data, and QA teams understand
what each product field means.

---

## Product Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | Yes | Unique identifier for the product. |
| `sku` | string | Yes | Stock Keeping Unit identifying the product. |
| `title` | string | Yes | Canonical product title. |
| `description` | string | Yes | Canonical product description. |
| `brand` | string | Yes | Normalized product brand. |
| `category` | string | Yes | Canonical product category. |
| `price` | number | Yes | Numeric product price. |
| `currency` | string | Yes | ISO 4217 currency code such as INR or USD. |
| `images` | array | Yes | Product image URLs or references. |
| `attributes` | object | Yes | Flexible collection of product attributes. |
| `rawData` | object | Yes | Original source data preserved for traceability. |
| `qualityScore` | number | Yes | Overall catalog quality score from 0 to 100. |
| `enrichmentStatus` | enum | Yes | Current AI enrichment state. |
| `confidenceScore` | number | Yes | AI/data confidence represented from 0.0 to 1.0. |
| `status` | enum | Yes | Product lifecycle status. |
| `timestamps` | object | Yes | Product creation and modification timestamps. |

---

## Enrichment Status

Allowed values:

- `pending`
- `in_progress`
- `enriched`
- `failed`
- `needs_review`

---

## Product Status

Allowed values:

- `raw`
- `cleaned`
- `enriched`
- `flagged`
- `approved`

---

## Quality Score

`qualityScore` must be between `0` and `100`.

| Score | Meaning |
|---|---|
| 90–100 | Excellent |
| 75–89 | Good |
| 50–74 | Needs improvement |
| 0–49 | Poor |

---


## Confidence Score

`confidenceScore` uses the canonical range:

```text
0.0 – 1.0
