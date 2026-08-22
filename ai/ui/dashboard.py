"""
dashboard.py -- Interactive Web Dashboard for Anvaya + Kimi Product Intelligence

WHAT: Streamlit Web UI allowing interactive single-item and batch catalog enrichment,
      live Kimi LLM generative copy synthesis, taxonomy visualization, and data export.

WHY:  Provides business users, catalog managers, and evaluators with a visual,
      interactive workbench to test, verify, and export enriched master catalog feeds.

USAGE:
    streamlit run ai/ui/dashboard.py
"""

import os
import io
import json
import pandas as pd
import numpy as np
import torch
import streamlit as st

from ai.enrichment.pipeline import EnrichmentPipeline
from ai.enrichment.loader import load_raw, load_expected
from ai.models.kimi_client import KimiClient
from ai.evaluation.runner import EvaluationRunner


# -------------------------------------------------------------------------
# Page Configuration
# -------------------------------------------------------------------------
st.set_page_config(
    page_title="Anvaya — AI Product Intelligence",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS styling for premium look
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1E293B;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #64748B;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
    }
    .badge-auto {
        background-color: #DCFCE7;
        color: #166534;
        padding: 0.25rem 0.6rem;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.85rem;
    }
    .badge-review {
        background-color: #FEF3C7;
        color: #92400E;
        padding: 0.25rem 0.6rem;
        border-radius: 9999px;
        font-weight: 600;
        font-size: 0.85rem;
    }
</style>
""", unsafe_allow_html=True)


# -------------------------------------------------------------------------
# Sidebar Configuration
# -------------------------------------------------------------------------
st.sidebar.title("⚡ Anvaya Intelligence")
st.sidebar.caption("Unihack 2026 — AI Product Content Enrichment")

# Hardware & Engine Status
device_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
st.sidebar.markdown(f"**Compute Engine:** `{device_name}`")
st.sidebar.markdown(f"**CUDA Acceleration:** `{'Active' if torch.cuda.is_available() else 'Disabled'}`")

st.sidebar.divider()

# Kimi Configuration
st.sidebar.subheader("🤖 Kimi (Moonshot AI)")
use_kimi = st.sidebar.checkbox("Enable Kimi Generative Enrichment", value=False)
kimi_api_key = st.sidebar.text_input(
    "Kimi / Moonshot API Key",
    value=os.getenv("MOONSHOT_API_KEY") or os.getenv("KIMI_API_KEY") or "",
    type="password",
    help="Optional: Enter your Moonshot AI API key to enable live LLM marketing copy synthesis.",
)
kimi_model = st.sidebar.selectbox("Model Version", ["moonshot-v1-8k", "moonshot-v1-32k", "kimi-latest"])

if use_kimi:
    if kimi_api_key:
        st.sidebar.success("Kimi LLM Connected")
    else:
        st.sidebar.info("Running in local deterministic fallback mode")

st.sidebar.divider()

# Navigation
app_mode = st.sidebar.radio(
    "Navigation",
    ["✨ Single Item Enrichment", "📊 Batch CSV Enrichment", "📈 Ground Truth Evaluation", "📖 Architecture & Docs"],
)


# -------------------------------------------------------------------------
# Tab 1: Single Item Enrichment
# -------------------------------------------------------------------------
if app_mode == "✨ Single Item Enrichment":
    st.markdown('<div class="main-header">Real-Time Product Enrichment</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Input raw distributor product data to generate 252-column master catalog specifications in real-time.</div>', unsafe_allow_html=True)

    col1, col2 = st.columns(2)
    with col1:
        sample_choice = st.selectbox(
            "Quick Fill Example",
            [
                "Custom Input",
                "WDTS7024RZ — Dishwasher SS (Appliances)",
                "DCB518ASTS06G — Diablo Sanding Belt (Tools)",
                "49-94-0501 — Milwaukee Grinding Wheel (Abrasives)",
            ]
        )

    # Defaults based on sample choice
    if sample_choice == "WDTS7024RZ — Dishwasher SS (Appliances)":
        d_mpn = "WDTS7024RZ"
        d_desc = "WDTS7024RZ Dishwasher SS - Display Only 120V 10A 41 dBA Stainless Steel Built-in"
        d_mfg = "Appliance Dealers Cooperative (APPDE)"
        d_e1 = "-- Unbranded --"
        d_dib = "-- No DIB Brand --"
    elif sample_choice == "DCB518ASTS06G — Diablo Sanding Belt (Tools)":
        d_mpn = "DCB518ASTS06G"
        d_desc = 'DCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc'
        d_mfg = "Freud Inc (2435)"
        d_e1 = "Diablo"
        d_dib = "-- No DIB Brand --"
    elif sample_choice == "49-94-0501 — Milwaukee Grinding Wheel (Abrasives)":
        d_mpn = "49-94-0501"
        d_desc = '49-94-0501 Milw 4"x1/4"x5/8" Metal Grinding Wheel'
        d_mfg = "Jam Industrial Supply LLC (JAMIN)"
        d_e1 = "-- Unbranded --"
        d_dib = "Milwaukee"
    else:
        d_mpn = "PDSH4816AF"
        d_desc = "PDSH4816AF Dishwasher SS - Display Only"
        d_mfg = "Appliance Dealers Cooperative (APPDE)"
        d_e1 = "-- Unbranded --"
        d_dib = "-- No DIB Brand --"

    with st.form("single_item_form"):
        f_col1, f_col2 = st.columns(2)
        with f_col1:
            in_mpn = st.text_input("Manufacturer Part Number (Mfg_Part_Num)", value=d_mpn)
            in_desc = st.text_area("Raw Description (Part_Desc)", value=d_desc, height=90)
            in_mfg = st.text_input("Distributor / Manufacturer (Part_Manuf)", value=d_mfg)
        with f_col2:
            in_e1 = st.text_input("E1 Brand Header (E1_Brand)", value=d_e1)
            in_dib = st.text_input("DIB Brand Header (DIB_Brand)", value=d_dib)
            in_unilog = st.text_input("Unilog Brand Header (Unilog_Brand)", value="-- No Unilog Brand --")

        submitted = st.form_submit_button("⚡ Run AI Enrichment", type="primary", use_container_width=True)

    if submitted:
        pipeline = EnrichmentPipeline(use_kimi=use_kimi, kimi_api_key=kimi_api_key)
        raw_record = {
            "Mfg_Part_Num": in_mpn,
            "Part_Desc": in_desc,
            "E1_Brand": in_e1,
            "Unilog_Brand": in_unilog,
            "DIB_Brand": in_dib,
            "Part_Manuf": in_mfg,
        }
        with st.spinner("Enriching product specifications..."):
            enriched = pipeline.enrich_single(raw_record)

        st.success("Enrichment Complete!")

        # Quality & Governance Banner
        q_col1, q_col2, q_col3, q_col4 = st.columns(4)
        with q_col1:
            st.metric("Brand", enriched.get("BRAND_NAME") or "Unresolved")
        with q_col2:
            st.metric("Product Name", enriched.get("Product Name") or "Unresolved")
        with q_col3:
            st.metric("Department", enriched.get("Dept") or "General")
        with q_col4:
            st.metric("Fine Category", enriched.get("Fine") or "General")

        st.divider()

        # Taxonomy & Descriptions
        t_col1, t_col2 = st.columns(2)
        with t_col1:
            st.subheader("🏷️ Taxonomy Hierarchy")
            st.markdown(f"**Classpath:** `{enriched.get('Classpath')}`")
            st.markdown(f"**Dept / Class / Fine:** `{enriched.get('Dept')} > {enriched.get('Class')} > {enriched.get('Fine')}`")

            st.subheader("📝 Standard Descriptions")
            st.text_input("RETAIL_DESC", value=enriched.get("RETAIL_DESC") or "", disabled=True)
            st.text_input("SHORT_DESC", value=enriched.get("SHORT_DESC") or "", disabled=True)
            st.text_input("INVOICE_DESC", value=enriched.get("INVOICE_DESC") or "", disabled=True)
            st.text_area("LONG_DESC1", value=enriched.get("LONG_DESC1") or "", height=80, disabled=True)

        with t_col2:
            st.subheader("🤖 Kimi Generative Copy")
            st.markdown(f"**Marketing Description:**\n{enriched.get('MARKETING_DESCRIPTION', 'N/A')}")
            st.markdown("**Bullet Features:**")
            features = [enriched.get(f"ITEM_FEATURES_{i}") for i in range(1, 10) if enriched.get(f"ITEM_FEATURES_{i}") and str(enriched.get(f"ITEM_FEATURES_{i}")).lower() != "nan"]
            if features:
                for f in features:
                    st.markdown(f"- {f}")
            else:
                st.caption("Standard feature set generated.")

        st.divider()

        # Structured Attribute Triplets
        st.subheader("📐 Extracted Attribute Triplets (50 Available)")
        triplets_data = []
        for i in range(1, 51):
            lbl = enriched.get(f"ATTRIBUTE_LABEL {i}")
            val = enriched.get(f"ATTRIBUTE_VALUE {i}")
            uom = enriched.get(f"ATTRIBUTE_UOM {i}")
            if lbl and str(lbl).lower() != "nan":
                triplets_data.append({
                    "Triplet #": i,
                    "Attribute Label": lbl,
                    "Attribute Value": val,
                    "Normalized UOM": uom if (uom and str(uom).lower() != "nan") else "-",
                })

        if triplets_data:
            st.dataframe(pd.DataFrame(triplets_data), use_container_width=True)
        else:
            st.info("No numerical/LOV attribute triplets extracted from this short description.")

        # Raw 252-Column Inspector
        with st.expander("🔍 View All 252 Enriched Columns (JSON)"):
            st.json(enriched)


# -------------------------------------------------------------------------
# Tab 2: Batch CSV Enrichment
# -------------------------------------------------------------------------
elif app_mode == "📊 Batch CSV Enrichment":
    st.markdown('<div class="main-header">Batch Catalog Enrichment Engine</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Upload a raw catalog feed or process the sample 1,000 items in high throughput.</div>', unsafe_allow_html=True)

    uploaded_file = st.file_uploader("Upload Raw Product CSV", type=["csv"])
    b_col1, b_col2 = st.columns([1, 4])
    with b_col1:
        use_sample = st.button("📂 Load Sample 1,000 Items", use_container_width=True)

    df_to_process = None
    if uploaded_file is not None:
        df_to_process = pd.read_csv(uploaded_file)
        st.info(f"Uploaded CSV with {len(df_to_process)} records.")
    elif use_sample or "sample_loaded" in st.session_state:
        st.session_state["sample_loaded"] = True
        df_to_process = load_raw()
        st.info(f"Loaded tracked dataset: `data/raw/sample_1000_items.csv` ({len(df_to_process)} records).")

    if df_to_process is not None:
        st.dataframe(df_to_process.head(5), use_container_width=True)

        if st.button("🚀 Run Full Enrichment Pipeline (1,000 Items)", type="primary"):
            pipeline = EnrichmentPipeline(use_kimi=use_kimi, kimi_api_key=kimi_api_key)
            with st.spinner("Processing through 8 enrichment stages..."):
                output = pipeline.run(df_to_process)

            st.success("Batch Enrichment Finished!")

            # Metric Cards
            m1, m2, m3, m4, m5 = st.columns(5)
            m1.metric("Total Items", output.stats.get("input_rows", 0))
            m2.metric("Placeholders Cleaned", output.cleaning_result.num_changes)
            m3.metric("Classified Categories", output.stats.get("classified_rows", 0))
            m4.metric("Dimensions Parsed", output.stats.get("dims_filled", 0))
            m5.metric("Attributes Extracted", output.stats.get("attributes_extracted", 0))

            st.divider()
            st.subheader("Enriched Delivery Catalog Preview (252 Columns)")
            st.dataframe(output.enriched_data.head(20), use_container_width=True)

            # Export Buttons
            csv_buf = io.StringIO()
            output.enriched_data.to_csv(csv_buf, index=False)
            st.download_button(
                label="📥 Download 252-Column Enriched CSV",
                data=csv_buf.getvalue(),
                file_name="enriched_products_delivery_format.csv",
                mime="text/csv",
                type="primary",
            )


# -------------------------------------------------------------------------
# Tab 3: Ground Truth Evaluation
# -------------------------------------------------------------------------
elif app_mode == "📈 Ground Truth Evaluation":
    st.markdown('<div class="main-header">Ground Truth Benchmark Evaluation</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Benchmark accuracy and coverage against expected delivery format samples.</div>', unsafe_allow_html=True)

    if st.button("▶️ Run Evaluation Benchmark"):
        raw_df = load_raw()
        expected_df = load_expected()
        runner = EvaluationRunner()

        with st.spinner("Running evaluation runner..."):
            report = runner.evaluate(raw_df, expected_df)

        e1, e2, e3 = st.columns(3)
        e1.metric("Overall Accuracy", f"{report.overall_accuracy:.1%}")
        e2.metric("Schema Coverage", f"{report.overall_coverage:.1%}")
        e3.metric("Matched Test Rows", f"{report.matched_rows} / {report.total_expected_rows}")

        st.subheader("Field-by-Field Accuracy Breakdown")
        scores_data = [
            {
                "Column": s.column,
                "Accuracy": f"{s.accuracy:.0%}",
                "Coverage": f"{s.coverage:.0%}",
                "Exact Matches": s.exact_match,
                "Partial Matches": s.partial_match,
                "Missing": s.missing,
                "Mismatches": s.mismatch,
            }
            for s in sorted(report.column_scores, key=lambda x: x.column)
            if s.total > 0
        ]
        st.dataframe(pd.DataFrame(scores_data), use_container_width=True)


# -------------------------------------------------------------------------
# Tab 4: Architecture & Docs
# -------------------------------------------------------------------------
elif app_mode == "📖 Architecture & Docs":
    st.markdown('<div class="main-header">Platform Architecture & API Specs</div>', unsafe_allow_html=True)
    st.markdown("""
    ### 🏗️ Anvaya Pipeline Architecture
    1. **ProductCleaner**: Removes 2,554 placeholder values and trims whitespace.
    2. **Field Extractor**: Parses distributor codes, product names, and dimensional formulas.
    3. **Brand & Manufacturer Matchers**: Priority resolution with human review flagging.
    4. **AI CategoryClassifier**: Semantic embeddings with SentenceTransformers (`all-MiniLM-L6-v2`) on GPU.
    5. **AttributeExtractor & Quality Gating**: Populates 50 attribute triplets with `UOMNormalizer` and `LOVValidator`.
    6. **Kimi (Moonshot AI)**: Generative marketing descriptions and 20 item features.
    7. **FastAPI Microservice**: Exposes high-speed REST endpoints.
    """)
    st.code("python -m uvicorn ai.api.app:app --host 0.0.0.0 --port 8000 --reload", language="bash")
