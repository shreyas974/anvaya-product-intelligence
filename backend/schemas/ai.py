from pydantic import BaseModel, Field


class AIGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=10000)


class AIGenerateResponse(BaseModel):
    status: str
    response: str
