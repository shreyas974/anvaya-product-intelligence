"""
run_model_benchmarks.py -- Interactive Runner & Benchmark for All Anvaya AI Models

WHAT: Executes product data enrichment across all local and cloud LLM models,
      displaying generated marketing descriptions, bullet features, latency, and status.

USAGE:
    python scripts/run_model_benchmarks.py
"""

import os
import sys
import time
import json
from pathlib import Path
import pandas as pd

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from ai.models.free_llm_engine import FreeLLMEngine, FreeLLMProvider
from ai.models.local_llm_generator import LocalLLMGenerator
from ai.enrichment.pipeline import EnrichmentPipeline

SAMPLE_PRODUCT = {
    "Mfg_Part_Num": "DCD771C2",
    "Part_Desc": "20V MAX 1/2-Inch Cordless Drill/Driver Kit with 2 Batteries and Charger",
    "Brand_Name": "DEWALT",
    "Mfg_Name": "Stanley Black & Decker",
    "Category": "Power Tools > Drills > Cordless Drills",
    "Specs": {
        "voltage": "20V",
        "chuck_size": "1/2 in",
        "motor_type": "High Performance 2-Speed (0-450 / 0-1500 RPM)",
        "battery_included": True,
    }
}


def print_banner(title: str):
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def benchmark_local_template():
    print_banner("1. Local Deterministic Template Engine (Zero GPU / Offline)")
    engine = FreeLLMEngine(provider="auto")
    t0 = time.time()
    res = engine.enrich_product_content(
        mfg_part_num=SAMPLE_PRODUCT["Mfg_Part_Num"],
        part_desc=SAMPLE_PRODUCT["Part_Desc"],
        brand_name=SAMPLE_PRODUCT["Brand_Name"],
        mfg_name=SAMPLE_PRODUCT["Mfg_Name"],
        category=SAMPLE_PRODUCT["Category"],
        extracted_specs=SAMPLE_PRODUCT["Specs"],
    )
    elapsed = (time.time() - t0) * 1000

    print(f"  [Status] Provider: {res.provider_used} | Model: {res.model_used} | Latency: {elapsed:.2f} ms")
    print(f"  [Short Title] {res.short_desc}")
    print(f"  [Marketing Copy] {res.marketing_description}")
    print("  [Key Features]")
    for f in res.item_features:
        print(f"    * {f}")
    print(f"  [Application] {res.application}")


def benchmark_local_gpu_transformer():
    print_banner("2. Local In-Process GPU Model (NVIDIA GeForce RTX 5060 Ti / CUDA)")
    print("  Initializing local transformer pipeline on CUDA...")
    t0 = time.time()
    generator = LocalLLMGenerator(model_name="Qwen/Qwen2.5-0.5B-Instruct")
    res = generator.generate_product_content(
        mfg_part_num=SAMPLE_PRODUCT["Mfg_Part_Num"],
        part_desc=SAMPLE_PRODUCT["Part_Desc"],
        brand_name=SAMPLE_PRODUCT["Brand_Name"],
        mfg_name=SAMPLE_PRODUCT["Mfg_Name"],
        category=SAMPLE_PRODUCT["Category"],
        extracted_specs=SAMPLE_PRODUCT["Specs"],
    )
    elapsed = (time.time() - t0) * 1000

    print(f"  [Status] Device: {generator.device} | Model: {res.model_name} | Latency: {elapsed:.2f} ms")
    print(f"  [Short Title] {res.short_desc}")
    print(f"  [Marketing Copy] {res.marketing_description}")
    print("  [Key Features]")
    for f in res.item_features:
        print(f"    * {f}")
    print(f"  [Application] {res.application}")


def benchmark_cloud_provider(provider: str, env_key: str, name: str):
    print_banner(f"3. Cloud Free Tier: {name}")
    key_val = os.getenv(env_key)
    if not key_val:
        print(f"  [Notice] {env_key} is not set in environment or .env.")
        print(f"  To enable {name}, add {env_key}=your_key in .env")
        return

    print(f"  Connecting to {name} via OpenAI-compatible endpoint...")
    t0 = time.time()
    engine = FreeLLMEngine(provider=provider)
    res = engine.enrich_product_content(
        mfg_part_num=SAMPLE_PRODUCT["Mfg_Part_Num"],
        part_desc=SAMPLE_PRODUCT["Part_Desc"],
        brand_name=SAMPLE_PRODUCT["Brand_Name"],
        mfg_name=SAMPLE_PRODUCT["Mfg_Name"],
        category=SAMPLE_PRODUCT["Category"],
        extracted_specs=SAMPLE_PRODUCT["Specs"],
    )
    elapsed = (time.time() - t0) * 1000

    print(f"  [Status] Provider: {res.provider_used} | Model: {res.model_used} | Latency: {elapsed:.2f} ms")
    print(f"  [Short Title] {res.short_desc}")
    print(f"  [Marketing Copy] {res.marketing_description}")
    print("  [Key Features]")
    for f in res.item_features:
        print(f"    * {f}")
    print(f"  [Application] {res.application}")


def benchmark_full_pipeline_run():
    print_banner("4. Full End-to-End Anvaya Enrichment Pipeline Run")
    df = pd.DataFrame([{
        "Mfg_Part_Num": "DCD771C2",
        "Part_Desc": "20V MAX 1/2 In Cordless Compact Drill Driver Kit",
        "Part_Manuf": "DEWALT Tools (2435)",
        "E1_Brand": "DEWALT",
        "Unilog_Brand": "",
        "DIB_Brand": "",
    }, {
        "Mfg_Part_Num": "DW2166",
        "Part_Desc": "45-Piece Screwdriving Set with ToughCase",
        "Part_Manuf": "DEWALT Tools (2435)",
        "E1_Brand": "DEWALT",
        "Unilog_Brand": "",
        "DIB_Brand": "",
    }])

    print(f"  Processing {len(df)} sample industrial catalog records...")
    t0 = time.time()
    pipeline = EnrichmentPipeline(use_llm=True, provider="auto")
    output = pipeline.run(df)
    elapsed = (time.time() - t0) * 1000

    print(f"  Pipeline completed in {elapsed:.2f} ms")
    print(output.summary())
    print("\n  Sample Enriched Output Columns:")
    preview_cols = ["MANUFACTURER_NAME", "BRAND_NAME", "SHORT_DESC", "MARKETING_DESCRIPTION", "ITEM_FEATURES_1", "ATTRIBUTE_LABEL 1", "ATTRIBUTE_VALUE 1"]
    present_cols = [c for c in preview_cols if c in output.enriched_data.columns]
    print(output.enriched_data[present_cols].to_string())


if __name__ == "__main__":
    print_banner("ANVAYA AI PRODUCT INTELLIGENCE -- MODEL TEST SUITE")
    benchmark_local_template()
    benchmark_local_gpu_transformer()
    benchmark_cloud_provider("groq", "GROQ_API_KEY", "Groq Cloud (Llama 3.3 70B)")
    benchmark_cloud_provider("gemini", "GEMINI_API_KEY", "Google Gemini (Gemini 2.0 Flash)")
    benchmark_cloud_provider("openrouter", "OPENROUTER_API_KEY", "OpenRouter Free (DeepSeek R1 Free)")
    benchmark_full_pipeline_run()
    print_banner("ALL MODEL RUNS & BENCHMARKS COMPLETED")
