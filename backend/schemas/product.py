from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductCreate(BaseModel):
    part_number: str = Field(min_length=1, max_length=100)
    brand: str | None = Field(default=None, max_length=100)
    model: str | None = Field(default=None, max_length=100)
    description: str | None = None

    @field_validator("part_number")
    @classmethod
    def validate_part_number(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Part number cannot be empty")

        return value

    @field_validator("brand", "model", "description")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        return value or None


class ProductUpdate(BaseModel):
    brand: str | None = Field(default=None, max_length=100)
    model: str | None = Field(default=None, max_length=100)
    description: str | None = None

    @field_validator("brand", "model", "description")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        return value or None


class ProductResponse(BaseModel):
    id: int
    part_number: str
    brand: str | None
    model: str | None
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)