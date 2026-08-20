"""
kimi_client.py -- Kimi (Moonshot AI) LLM Client Integration for Anvaya

WHAT: Provides an OpenAI-compatible interface to invoke Kimi / Moonshot AI LLMs
      (e.g. moonshot-v1-8k, moonshot-v1-32k, kimi-latest) for generative product
      enrichment, rich marketing descriptions, and bullet-point feature extraction.

WHY:  Complex e-commerce content (MARKETING_DESCRIPTION, 20 ITEM_FEATURES, application notes)
      benefits from advanced generative intelligence while adhering strictly to extracted specs.

HOW:  Uses the OpenAI client with Moonshot AI's endpoint (https://api.moonshot.cn/v1).
      Gracefully falls back to local templated generation if no API key is provided.
"""

import os
import json
from dataclasses import dataclass
from typing import Mapping, Any


@dataclass
class KimiEnrichmentResponse:
    """Structured response from Kimi LLM enrichment."""
    marketing_description: str
    item_features: list[str]
    short_desc: str
    application: str
    success: bool
    raw_response: str = ""
    model_used: str = ""


class KimiClient:
    """
    Client for interacting with Kimi (Moonshot AI) LLMs.
    """

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str = "https://api.moonshot.cn/v1",
        default_model: str = "moonshot-v1-8k",
    ):
        self.api_key = api_key or os.getenv("MOONSHOT_API_KEY") or os.getenv("KIMI_API_KEY")
        self.base_url = base_url
        self.default_model = default_model
        self._client = None

        if self.api_key:
            from openai import OpenAI
            self._client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
            )

    @property
    def is_available(self) -> bool:
        """Return True if an API key is configured."""
        return self._client is not None

    def enrich_product_content(
        self,
        mfg_part_num: str,
        part_desc: str,
        brand_name: str | None = None,
        mfg_name: str | None = None,
        category: str | None = None,
        extracted_specs: Mapping[str, Any] | None = None,
    ) -> KimiEnrichmentResponse:
        """
        Generate rich marketing copy, bullet features, and application notes using Kimi.
        """
        if not self.is_available:
            # Offline / local fallback
            prod = part_desc or mfg_part_num
            brand = brand_name or ""
            return KimiEnrichmentResponse(
                marketing_description=(
                    f"The {brand} {mfg_part_num} {prod} delivers superior performance and durability "
                    "engineered for industrial, commercial, and residential applications."
                ),
                item_features=[
                    f"Engineered for heavy-duty commercial and residential performance",
                    f"Precision crafted by {brand or mfg_name or 'the manufacturer'}",
                    f"Standard manufacturer warranty and compliance approved",
                ],
                short_desc=f"{brand} {mfg_part_num} {prod}".strip(),
                application="Industrial, commercial, and residential use.",
                success=True,
                model_used="local_fallback",
            )

        # Build prompt for Kimi
        prompt = (
            f"You are an industrial e-commerce catalog copywriter for Anvaya.\n"
            f"Product Part Number: {mfg_part_num}\n"
            f"Description: {part_desc}\n"
            f"Brand: {brand_name or 'N/A'}\n"
            f"Manufacturer: {mfg_name or 'N/A'}\n"
            f"Category: {category or 'N/A'}\n"
            f"Extracted Specifications: {json.dumps(extracted_specs or {})}\n\n"
            f"Return a strict JSON object with these keys:\n"
            f'{{"marketing_description": "...", "item_features": ["feat1", "feat2", "feat3"], "short_desc": "...", "application": "..."}}\n'
            f"Do not hallucinate specifications not supported by the product details."
        )

        try:
            response = self._client.chat.completions.create(
                model=self.default_model,
                messages=[
                    {"role": "system", "content": "You are a professional B2B product data enrichment engine."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content or "{}"
            data = json.loads(content)

            return KimiEnrichmentResponse(
                marketing_description=data.get("marketing_description", ""),
                item_features=data.get("item_features", []),
                short_desc=data.get("short_desc", ""),
                application=data.get("application", ""),
                success=True,
                raw_response=content,
                model_used=self.default_model,
            )
        except Exception as e:
            # Graceful fallback on API failure
            return KimiEnrichmentResponse(
                marketing_description=f"Standard performance product {part_desc}",
                item_features=["Industrial grade reliability", "Meets standard approvals"],
                short_desc=f"{brand_name or ''} {mfg_part_num} {part_desc}".strip(),
                application="Commercial application",
                success=False,
                raw_response=str(e),
                model_used="error_fallback",
            )
