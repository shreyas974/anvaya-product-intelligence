from backend.controllers.document_controller import process_uploaded_document
from backend.services.ai_service import enrich_product, AIServiceError


async def run_document_pipeline(path: str) -> dict:
    """
    Run document processing, normalization, validation, evidence,
    and AI enrichment for tabular product data.
    """
    processed = process_uploaded_document(path)

    if processed["file_type"] == "pdf":
        processed["ai_response"] = None
        processed["pipeline_status"] = "completed_without_ai"
        processed["ai_message"] = (
            "PDF processed successfully; current AI microservice "
            "expects structured product records."
        )
        return processed

    ai_results = []

    for row in processed.get("data", []):
        try:
            ai_results.append(await enrich_product(row))
        except AIServiceError as exc:
            processed["ai_response"] = None
            processed["pipeline_status"] = "ai_error"
            processed["ai_message"] = str(exc)
            return processed

    processed["ai_response"] = ai_results
    processed["pipeline_status"] = "completed"

    return processed
