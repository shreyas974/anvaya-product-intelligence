# ANVAYA Architecture Specification

## 1. System Overview

ANVAYA is structured as a decoupled, modular micro-architecture consisting of:
- **FastAPI Core Application Service**: High-throughput REST API managing routing, transactions, and pipeline dispatch.
- **Authoritative Reference Governance Layer**: In-memory rule catalog governing UOM standards, decimal-fraction conversions, brand dictionaries, and fittings LOVs.
- **Product Truth Engine**: Relational provenance layer recording the origin, method, rule, and confidence of every extracted attribute.
- **Multi-Provider AI Abstraction Layer**: Pluggable adapter layer providing unified access to Gemini, Groq, OpenRouter, and local Ollama instances.
- **Deterministic Content Synthesis Engine**: Rule-grounded text synthesis system enforcing strict character caps for eCommerce channels.
- **252-Column Delivery Mapper & Exporter**: Format engine transforming canonical database entities into standard delivery schemas.
- **React Liquid Glass Frontend**: Enterprise-grade UI with real-time KPI metrics, interactive fittings lab, decision trace inspector, and review queue.

---

## 2. Component Diagram

```mermaid
graph TD
    Client[React Frontend UI<br/>Vite / TypeScript / Liquid Glass] -->|REST API / JSON| API[FastAPI Application Gateway<br/>Port 8000]
    
    subgraph Backend Core Layer
        API --> Auth[JWT & Supabase Auth Middleware]
        API --> IngestCtrl[Dataset Ingestion & Profiling]
        API --> ProductCtrl[Product Truth & Catalog Controller]
        API --> EvalCtrl[Benchmark Evaluator]
        API --> ExportCtrl[252-Column Exporter]
    end

    subgraph Service & Engine Layer
        IngestCtrl --> ProfileSvc[Profiling Service]
        ProductCtrl --> EnrichPipe[8-Stage Enrichment Pipeline]
        ProductCtrl --> TruthEngine[Product Truth Engine]
        ProductCtrl --> ContentGen[Content Studio Generator]
        EvalCtrl --> EvalSvc[Ground Truth Evaluator]
        ExportCtrl --> DeliveryMapper[Delivery Mapper Engine]
    end

    subgraph Governance & Standards
        EnrichPipe --> RefData[Reference Governance Layer<br/>UOM Standards • Fractions • Fittings LOV]
        EnrichPipe --> BrandDict[Authoritative Brand Master]
        TruthEngine --> ProvDB[(SQLite Database<br/>Products • Provenance • Validation • Reviews)]
    end

    subgraph AI Intelligence Layer
        API --> Copilot[Grounded RAG Copilot]
        Copilot --> ProvDB
        Copilot --> AIProviders[Multi-Provider AI Router]
        AIProviders --> Gemini[Google Gemini 2.0]
        AIProviders --> Groq[Groq Llama 3.3 70B]
        AIProviders --> Ollama[Local Ollama]
    end
```

---

## 3. Database Schema Design

The SQLite/PostgreSQL schema is normalized across four primary entities:

1. **`products`**:
   - Stores raw ingested fields (`mfg_part_num`, `part_desc`, `part_manuf`, `e1_brand`, `unilog_brand`, `dib_brand`).
   - Stores canonical enriched fields (`cleaned_name`, `canonical_brand`, `category`, `subcategory`, `product_type`).
   - Dense JSON payload containers (`attributes_json`, `descriptions_json`).
   - Quality metrics (`completeness_score`, `confidence_score`, `validation_status`, `review_status`).

2. **`provenance_records`**:
   - Foreign key to `products.id` with cascade deletion.
   - Stores `field_name`, `value`, `source`, `evidence`, `method`, `confidence`, and `timestamp`.

3. **`validation_issues`**:
   - Tracks automated quality gate infractions (`field_name`, `rule_name`, `severity`, `message`, `is_resolved`).

4. **`review_items`**:
   - Queue items requiring human approval (`field_name`, `reason`, `current_value`, `suggested_value`, `status`, `reviewer_notes`).

5. **`audit_logs`**:
   - Immutable audit trail capturing every system event, user review decision, and batch ingestion.
