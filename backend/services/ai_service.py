from typing import Any

import httpx

from backend.core.config import settings


class AIServiceError(Exception):
    """Raised when the AI service cannot be used."""


async def generate_ai_response(prompt: str) -> str:
    """
    Legacy text-generation adapter used by POST /api/v1/ai/generate.
    Kept for compatibility with the existing router and tests.
    """
    if not settings.ai_service_url:
        raise AIServiceError("AI service is not configured")

    try:
        async with httpx.AsyncClient(
            timeout=settings.ai_service_timeout
        ) as client:
            response = await client.post(
                settings.ai_service_url,
                json={"prompt": prompt},
            )
            response.raise_for_status()

    except httpx.TimeoutException as exc:
        raise AIServiceError("AI service request timed out") from exc

    except httpx.HTTPError as exc:
        raise AIServiceError("Unable to reach AI service") from exc

    try:
        data = response.json()
    except ValueError:
        return response.text

    if isinstance(data, dict):
        for key in (
            "response",
            "text",
            "content",
            "output",
            "generated_text",
        ):
            if key in data:
                return str(data[key])

    return str(data)


async def enrich_product(product: dict[str, Any]) -> dict[str, Any]:
    """Send a product record to the AI enrichment microservice."""
    if not settings.ai_enrichment_url:
        raise AIServiceError("AI enrichment service is not configured")

    payload = {
        "Mfg_Part_Num": str(
            product.get("Mfg_Part_Num")
            or product.get("mfg_part_num")
            or product.get("part_num")
            or product.get("sku")
            or product.get("id")
            or "ANVAYA-UNKNOWN"
        ),
        "Part_Desc": str(
            product.get("Part_Desc")
            or product.get("part_desc")
            or product.get("description")
            or product.get("name")
            or ""
        ),
        "E1_Brand": product.get(
            "E1_Brand",
            product.get("e1_brand", "-- Unbranded --"),
        ),
        "Unilog_Brand": product.get(
            "Unilog_Brand",
            product.get("unilog_brand", "-- No Unilog Brand --"),
        ),
        "DIB_Brand": product.get(
            "DIB_Brand",
            product.get("dib_brand", "-- No DIB Brand --"),
        ),
        "Part_Manuf": product.get(
            "Part_Manuf",
            product.get("part_manuf", "Unknown"),
        ),
    }

    try:
        async with httpx.AsyncClient(
            timeout=settings.ai_service_timeout
        ) as client:
            response = await client.post(
                settings.ai_enrichment_url,
                json=payload,
            )
            response.raise_for_status()

    except httpx.TimeoutException as exc:
        raise AIServiceError("AI service request timed out") from exc

    except httpx.HTTPError as exc:
        raise AIServiceError("Unable to reach AI enrichment service") from exc

    try:
        data = response.json()
    except ValueError as exc:
        raise AIServiceError("AI service returned invalid JSON") from exc

    return data
