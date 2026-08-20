from pydantic import BaseModel


class FileUploadResponse(BaseModel):
    filename: str
    stored_filename: str
    file_type: str
    file_size: int
    message: str
