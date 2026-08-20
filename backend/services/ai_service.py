import httpx

from backend.core.config import settings


class AIServiceError(Exception):
    """Raised when the AI service cannot be used."""


async def generate_ai_response(prompt: str) -> str:
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
        raise AIServiceError(
            "AI service request timed out"
        ) from exc

    except httpx.HTTPError as exc:
        raise AIServiceError(
            "Unable to reach AI service"
        ) from exc

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