# ANVAYA 8-Stage Product Enrichment Pipeline

## Pipeline Execution Lifecycle

When raw catalog data is ingested into ANVAYA, it moves sequentially through an 8-stage deterministic and AI-assisted enrichment lifecycle:

```
[Raw Ingestion] 
   │
   ▼
[Stage 1: Placeholder Scrubbing]
   │
   ▼
[Stage 2: Brand & Manufacturer Resolution]
   │
   ▼
[Stage 3: Hierarchical Taxonomic Classification]
   │
   ▼
[Stage 4: Attribute & Specification Extraction]
   │
   ▼
[Stage 5: Reference Governance Normalization]
   │
   ▼
[Stage 6: Multi-Channel Content Synthesis]
   │
   ▼
[Stage 7: Product Truth & Provenance Tagging]
   │
   ▼
[Stage 8: Quality Gate & Human Review Dispatch]
```

---

## Detailed Stage Breakdown

### Stage 1: Placeholder Scrubbing
- Identifies and scrubs 45+ unbranded marker strings (`-- Unbranded --`, `-- No Unilog Brand --`, `-- No DIB Brand --`, `nan`, `none`, `null`).
- Prevents placeholder strings from polluting downstream normalization and indexing.

### Stage 2: Authoritative Brand Resolution
- **Tier 1 (Direct Match)**: Validates if raw distributor brand fields exist in the Master Brand Dictionary.
- **Tier 2 (Description Token Extraction)**: Scans `Part_Desc` for recognized brand tokens (e.g., `Diablo`, `3M Cubitron`, `Mirka`, `Milwaukee`).
- **Tier 3 (Manufacturer Entity Normalization)**: Cleans manufacturer names (strips supplier codes like `Freud Inc (2435)` → `Freud Inc`).
- **Tier 4 (Fallback & Flag)**: If no brand can be confirmed, assigns `Generic / Unbranded` with confidence $\le 0.40$ and dispatches a Review Queue item.

### Stage 3: Hierarchical Taxonomic Classification
- Maps descriptions into standard 3-tier hierarchy: `Department > Class > Fine` (or `Category > Subcategory > Product Type`).
- Uses boundary-aware keyword matching and taxonomy synonym dictionaries.

### Stage 4: Attribute & Specification Extraction
- **Grits**: Regex extracts `P80`, `P120`, `P150`, `80 Grit` ratings.
- **Dimensions**: Extracts multi-axis measurements (`1/2"x18"`, `5"`, `6-1/2"x1/8"x5/8"`).
- **Pack Quantities**: Identifies packaging units (`50 Disc/Box`, `6pc`, `10/pk`).
- **Materials**: Classifies applications (`Metal & Ferrous Alloys`, `Wood & Timber`, `Stainless Steel`).

### Stage 5: Reference Governance Normalization
- **UOM Standard**: Enforces `number + space + unit` format (e.g., `1/2 in`, `120 V`, `15 A`, `47 dBA`).
- **Decimal-Fraction Conversion**: Resolves fractions (`0.0625` ↔ `1/16`, `0.5` ↔ `1/2`).
- **Fittings LOV**: Validates fitting types (`Coupling`, `Elbow`, `Nipple`, `Bushing`) and thread types (`NPT`, `MNPT`, `FNPT`).

### Stage 6: Multi-Channel Content Synthesis
Deterministic template synthesis applying strict channel character caps:
- `INVOICE_DESC` ($\le 40$ chars): Uppercase, standard industrial abbreviations (`SST`, `MTG`, `CPLG`).
- `MOBILE_DESC` ($\le 100$ chars): High-density manufacturer, brand, series, and MPN summary.
- `SHORT_DESC` ($\le 150$ chars): Catalog line-item description.
- `LONG_DESC1` ($\le 500$ chars): Full attribute listing with standard UOM units.
- `RETAIL_DESC` ($\le 150$ chars): Consumer display presentation.

### Stage 7: Product Truth & Provenance Construction
Creates an immutable `ProvenanceRecord` for every single extracted and normalized value, containing:
- Target Field Name
- Sourced Value
- Source Column Name
- Direct Evidence Snippet
- Extraction Method & Rule
- Confidence Score (0.00 – 1.00)

### Stage 8: Quality Gate & Review Queue Dispatch
Evaluates multi-rule business constraints:
- Duplicate MPN detection across supplier feeds.
- Low-confidence brand recovery ($\text{confidence} < 0.75$).
- Missing critical dimensions for abrasive and cutting tools.
- Taxonomy ambiguity detection.
- Dispatches flagged records to the **Human Review Queue** with audit trail tracking.
