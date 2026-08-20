from typing import Any

from pydantic import BaseModel, Field

from backend.schemas.evidence import EvidenceItem


class DocumentProcessResponse(BaseModel):
    file_type: str
    source_file: str
    rows: int | None = None
    columns: list[str] | None = None
    data: list[dict[str, Any]] | None = None
    pages: int | None = None
    text: str | None = None
    evidence: list[EvidenceItem] = Field(default_factory=list)
    ai_response: str | None = None
    pipeline_status: str | None = None
