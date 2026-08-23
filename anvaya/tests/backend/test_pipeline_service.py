import asyncio
from unittest.mock import AsyncMock, patch

from backend.services.pipeline_service import run_document_pipeline


def test_document_pipeline_completes_successfully():
    processed_document = {
        "file_type": "csv",
        "source_file": "products.csv",
        "columns": ["name", "price"],
        "data": [
            {"name": "Product A", "price": 100},
        ],
        "evidence": [],
    }

    async def run_test():
        with patch(
            "backend.services.pipeline_service.process_uploaded_document",
            return_value=processed_document,
        ), patch(
            "backend.services.pipeline_service.generate_ai_response",
            new=AsyncMock(return_value="Product summary"),
        ) as mock_ai:
            result = await run_document_pipeline("products.csv")

        assert result["pipeline_status"] == "completed"
        assert result["ai_response"] == "Product summary"
        assert result["source_file"] == "products.csv"
        mock_ai.assert_awaited_once()

    asyncio.run(run_test())
