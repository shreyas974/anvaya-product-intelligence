from pathlib import Path

from backend.controllers.document_controller import process_uploaded_document
from backend.services.ai_service import generate_ai_response


async def run_document_pipeline(path: str) -> dict:
    """
    Run the backend document-processing pipeline.

    Flow:
    document processing
    -> normalization
    -> validation
    -> evidence
    -> AI service
    """

    processed = process_uploaded_document(path)

    # Build a deterministic prompt from the processed document.
    if processed["file_type"] == "pdf":
        source_data = processed.get("text", "")
    else:
        source_data = processed.get("data", [])

    prompt = (
        "Analyze the following processed industrial product document "
        "and return a concise useful summary.\n\n"
        f"{source_data}"
    )

    ai_response = await generate_ai_response(prompt)

    processed["ai_response"] = ai_response
    processed["pipeline_status"] = "completed"

    return processed
