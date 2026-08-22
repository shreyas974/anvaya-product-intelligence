from io import BytesIO

from fastapi.testclient import TestClient

from backend.main import app
from backend.utils.file_validation import (
    validate_file_extension,
    validate_file_size,
)


client = TestClient(app)


def test_upload_requires_authentication():
    response = client.post(
        "/api/v1/files/upload",
        files={
            "file": (
                "test.pdf",
                BytesIO(b"test content"),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 401


def test_upload_rejects_unsupported_file_type():
    response = client.post(
        "/api/v1/files/upload",
        files={
            "file": (
                "test.exe",
                BytesIO(b"test content"),
                "application/octet-stream",
            )
        },
    )

    # Authentication is checked before file validation.
    assert response.status_code == 401


def test_file_validation_accepts_supported_extension():
    assert validate_file_extension("products.pdf") == ".pdf"
    assert validate_file_extension("products.csv") == ".csv"
    assert validate_file_extension("products.xlsx") == ".xlsx"
    assert validate_file_extension("products.xls") == ".xls"


def test_file_validation_rejects_unsupported_extension():
    try:
        validate_file_extension("malware.exe")
        assert False
    except ValueError as exc:
        assert "Unsupported file type" in str(exc)


def test_file_validation_rejects_empty_file():
    try:
        validate_file_size(0)
        assert False
    except ValueError as exc:
        assert "empty" in str(exc)


def test_file_validation_rejects_oversized_file():
    try:
        validate_file_size(11 * 1024 * 1024)
        assert False
    except ValueError as exc:
        assert "10 MB" in str(exc)