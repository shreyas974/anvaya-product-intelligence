"""
app.py -- FastAPI Deployment Service for Anvaya + Kimi Product Intelligence

WHAT: REST API microservice exposing single-product and batch product enrichment endpoints.

WHY:  Allows frontend applications, distributors, and external pipelines to send raw product
      metadata and receive fully enriched, classified, and standardized catalog records.

HOW:  FastAPI + Uvicorn service invoking EnrichmentPipeline with Kimi LLM integration.

USAGE:
    # Run the server locally:
    python -m uvicorn ai.api.app:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import math
from typing import Any, List
import pandas as pd
import numpy as np
import torch
from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel, Field

from ai.enrichment.pipeline import EnrichmentPipeline
from ai.models.kimi_client import KimiClient


def _sanitize_for_json(val: Any) -> Any:
    """Convert NaN/numpy nulls to None for strict JSON compliance."""
    if isinstance(val, dict):
        return {k: _sanitize_for_json(v) for k, v in val.items()}
    if isinstance(val, list):
        return [_sanitize_for_json(v) for v in val]
    if isinstance(val, float) and (math.isnan(val) or np.isnan(val)):
        return None
    if pd.isna(val):
        return None
    return val


# -------------------------------------------------------------------------
# Request / Response Schemas
# -------------------------------------------------------------------------
class RawProductItem(BaseModel):
    Mfg_Part_Num: str = Field(..., description="Manufacturer Part Number", json_schema_extra={"example": "WDTS7024RZ"})
    Part_Desc: str = Field(..., description="Raw Description", json_schema_extra={"example": "WDTS7024RZ Dishwasher SS - Display Only"})
    E1_Brand: str | None = Field(default="-- Unbranded --", json_schema_extra={"example": "-- Unbranded --"})
    Unilog_Brand: str | None = Field(default="-- No Unilog Brand --", json_schema_extra={"example": "-- No Unilog Brand --"})
    DIB_Brand: str | None = Field(default="-- No DIB Brand --", json_schema_extra={"example": "-- No DIB Brand --"})
    Part_Manuf: str | None = Field(default="Appliance Dealers Cooperative (APPDE)", json_schema_extra={"example": "Appliance Dealers Cooperative (APPDE)"})


class BatchEnrichRequest(BaseModel):
    items: List[RawProductItem]
    use_kimi: bool = Field(default=False, description="Enable Kimi / Moonshot AI generative enrichment")


# -------------------------------------------------------------------------
# Application Initialization
# -------------------------------------------------------------------------
app = FastAPI(
    title="Anvaya Product Intelligence API",
    description="AI-powered B2B product content enrichment, classification, and quality governance engine.",
    version="1.0.0",
)

# Pipeline instances
_default_pipeline = EnrichmentPipeline(use_kimi=False)


@app.get("/health", tags=["Health"])
def health_check():
    """System health check, device status, and Kimi availability."""
    kimi_client = KimiClient()
    return {
        "status": "healthy",
        "service": "Anvaya Product Intelligence",
        "device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "cuda_available": torch.cuda.is_available(),
        "kimi_llm_configured": kimi_client.is_available,
    }


@app.post("/api/v1/enrich", tags=["Enrichment"])
def enrich_single_item(
    item: RawProductItem,
    use_kimi: bool = False,
):
    """
    Enrich a single raw product item into the full 252-column master catalog delivery format.
    """
    pipeline = EnrichmentPipeline(use_kimi=use_kimi) if use_kimi else _default_pipeline
    enriched_dict = pipeline.enrich_single(item.model_dump())
    sanitized = _sanitize_for_json(enriched_dict)
    return {
        "success": True,
        "input_part_num": item.Mfg_Part_Num,
        "enriched_record": sanitized,
    }


@app.post("/api/v1/batch-enrich", tags=["Enrichment"])
def enrich_batch_items(payload: BatchEnrichRequest):
    """
    Enrich a batch of raw product records and return enriched rows with quality stats.
    """
    if not payload.items:
        raise HTTPException(status_code=400, detail="Empty item list provided.")

    records = [it.model_dump() for it in payload.items]
    df = pd.DataFrame(records)

    pipeline = EnrichmentPipeline(use_kimi=payload.use_kimi) if payload.use_kimi else _default_pipeline
    result = pipeline.run(df)

    sanitized_records = _sanitize_for_json(result.enriched_data.to_dict(orient="records"))
    return {
        "success": True,
        "stats": result.stats,
        "enriched_records": sanitized_records,
    }
