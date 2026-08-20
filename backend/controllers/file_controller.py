from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from backend.utils.file_validation import (
    validate_file_extension,
    validate_file_size,
)


UPLOAD_DIR = Path("data/uploads")
CHUNK_SIZE = 1024 * 1024  # 1 MB


async def save_uploaded_file(file: UploadFile) -> dict[str, str | int]:
    if not file.filename:
        raise ValueError("Filename is required.")

    extension = validate_file_extension(file.filename)

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    stored_filename = f"{uuid4().hex}{extension}"
    destination = UPLOAD_DIR / stored_filename

    total_size = 0

    try:
        with destination.open("wb") as output:
            while chunk := await file.read(CHUNK_SIZE):
                total_size += len(chunk)

                if total_size > 10 * 1024 * 1024:
                    raise ValueError("File size exceeds the 10 MB limit.")

                output.write(chunk)

        validate_file_size(total_size)

        return {
            "filename": file.filename,
            "stored_filename": stored_filename,
            "file_type": extension.lstrip("."),
            "file_size": total_size,
            "message": "File uploaded successfully.",
        }

    except Exception:
        if destination.exists():
            destination.unlink()
        raise

    finally:
        await file.close()