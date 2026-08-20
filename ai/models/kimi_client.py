"""
kimi_client.py -- Kimi (Moonshot AI) & Free LLM Client Integration for Anvaya

WHAT: Provides an OpenAI-compatible interface to invoke LLMs for generative product
      enrichment, rich marketing descriptions, and bullet-point feature extraction.
      Fully compatible with Moonshot AI / Kimi and all 100% Free Providers (Gemini, Groq, OpenRouter, Ollama).

WHY:  Complex e-commerce content (MARKETING_DESCRIPTION, 20 ITEM_FEATURES, application notes)
      benefits from advanced generative intelligence while adhering strictly to extracted specs.

HOW:  Extends and wraps FreeLLMEngine for transparent backward compatibility.
"""

from typing import Mapping, Any, Optional
from dataclasses import dataclass
from ai.models.free_llm_engine import FreeLLMEngine, FreeLLMProvider, EnrichmentLLMResponse


@dataclass
class KimiEnrichmentResponse:
    """Structured response from LLM enrichment (backward-compatible dataclass)."""
    marketing_description: str
    item_features: list[str]
    short_desc: str
    application: str
    success: bool
    raw_response: str = ""
    model_used: str = ""


class KimiClient:
    """
    Client for interacting with Kimi (Moonshot AI) and free LLMs.
    Maintains 100% backward compatibility with previous interface.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        default_model: Optional[str] = None,
        provider: str = "kimi",
    ):
        self.engine = FreeLLMEngine(
            provider=provider,
            api_key=api_key,
            base_url=base_url,
            model=default_model,
        )
        self.default_model = default_model or "moonshot-v1-8k"

    @property
    def is_available(self) -> bool:
        """Return True if an API key/provider is configured."""
        return self.engine.is_available()

    def enrich_product_content(
        self,
        mfg_part_num: str,
        part_desc: str,
        brand_name: Optional[str] = None,
        mfg_name: Optional[str] = None,
        category: Optional[str] = None,
        extracted_specs: Optional[Mapping[str, Any]] = None,
    ) -> KimiEnrichmentResponse:
        """
        Generate rich marketing copy, bullet features, and application notes.
        """
        res: EnrichmentLLMResponse = self.engine.enrich_product_content(
            mfg_part_num=mfg_part_num,
            part_desc=part_desc,
            brand_name=brand_name,
            mfg_name=mfg_name,
            category=category,
            extracted_specs=extracted_specs,
        )

        return KimiEnrichmentResponse(
            marketing_description=res.marketing_description,
            item_features=res.item_features,
            short_desc=res.short_desc,
            application=res.application,
            success=res.success,
            raw_response=res.raw_response,
            model_used=res.model_used,
        )
