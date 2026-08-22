from pathlib import Path


ALLOWED_EXTENSIONS = {".pdf", ".csv", ".xlsx", ".xls"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_file_extension(filename: str) -> str:
    extension = Path(filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            "Unsupported file type. Allowed types: PDF, CSV, XLSX, XLS."
        )

    return extension


def validate_file_size(file_size: int) -> None:
    if file_size <= 0:
        raise ValueError("Uploaded file is empty.")

    if file_size > MAX_FILE_SIZE:
        raise ValueError("File size exceeds the 10 MB limit.")
