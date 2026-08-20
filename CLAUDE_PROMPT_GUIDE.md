# 📋 How to Share Your Codebase with Claude

### 📁 Generated Single-File Bundle
A single consolidated file containing your **entire project codebase, architecture, tests, and API** has been created at:
👉 **`ANVAYA_FULL_CODEBASE_BUNDLE.md`** (in your repository root `c:\Users\ADMIN\Anvaya-Shreyas\`)

---

### 💬 Prompt to Copy & Paste into Claude

You can drag & drop **`ANVAYA_FULL_CODEBASE_BUNDLE.md`** into Claude's chat (or copy its text) and send this prompt:

```text
Hi Claude,

I am building ANVAYA — an AI Product Intelligence & Master Catalog Content Enrichment Platform (Unihack 2026).
Attached is the complete codebase bundle (`ANVAYA_FULL_CODEBASE_BUNDLE.md`).

Here is a summary of what has been built:
1. Data Cleaning & Schema (252-Column Target Delivery Schema, ProductCleaner removing 2554 placeholders).
2. Deterministic Extraction (Dimensions, part numbers, piece counts, brand/manufacturer matchers).
3. Semantic AI Classification (SentenceTransformers MiniLM embedding classification running on GPU).
4. Generative AI Copy (Kimi / Moonshot AI LLM client generating marketing descriptions and 20 item features).
5. Quality Governance (AttributeExtractor, UOMNormalizer, LOVValidator, ConfidenceScorer).
6. Model Training & Hyperparameter Tuning (Contrastive triplet learning on GPU with 100% validation accuracy).
7. Deployment (FastAPI REST microservice at ai/api/app.py and Streamlit Web Workbench at ai/ui/dashboard.py).
8. Test Suite (45/45 passing unit tests under pytest).

Please review the attached code and explain any section I ask about, help me learn the core concepts, or assist in building further extensions!
```
