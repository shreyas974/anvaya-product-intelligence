"""
ai_provider.py -- Multi-Provider AI Abstraction Layer for ANVAYA

Provides a unified interface for AI model access with adapters for:
- Google Gemini (Google AI Studio free tier)
- Groq Cloud (ultra-fast free tier)
- OpenRouter (DeepSeek/Llama free models)
- Ollama (local, offline, private)

Routes tasks to appropriate providers:
- Classification → deterministic / ML model
- Content generation → LLM
- Structured extraction → LLM with JSON schema
- Chatbot → configured enterprise LLM
- Validation → deterministic engine (no AI needed)

Graceful degradation: if LLM unavailable, deterministic pipeline continues.
"""

import os
import json
import logging
from abc import ABC, abstractmethod
from typing import Any

import httpx

logger = logging.getLogger("anvaya.ai_provider")


class AIProviderError(Exception):
    """Raised when an AI provider fails."""


class AIProvider(ABC):
    """Abstract interface for AI model providers."""

    @abstractmethod
    async def generate(self, prompt: str, system_prompt: str | None = None, **kwargs: Any) -> str:
        """Generate a text response from the model."""

    @abstractmethod
    async def generate_json(self, prompt: str, system_prompt: str | None = None, **kwargs: Any) -> dict[str, Any]:
        """Generate a structured JSON response from the model."""

    @abstractmethod
    def is_available(self) -> bool:
        """Check if this provider is configured and ready."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Provider name for logging and UI display."""


class GeminiAdapter(AIProvider):
    """Google Gemini AI Studio adapter."""

    def __init__(self) -> None:
        self.api_key = os.environ.get("GEMINI_API_KEY", "")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.model = "gemini-2.0-flash"

    @property
    def name(self) -> str:
        return "Google Gemini"

    def is_available(self) -> bool:
        return bool(self.api_key) and self.api_key != "AIzaSyYourFreeGeminiApiKeyHere"

    async def generate(self, prompt: str, system_prompt: str | None = None, **kwargs: Any) -> str:
        url = f"{self.base_url}/models/{self.model}:generateContent?key={self.api_key}"
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": system_prompt}]})
            contents.append({"role": "model", "parts": [{"text": "Understood."}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(url, json={"contents": contents})
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    async def generate_json(self, prompt: str, system_prompt: str | None = None, **kwargs: Any) -> dict[str, Any]:
        text = await self.generate(
            f"{prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation.",
            system_prompt,
        )
        # Extract JSON from response
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        return json.loads(text)


class GroqAdapter(AIProvider):
    """Groq Cloud adapter (Llama 3.3 70B ultra-fast inference)."""

    def __init__(self) -> None:
        self.api_key = os.environ.get("GROQ_API_KEY", "")
        self.base_url = "https://api.groq.com/openai/v1"
        self.model = "llama-3.3-70b-versatile"

    @property
    def name(self) -> str:
        return "Groq Cloud"

    def is_available(self) -> bool:
        return bool(self.api_key) and self.api_key != "gsk_YourFreeGroqApiKeyHere"

    async def generate(self, prompt: str, system_prompt: str | None = None, **kwargs: Any) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"model": self.model, "messages": messages, "temperature": 0.1, "max_tokens": 2048},
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def generate_json(self, prompt: str, system_prompt: str | None = None, **kwargs: Any) -> dict[str, Any]:
        text = await self.generate(
            f"{prompt}\n\nIMPORTANT: Respond ONLY with valid JSON.",
            system_prompt,
        )
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        return json.loads(text)


class OpenRouterAdapter(AIProvider):
    """OpenRouter adapter (DeepSeek/Llama free models)."""

    def __init__(self) -> None:
        self.api_key = os.environ.get("OPENROUTER_API_KEY", "")
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "deepseek/deepseek-r1:free"

    @property
    def name(self) -> str:
        return "OpenRouter"

    def is_available(self) -> bool:
        return bool(self.api_key) and self.api_key != "sk-or-v1-YourFreeOpenRouterKeyHere"

    async def generate(self, prompt: str, system_prompt: str | None = None, **kwargs: Any) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "HTTP-Referer": "https://anvaya.dev",
                    "X-Title": "ANVAYA Product Intelligence",
                },
                json={"model": self.model, "messages": messages, "temperature": 0.1},
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def generate_json(self, prompt: str, system_prompt: str | None = None, **kwargs: Any) -> dict[str, Any]:
        text = await self.generate(f"{prompt}\n\nRespond ONLY with valid JSON.", system_prompt)
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        return json.loads(text)


class OllamaAdapter(AIProvider):
    """Ollama local adapter (100% offline and private)."""

    def __init__(self) -> None:
        self.base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434/v1")
        self.model = "qwen2.5:7b"

    @property
    def name(self) -> str:
        return "Ollama (Local)"

    def is_available(self) -> bool:
        try:
            import httpx as httpx_sync
            resp = httpx_sync.get(self.base_url.replace("/v1", "/api/tags"), timeout=2.0)
            return resp.status_code == 200
        except Exception:
            return False

    async def generate(self, prompt: str, system_prompt: str | None = None, **kwargs: Any) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(
                f"{self.base_url}/chat/completions",
                json={"model": self.model, "messages": messages, "temperature": 0.1},
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def generate_json(self, prompt: str, system_prompt: str | None = None, **kwargs: Any) -> dict[str, Any]:
        text = await self.generate(f"{prompt}\n\nRespond ONLY with valid JSON.", system_prompt)
        text = text.strip()
        if text.startswith("```"):
            text = text.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
        return json.loads(text)


# =========================================================================
# Provider Registry & Router
# =========================================================================

_providers: list[AIProvider] = [
    GeminiAdapter(),
    GroqAdapter(),
    OpenRouterAdapter(),
    OllamaAdapter(),
]


def get_available_providers() -> list[dict[str, Any]]:
    """List all configured and available AI providers."""
    return [
        {
            "name": p.name,
            "available": p.is_available(),
            "type": p.__class__.__name__,
        }
        for p in _providers
    ]


def get_active_provider() -> AIProvider | None:
    """Get the first available AI provider."""
    for p in _providers:
        if p.is_available():
            return p
    return None


async def ai_generate(prompt: str, system_prompt: str | None = None, **kwargs: Any) -> str:
    """
    Generate text using the best available AI provider.
    Falls back gracefully if no provider is configured.
    """
    provider = get_active_provider()
    if not provider:
        raise AIProviderError(
            "No AI provider configured. Deterministic pipeline continues. "
            "Configure GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, or start Ollama."
        )

    logger.info(f"Using AI provider: {provider.name}")
    try:
        return await provider.generate(prompt, system_prompt, **kwargs)
    except Exception as e:
        logger.error(f"AI provider {provider.name} failed: {e}")
        raise AIProviderError(f"AI provider {provider.name} error: {e}") from e


async def ai_generate_json(prompt: str, system_prompt: str | None = None, **kwargs: Any) -> dict[str, Any]:
    """Generate structured JSON using the best available AI provider."""
    provider = get_active_provider()
    if not provider:
        raise AIProviderError("No AI provider configured.")

    try:
        return await provider.generate_json(prompt, system_prompt, **kwargs)
    except json.JSONDecodeError as e:
        logger.error(f"AI provider {provider.name} returned invalid JSON: {e}")
        raise AIProviderError(f"AI returned invalid JSON: {e}") from e
    except Exception as e:
        logger.error(f"AI provider {provider.name} failed: {e}")
        raise AIProviderError(f"AI provider error: {e}") from e
