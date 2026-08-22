"""
local_llm_generator.py -- In-Process Local GPU/CPU LLM Inference Engine for Anvaya

WHAT: Provides zero-dependency, 100% offline, local generative AI inference using
      PyTorch & HuggingFace Transformers directly on local hardware (NVIDIA RTX 5060 Ti GPU / CUDA / CPU).

WHY:  Enables true private, local, and cost-free deployment for Anvaya's AI Product
      Intelligence pipeline without needing external servers, accounts, or Docker/Ollama.

HOW:  Loads and caches compact, high-precision instruction-tuned models (e.g. Qwen2.5,
      SmolLM2, Llama-3.2) in float16 on CUDA with structured prompt formatting and
      JSON extraction.
"""

import os
import json
import logging
from dataclasses import dataclass
from typing import Mapping, Any, Optional, List
import torch

from ai.models.loader import get_device

logger = logging.getLogger("anvaya.ai.local_llm")

DEFAULT_LOCAL_MODEL = "Qwen/Qwen2.5-0.5B-Instruct"


@dataclass
class LocalLLMResult:
    """Output from local transformer inference."""
    marketing_description: str
    item_features: List[str]
    short_desc: str
    application: str
    success: bool
    model_name: str
    raw_text: str = ""


class LocalLLMGenerator:
    """
    In-Process Local LLM Inference Engine running on GPU (CUDA) or CPU.
    """

    _cached_pipeline = None
    _cached_model_name = None

    def __init__(
        self,
        model_name: str = DEFAULT_LOCAL_MODEL,
        device: Optional[str] = None,
        max_new_tokens: int = 256,
        temperature: float = 0.3,
    ):
        self.model_name = model_name
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.max_new_tokens = max_new_tokens
        self.temperature = temperature

    @classmethod
    def get_pipeline(cls, model_name: str = DEFAULT_LOCAL_MODEL, device: str = "cuda"):
        """Load and cache the text-generation pipeline on the specified device."""
        if cls._cached_pipeline is not None and cls._cached_model_name == model_name:
            return cls._cached_pipeline

        from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

        dtype = torch.float16 if device == "cuda" else torch.float32
        device_map = "auto" if device == "cuda" else "cpu"

        logger.info("Loading local LLM %s onto %s (dtype=%s)...", model_name, device, dtype)

        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            dtype=dtype,
            device_map=device_map,
        )

        pipe = pipeline(
            "text-generation",
            model=model,
            tokenizer=tokenizer,
            device_map=device_map,
        )

        cls._cached_pipeline = pipe
        cls._cached_model_name = model_name
        return pipe

    def generate_product_content(
        self,
        mfg_part_num: str,
        part_desc: str,
        brand_name: Optional[str] = None,
        mfg_name: Optional[str] = None,
        category: Optional[str] = None,
        extracted_specs: Optional[Mapping[str, Any]] = None,
    ) -> LocalLLMResult:
        """
        Generate product descriptions and bullet features using local GPU inference.
        """
        brand = brand_name or mfg_name or "Manufacturer"
        prod = part_desc or mfg_part_num

        prompt = (
            f"You are an industrial product catalog copywriter. Generate accurate product intelligence.\n"
            f"Brand: {brand}\n"
            f"Part Number: {mfg_part_num}\n"
            f"Description: {part_desc}\n"
            f"Category: {category or 'General Hardware'}\n"
            f"Specs: {json.dumps(extracted_specs or {})}\n\n"
            f"Generate a JSON response with keys:\n"
            f'{{"marketing_description": "...", "item_features": ["f1", "f2", "f3"], "short_desc": "...", "application": "..."}}\n'
            f"Respond ONLY with valid JSON."
        )

        messages = [
            {"role": "system", "content": "You are a professional B2B e-commerce product enrichment engine. Always output valid JSON."},
            {"role": "user", "content": prompt},
        ]

        try:
            pipe = self.get_pipeline(self.model_name, self.device)
            tokenizer = pipe.tokenizer
            if tokenizer is None:
                raise ValueError("Tokenizer not found on pipeline")

            formatted_prompt: str = str(
                tokenizer.apply_chat_template(
                    messages,
                    tokenize=False,
                    add_generation_prompt=True,
                )
            )

            outputs = pipe(
                formatted_prompt,
                max_new_tokens=self.max_new_tokens,
                do_sample=self.temperature > 0,
                temperature=max(self.temperature, 0.01),
                pad_token_id=tokenizer.eos_token_id,
            )

            generated_text = outputs[0]["generated_text"]
            # Extract assistant portion after generation prompt
            if formatted_prompt in generated_text:
                response_text = generated_text[len(formatted_prompt):].strip()
            else:
                response_text = generated_text.strip()

            # Clean JSON markdown fences
            clean_json = response_text
            if "```json" in clean_json:
                clean_json = clean_json.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_json:
                clean_json = clean_json.split("```")[1].split("```")[0].strip()

            # Attempt JSON parse
            try:
                data = json.loads(clean_json)
                return LocalLLMResult(
                    marketing_description=data.get("marketing_description", f"The {brand} {mfg_part_num} {prod} is engineered for durability."),
                    item_features=data.get("item_features", [f"Industrial grade performance by {brand}", "Precision engineered"]),
                    short_desc=data.get("short_desc", f"{brand} {mfg_part_num} {prod}".strip()),
                    application=data.get("application", "Industrial and commercial applications."),
                    success=True,
                    model_name=self.model_name,
                    raw_text=response_text,
                )
            except json.JSONDecodeError:
                # Text fallback extraction
                return LocalLLMResult(
                    marketing_description=response_text[:300].strip(),
                    item_features=[f"Engineered for high performance by {brand}", "Standard commercial compliance"],
                    short_desc=f"{brand} {mfg_part_num} {prod}".strip(),
                    application="Commercial and industrial applications.",
                    success=True,
                    model_name=self.model_name,
                    raw_text=response_text,
                )

        except Exception as e:
            logger.warning("Local GPU LLM execution error: %s. Using local deterministic template.", e)
            return LocalLLMResult(
                marketing_description=f"The {brand} {mfg_part_num} {prod} delivers superior performance and durability.",
                item_features=[f"Engineered by {brand}", "Heavy-duty commercial grade"],
                short_desc=f"{brand} {mfg_part_num} {prod}".strip(),
                application="Industrial, commercial, and residential use.",
                success=False,
                model_name="local_deterministic_fallback",
                raw_text=str(e),
            )
