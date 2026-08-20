from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    source_file: str
    file_type: str
    source_location: str
    field_name: str
    extracted_value: str
    confidence: float = Field(ge=0.0, le=1.0)
