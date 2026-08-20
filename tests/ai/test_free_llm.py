"""
test_free_llm.py -- Tests for Multi-Provider Free LLM Engine (Gemini, Groq, OpenRouter, Ollama, Kimi)
"""

import pytest
import os
from unittest.mock import MagicMock, patch

from ai.models.free_llm_engine import (
    FreeLLMEngine,
    FreeLLMProvider,
    EnrichmentLLMResponse,
    PROVIDER_DEFAULTS,
)
from ai.models.kimi_client import KimiClient
from ai.enrichment.description_generator import DescriptionGenerator


class TestFreeLLMEngine:
    """Tests for FreeLLMEngine initialization, routing, and fallback."""

    def test_local_fallback_when_no_credentials(self):
        """Engine should provide deterministic enrichment when no keys are available."""
        # Ensure environment variables are clear
        with patch.dict(os.environ, {}, clear=True):
            engine = FreeLLMEngine(provider="auto")
            assert not engine.is_available()

            res = engine.enrich_product_content(
                mfg_part_num="DCD771C2",
                part_desc="20V MAX Cordless Drill Driver",
                brand_name="DEWALT",
                mfg_name="Stanley Black & Decker",
                category="Power Tools",
            )

            assert res.success is True
            assert "DEWALT" in res.marketing_description
            assert "DCD771C2" in res.marketing_description
            assert len(res.item_features) > 0
            assert res.provider_used == "local_template"

    def test_provider_initialization_with_keys(self):
        """Test individual provider initialization."""
        # Gemini
        eng_gemini = FreeLLMEngine(provider="gemini", api_key="test_gemini_key")
        assert eng_gemini.is_available()
        assert "gemini" in eng_gemini.available_providers

        # Groq
        eng_groq = FreeLLMEngine(provider="groq", api_key="test_groq_key")
        assert eng_groq.is_available()
        assert "groq" in eng_groq.available_providers

        # OpenRouter
        eng_or = FreeLLMEngine(provider="openrouter", api_key="test_or_key")
        assert eng_or.is_available()
        assert "openrouter" in eng_or.available_providers

        # Ollama (no key required)
        eng_ollama = FreeLLMEngine(provider="ollama", base_url="http://localhost:11434/v1")
        assert eng_ollama.is_available()
        assert "ollama" in eng_ollama.available_providers

    def test_mocked_gemini_call(self):
        """Test successful enrichment using Google Gemini provider."""
        engine = FreeLLMEngine(provider="gemini", api_key="fake_key")
        
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content='{"marketing_description": "Gemini enriched power drill.", "item_features": ["High torque", "Brushless motor"], "short_desc": "DEWALT Drill", "application": "Construction"}'
                )
            )
        ]

        with patch.object(engine._clients[FreeLLMProvider.GEMINI].chat.completions, "create", return_value=mock_response):
            res = engine.enrich_product_content(
                mfg_part_num="DCD771C2",
                part_desc="Cordless Drill",
                brand_name="DEWALT",
            )

            assert res.success is True
            assert res.provider_used == "gemini"
            assert res.marketing_description == "Gemini enriched power drill."
            assert len(res.item_features) == 2

    def test_mocked_groq_call(self):
        """Test successful enrichment using Groq provider."""
        engine = FreeLLMEngine(provider="groq", api_key="fake_key")

        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content='```json\n{"marketing_description": "Groq fast enrichment.", "item_features": ["Ultra speed", "Compact"], "short_desc": "DEWALT Fast", "application": "Fast DIY"}\n```'
                )
            )
        ]

        with patch.object(engine._clients[FreeLLMProvider.GROQ].chat.completions, "create", return_value=mock_response):
            res = engine.enrich_product_content(
                mfg_part_num="DCD771C2",
                part_desc="Cordless Drill",
                brand_name="DEWALT",
            )

            assert res.success is True
            assert res.provider_used == "groq"
            assert res.marketing_description == "Groq fast enrichment."

    def test_mocked_ollama_call(self):
        """Test successful enrichment using local Ollama."""
        engine = FreeLLMEngine(provider="ollama")

        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content='{"marketing_description": "Local Qwen enriched product.", "item_features": ["Local safety"], "short_desc": "Ollama Drill", "application": "Local"}'
                )
            )
        ]

        with patch.object(engine._clients[FreeLLMProvider.OLLAMA].chat.completions, "create", return_value=mock_response):
            res = engine.enrich_product_content(
                mfg_part_num="DCD771C2",
                part_desc="Cordless Drill",
                brand_name="DEWALT",
            )

            assert res.success is True
            assert res.provider_used == "ollama"
            assert res.marketing_description == "Local Qwen enriched product."

    def test_cascading_failover(self):
        """When the first provider throws an error, engine cascades to the next available provider."""
        with patch.dict(os.environ, {"GROQ_API_KEY": "groq_key", "GEMINI_API_KEY": "gemini_key"}):
            engine = FreeLLMEngine(provider="auto")
            assert "groq" in engine.available_providers
            assert "gemini" in engine.available_providers

            # Groq raises Exception
            groq_mock = MagicMock(side_effect=Exception("Rate limit 429"))
            
            # Gemini succeeds
            gemini_response = MagicMock()
            gemini_response.choices = [
                MagicMock(
                    message=MagicMock(
                        content='{"marketing_description": "Gemini fallback success.", "item_features": ["Failover works"], "short_desc": "Drill", "application": "Pro"}'
                    )
                )
            ]
            gemini_mock = MagicMock(return_value=gemini_response)

            with patch.object(engine._clients[FreeLLMProvider.GROQ].chat.completions, "create", groq_mock):
                with patch.object(engine._clients[FreeLLMProvider.GEMINI].chat.completions, "create", gemini_mock):
                    res = engine.enrich_product_content(
                        mfg_part_num="DCD771C2",
                        part_desc="Drill",
                    )
                    assert res.success is True
                    assert res.provider_used == "gemini"
                    assert res.marketing_description == "Gemini fallback success."


class TestDescriptionGeneratorFreeLLM:
    """Tests for DescriptionGenerator integrating FreeLLMEngine."""

    def test_generator_deterministic(self):
        """Generator produces standard descriptions without LLM."""
        gen = DescriptionGenerator(use_llm=False)
        result = gen.generate(
            mfg_part_num="DCD771C2",
            part_desc="20V MAX Cordless Drill Driver Kit",
            brand_name="DEWALT",
            mfg_name="Stanley Black & Decker",
            product_name="Cordless Drill Driver",
            dimensions="10 x 4 x 8 in",
            category="Power Tools",
        )

        assert "DEWALT" in result.short_desc
        assert "DCD771C2" in result.short_desc
        assert "10 x 4 x 8 in" in result.short_desc
        assert result.item_features is not None and len(result.item_features) > 0
        assert result.confidence == 0.85

    def test_generator_with_free_llm(self):
        """Generator works with FreeLLMEngine."""
        gen = DescriptionGenerator(use_llm=True, provider="groq", api_key="fake_groq_key")
        assert gen._llm_engine is not None
        
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content='{"marketing_description": "AI Powered Marketing Desc.", "item_features": ["Smart torque", "Lightweight"], "short_desc": "DEWALT Cordless Drill", "application": "Residential/Pro"}'
                )
            )
        ]

        with patch.object(gen._llm_engine._clients[FreeLLMProvider.GROQ].chat.completions, "create", return_value=mock_response):
            result = gen.generate(
                mfg_part_num="DCD771C2",
                part_desc="20V MAX Cordless Drill Driver Kit",
                brand_name="DEWALT",
                product_name="Cordless Drill",
            )

            assert result.marketing_description == "AI Powered Marketing Desc."
            assert result.item_features is not None and len(result.item_features) == 2
            assert "free_llm_groq" in result.rule

    def test_kimi_backward_compatibility(self):
        """KimiClient should maintain backward compatibility."""
        client = KimiClient()
        res = client.enrich_product_content(
            mfg_part_num="123",
            part_desc="Test Widget",
            brand_name="Acme",
        )
        assert res.success is True
        assert "Acme" in res.marketing_description

    def test_local_gpu_generator_mock(self):
        """Test local GPU inference engine with mock."""
        from ai.models.local_llm_generator import LocalLLMGenerator, LocalLLMResult

        gen = LocalLLMGenerator()
        mock_pipe = MagicMock()
        mock_pipe.tokenizer.apply_chat_template = MagicMock(return_value="formatted_prompt")
        mock_pipe.tokenizer.eos_token_id = 0
        mock_pipe.return_value = [{"generated_text": 'formatted_prompt {"marketing_description": "Locally generated content", "item_features": ["F1", "F2"], "short_desc": "Local Part", "application": "Industry"}'}]

        with patch.object(LocalLLMGenerator, "get_pipeline", return_value=mock_pipe):
            res = gen.generate_product_content(
                mfg_part_num="XYZ123",
                part_desc="High Torque Motor",
                brand_name="Bosch",
            )
            assert res.success is True
            assert res.marketing_description == "Locally generated content"
            assert len(res.item_features) == 2

    def test_pipeline_with_free_llm(self):
        """Test EnrichmentPipeline end-to-end with LLM integration."""
        import pandas as pd
        from ai.enrichment.pipeline import EnrichmentPipeline

        df = pd.DataFrame([{
            "Mfg_Part_Num": "TEST999",
            "Part_Desc": "Heavy Duty Industrial Hammer Drill",
            "E1_Brand": "DEWALT",
            "Unilog_Brand": "",
            "DIB_Brand": "",
            "Part_Manuf": "DEWALT Tools",
        }])

        pipeline = EnrichmentPipeline(use_llm=True, provider="groq", api_key="fake_key")
        assert pipeline.desc_generator._llm_engine is not None
        
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content='{"marketing_description": "Pipeline enriched hammer drill.", "item_features": ["Feature 1", "Feature 2"], "short_desc": "DEWALT Hammer Drill", "application": "Construction"}'
                )
            )
        ]

        with patch.object(pipeline.desc_generator._llm_engine._clients[FreeLLMProvider.GROQ].chat.completions, "create", return_value=mock_response):
            out = pipeline.run(df)
            assert len(out.enriched_data) == 1
            assert out.enriched_data.iloc[0]["MARKETING_DESCRIPTION"] == "Pipeline enriched hammer drill."
            assert out.stats["descriptions_generated"] == 1

