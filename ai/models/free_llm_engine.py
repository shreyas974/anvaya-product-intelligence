"""
free_llm_engine.py -- Multi-Provider 100% Free LLM Engine for Anvaya

WHAT: Unified OpenAI-compatible adapter supporting all major 100% free LLM options:
      1. Google Gemini (via Google AI Studio Free API)
      2. Groq Cloud (Free Tier, ultra-fast Llama-3.3-70B)
      3. OpenRouter (Free Open-Weight Tier, DeepSeek/Llama/Qwen)
      4. Ollama (100% Local, offline CPU/GPU inference)
      5. Moonshot AI / Kimi (Optional)

WHY:  Allows deploying and running Anvaya's advanced generative product intelligence
      at ZERO cost, with smart auto-failover across free providers so pipeline runs
      never stall or fail.

HOW:  Uses standard OpenAI-compatible client routing with provider-specific endpoints,
      default models, authentication mapping, and automatic cascading fallback.
"""

import os
import json
import logging
from enum import Enum
from dataclasses import dataclass, field
from typing import Mapping, Any, Optional, List, TypedDict

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logger = logging.getLogger("anvaya.ai.free_llm")


class FreeLLMProvider(str, Enum):
    """Supported LLM providers (Free Tier, Local, and Cloud)."""
    GEMINI = "gemini"
    GROQ = "groq"
    OPENROUTER = "openrouter"
    OPENAI = "openai"
    DEEPSEEK = "deepseek"
    MISTRAL = "mistral"
    OLLAMA = "ollama"
    LOCAL_GPU = "local_gpu"
    LOCAL = "local"
    KIMI = "kimi"
    AUTO = "auto"


class ProviderInfo(TypedDict):
    base_url: str
    default_model: str
    env_keys: list[str]
    requires_key: bool


PROVIDER_DEFAULTS: dict[FreeLLMProvider, ProviderInfo] = {
    FreeLLMProvider.GEMINI: {
        "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/",
        "default_model": "gemini-2.0-flash",
        "env_keys": ["GEMINI_API_KEY", "GOOGLE_API_KEY", "GOOGLE_AI_KEY"],
        "requires_key": True,
    },
    FreeLLMProvider.GROQ: {
        "base_url": "https://api.groq.com/openai/v1",
        "default_model": "llama-3.3-70b-versatile",
        "env_keys": ["GROQ_API_KEY"],
        "requires_key": True,
    },
    FreeLLMProvider.OPENROUTER: {
        "base_url": "https://openrouter.ai/api/v1",
        "default_model": "deepseek/deepseek-r1:free",
        "env_keys": ["OPENROUTER_API_KEY", "OPEN_ROUTER_KEY"],
        "requires_key": True,
    },
    FreeLLMProvider.OPENAI: {
        "base_url": "https://api.openai.com/v1",
        "default_model": "gpt-4o-mini",
        "env_keys": ["OPENAI_API_KEY"],
        "requires_key": True,
    },
    FreeLLMProvider.DEEPSEEK: {
        "base_url": "https://api.deepseek.com/v1",
        "default_model": "deepseek-chat",
        "env_keys": ["DEEPSEEK_API_KEY"],
        "requires_key": True,
    },
    FreeLLMProvider.MISTRAL: {
        "base_url": "https://api.mistral.ai/v1",
        "default_model": "mistral-small-latest",
        "env_keys": ["MISTRAL_API_KEY"],
        "requires_key": True,
    },
    FreeLLMProvider.OLLAMA: {
        "base_url": "http://localhost:11434/v1",
        "default_model": "qwen2.5:7b",
        "env_keys": ["OLLAMA_BASE_URL", "OLLAMA_HOST"],
        "requires_key": False,
    },
    FreeLLMProvider.LOCAL_GPU: {
        "base_url": "local://cuda",
        "default_model": "Qwen/Qwen2.5-0.5B-Instruct",
        "env_keys": [],
        "requires_key": False,
    },
    FreeLLMProvider.LOCAL: {
        "base_url": "local://cuda",
        "default_model": "Qwen/Qwen2.5-0.5B-Instruct",
        "env_keys": [],
        "requires_key": False,
    },
    FreeLLMProvider.KIMI: {
        "base_url": "https://api.moonshot.cn/v1",
        "default_model": "moonshot-v1-8k",
        "env_keys": ["MOONSHOT_API_KEY", "KIMI_API_KEY"],
        "requires_key": True,
    },
}


@dataclass
class FreeLLMConfig:
    """Configuration for a specific LLM provider."""
    provider: FreeLLMProvider
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    model: Optional[str] = None
    temperature: float = 0.3
    timeout: float = 30.0


@dataclass
class EnrichmentLLMResponse:
    """Structured response from LLM product enrichment."""
    marketing_description: str
    item_features: list[str]
    short_desc: str
    application: str
    success: bool
    raw_response: str = ""
    provider_used: str = "fallback"
    model_used: str = "deterministic_template"


@dataclass
class LLMGenerationResponse:
    """Structured response from generic LLM text generation."""
    content: str
    model: str = "deterministic"
    provider: str = "fallback"
    success: bool = True
    raw_response: str = ""


class FreeLLMEngine:
    """
    Multi-Provider Free LLM Engine with automatic cascading fallback.
    
    Supports Google Gemini, Groq, OpenRouter, and local Ollama with zero
    licensing fees or mandatory cloud billing.
    """

    def __init__(
        self,
        provider: str = "auto",
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: float = 30.0,
    ):
        try:
            self.provider = FreeLLMProvider(provider.lower())
        except ValueError:
            self.provider = FreeLLMProvider.AUTO

        self.custom_api_key = api_key
        self.custom_base_url = base_url
        self.custom_model = model
        self.timeout = timeout
        self._clients: dict[FreeLLMProvider, Any] = {}

        self._initialize_clients()

    def _get_api_key_for_provider(self, provider: FreeLLMProvider) -> Optional[str]:
        """Resolve API key for the given provider from custom args or environment."""
        if self.custom_api_key and self.provider == provider:
            return self.custom_api_key

        info = PROVIDER_DEFAULTS.get(provider)
        if info:
            for env_var in info["env_keys"]:
                val = os.getenv(env_var)
                if val:
                    return val.strip()

        if provider == FreeLLMProvider.OLLAMA:
            return "ollama"  # Ollama doesn't require auth, dummy key for OpenAI SDK

        return None

    def _get_base_url_for_provider(self, provider: FreeLLMProvider) -> str:
        """Resolve base URL for the given provider."""
        if self.custom_base_url and self.provider == provider:
            return self.custom_base_url

        info = PROVIDER_DEFAULTS.get(provider)
        default_url = info["base_url"] if info else "http://localhost:11434/v1"

        if provider == FreeLLMProvider.OLLAMA:
            return os.getenv("OLLAMA_BASE_URL", default_url)

        return default_url

    def _get_model_for_provider(self, provider: FreeLLMProvider) -> str:
        """Resolve model name for the given provider."""
        if self.custom_model and self.provider == provider:
            return self.custom_model
        info = PROVIDER_DEFAULTS.get(provider)
        return info["default_model"] if info else "Qwen/Qwen2.5-0.5B-Instruct"

    def _initialize_clients(self):
        """Pre-initialize OpenAI clients for all configured/available providers."""
        from openai import OpenAI

        target_providers = (
            [p for p in FreeLLMProvider if p != FreeLLMProvider.AUTO]
            if self.provider == FreeLLMProvider.AUTO
            else [self.provider]
        )

        for p in target_providers:
            key = self._get_api_key_for_provider(p)
            base_url = self._get_base_url_for_provider(p)
            info = PROVIDER_DEFAULTS.get(p)
            req_key = info["requires_key"] if info else True

            # In AUTO mode, Ollama is enabled if OLLAMA_BASE_URL is configured
            if p == FreeLLMProvider.OLLAMA and self.provider == FreeLLMProvider.AUTO and not os.getenv("OLLAMA_BASE_URL"):
                continue

            if p in (FreeLLMProvider.LOCAL_GPU, FreeLLMProvider.LOCAL):
                if self.provider in (FreeLLMProvider.LOCAL_GPU, FreeLLMProvider.LOCAL):
                    from ai.models.local_llm_generator import LocalLLMGenerator
                    self._clients[p] = LocalLLMGenerator(model_name=self._get_model_for_provider(p))
                continue

            if key or (not req_key and (self.provider == FreeLLMProvider.OLLAMA or os.getenv("OLLAMA_BASE_URL"))):
                try:
                    client = OpenAI(
                        api_key=key or "ollama",
                        base_url=base_url,
                        timeout=self.timeout,
                    )
                    self._clients[p] = client
                except Exception as e:
                    logger.warning("Failed to initialize client for %s: %s", p.value, e)

    @property
    def available_providers(self) -> List[str]:
        """List all active providers that have credentials or local endpoints ready."""
        return [p.value for p in self._clients.keys()]

    def is_available(self) -> bool:
        """Return True if at least one LLM provider is configured."""
        return len(self._clients) > 0

    def _build_prompt(
        self,
        mfg_part_num: str,
        part_desc: str,
        brand_name: Optional[str] = None,
        mfg_name: Optional[str] = None,
        category: Optional[str] = None,
        extracted_specs: Optional[Mapping[str, Any]] = None,
    ) -> str:
        return (
            f"You are an industrial e-commerce catalog copywriter for Anvaya.\n"
            f"Product Part Number: {mfg_part_num}\n"
            f"Description: {part_desc}\n"
            f"Brand: {brand_name or 'N/A'}\n"
            f"Manufacturer: {mfg_name or 'N/A'}\n"
            f"Category: {category or 'N/A'}\n"
            f"Extracted Specifications: {json.dumps(extracted_specs or {})}\n\n"
            f"Generate high-quality catalog content. Return a strict JSON object with these keys:\n"
            f'{{"marketing_description": "...", "item_features": ["feat1", "feat2", "feat3"], "short_desc": "...", "application": "..."}}\n'
            f"Do not hallucinate specifications not supported by the product details."
        )

    def _local_fallback(
        self,
        mfg_part_num: str,
        part_desc: str,
        brand_name: Optional[str] = None,
        mfg_name: Optional[str] = None,
    ) -> EnrichmentLLMResponse:
        """Deterministic local fallback when no LLM provider is available or reachable."""
        prod = part_desc or mfg_part_num
        brand = brand_name or mfg_name or ""
        return EnrichmentLLMResponse(
            marketing_description=(
                f"The {brand} {mfg_part_num} {prod} delivers superior performance and durability "
                "engineered for industrial, commercial, and residential applications."
            ).strip(),
            item_features=[
                f"Engineered for heavy-duty commercial and residential performance",
                f"Precision crafted by {brand or 'the manufacturer'}",
                f"Standard manufacturer warranty and compliance approved",
            ],
            short_desc=f"{brand} {mfg_part_num} {prod}".strip(),
            application="Industrial, commercial, and residential use.",
            success=True,
            provider_used="local_template",
            model_used="deterministic_rules",
        )

    def enrich_product_content(
        self,
        mfg_part_num: str,
        part_desc: str,
        brand_name: Optional[str] = None,
        mfg_name: Optional[str] = None,
        category: Optional[str] = None,
        extracted_specs: Optional[Mapping[str, Any]] = None,
    ) -> EnrichmentLLMResponse:
        """
        Enrich product content with marketing description, bullet features, and applications.
        Cascades automatically across available free providers (Groq -> Gemini -> OpenRouter -> Ollama).
        """
        if not self._clients:
            return self._local_fallback(mfg_part_num, part_desc, brand_name, mfg_name)

        # Priority order for auto-fallback: Cloud (Groq, Gemini, OpenRouter, OpenAI, DeepSeek, Mistral) -> Local Ollama -> Kimi
        order = [
            FreeLLMProvider.GROQ,
            FreeLLMProvider.GEMINI,
            FreeLLMProvider.OPENROUTER,
            FreeLLMProvider.OPENAI,
            FreeLLMProvider.DEEPSEEK,
            FreeLLMProvider.MISTRAL,
            FreeLLMProvider.OLLAMA,
            FreeLLMProvider.KIMI,
        ]

        if self.provider != FreeLLMProvider.AUTO:
            active_providers = [self.provider] if self.provider in self._clients else []
        else:
            active_providers = [p for p in order if p in self._clients]

        if not active_providers:
            return self._local_fallback(mfg_part_num, part_desc, brand_name, mfg_name)

        prompt = self._build_prompt(
            mfg_part_num=mfg_part_num,
            part_desc=part_desc,
            brand_name=brand_name,
            mfg_name=mfg_name,
            category=category,
            extracted_specs=extracted_specs,
        )

        last_error = ""
        for p in active_providers:
            client = self._clients[p]
            model_name = self._get_model_for_provider(p)

            # Direct in-process Local GPU Inference
            if p in (FreeLLMProvider.LOCAL_GPU, FreeLLMProvider.LOCAL):
                try:
                    res = client.generate_product_content(
                        mfg_part_num=mfg_part_num,
                        part_desc=part_desc,
                        brand_name=brand_name,
                        mfg_name=mfg_name,
                        category=category,
                        extracted_specs=extracted_specs,
                    )
                    return EnrichmentLLMResponse(
                        marketing_description=res.marketing_description,
                        item_features=res.item_features,
                        short_desc=res.short_desc,
                        application=res.application,
                        success=res.success,
                        raw_response=res.raw_text,
                        provider_used=p.value,
                        model_used=res.model_name,
                    )
                except Exception as e:
                    last_error = f"[{p.value}/{model_name}] {str(e)}"
                    logger.warning("Local GPU LLM execution error: %s", e)
                    continue

            try:
                # Use json_object response_format where supported
                kwargs: dict[str, Any] = {
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": "You are a professional B2B product data enrichment engine. Respond in strict JSON format."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.3,
                }
                
                # Providers with full JSON mode support
                if p in (FreeLLMProvider.GROQ, FreeLLMProvider.GEMINI, FreeLLMProvider.KIMI, FreeLLMProvider.OPENROUTER, FreeLLMProvider.OPENAI, FreeLLMProvider.DEEPSEEK, FreeLLMProvider.MISTRAL):
                    kwargs["response_format"] = {"type": "json_object"}

                response = client.chat.completions.create(**kwargs)
                content = response.choices[0].message.content or "{}"
                
                # Parse JSON, handling potential markdown code fencing
                cleaned_content = content.strip()
                if cleaned_content.startswith("```json"):
                    cleaned_content = cleaned_content[7:]
                if cleaned_content.startswith("```"):
                    cleaned_content = cleaned_content[3:]
                if cleaned_content.endswith("```"):
                    cleaned_content = cleaned_content[:-3]
                cleaned_content = cleaned_content.strip()

                data = json.loads(cleaned_content)

                return EnrichmentLLMResponse(
                    marketing_description=data.get("marketing_description", ""),
                    item_features=data.get("item_features", []),
                    short_desc=data.get("short_desc", ""),
                    application=data.get("application", ""),
                    success=True,
                    raw_response=content,
                    provider_used=p.value,
                    model_used=model_name,
                )

            except Exception as e:
                last_error = f"[{p.value}/{model_name}] {str(e)}"
                logger.warning("Free LLM call failed on %s: %s. Cascading to next provider...", p.value, e)
                continue

        # If all providers fail, return deterministic fallback
        fallback = self._local_fallback(mfg_part_num, part_desc, brand_name, mfg_name)
        fallback.raw_response = f"Cascaded through all providers; last error: {last_error}"
        return fallback

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
    ) -> LLMGenerationResponse:
        """
        Generic asynchronous text generation across free providers.
        Cascades automatically across available providers.
        """
        import asyncio

        def _sync_generate() -> LLMGenerationResponse:
            if not self._clients:
                return LLMGenerationResponse(
                    content="",
                    model="none",
                    provider="none",
                    success=False,
                )

            order = [
                FreeLLMProvider.GROQ,
                FreeLLMProvider.GEMINI,
                FreeLLMProvider.OPENROUTER,
                FreeLLMProvider.OPENAI,
                FreeLLMProvider.DEEPSEEK,
                FreeLLMProvider.MISTRAL,
                FreeLLMProvider.OLLAMA,
                FreeLLMProvider.KIMI,
            ]

            if self.provider != FreeLLMProvider.AUTO:
                active_providers = [self.provider] if self.provider in self._clients else []
            else:
                active_providers = [p for p in order if p in self._clients]

            if not active_providers:
                return LLMGenerationResponse(
                    content="",
                    model="none",
                    provider="none",
                    success=False,
                )

            sys_msg = system_prompt or "You are Anvaya's industrial product intelligence assistant. Provide factual, precise answers."
            messages = [
                {"role": "system", "content": sys_msg},
                {"role": "user", "content": prompt},
            ]

            last_error = ""
            for p in active_providers:
                client = self._clients[p]
                model_name = self._get_model_for_provider(p)

                # Skip local GPU in text generation unless implemented
                if p in (FreeLLMProvider.LOCAL_GPU, FreeLLMProvider.LOCAL):
                    continue

                try:
                    response = client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                        temperature=temperature,
                    )
                    content = response.choices[0].message.content or ""
                    return LLMGenerationResponse(
                        content=content,
                        model=model_name,
                        provider=p.value,
                        success=True,
                        raw_response=content,
                    )
                except Exception as e:
                    last_error = f"[{p.value}/{model_name}] {str(e)}"
                    logger.warning("Free LLM generation failed on %s: %s. Cascading...", p.value, e)
                    continue

            return LLMGenerationResponse(
                content="",
                model="fallback",
                provider="fallback",
                success=False,
                raw_response=f"All providers failed. Last error: {last_error}",
            )

        return await asyncio.to_thread(_sync_generate)
