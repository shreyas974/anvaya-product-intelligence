from pathlib import Path

import pandas as pd
import pymupdf


SUPPORTED_EXTENSIONS = {".pdf", ".csv", ".xlsx", ".xls"}


def _validate_path(path: str) -> Path:
    file_path = Path(path)

    if not file_path.exists():
        raise FileNotFoundError(f"Document not found: {path}")

    if not file_path.is_file():
        raise ValueError(f"Path is not a file: {path}")

    if file_path.suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise ValueError("Unsupported document type.")

    return file_path


def process_pdf(path: str) -> dict:
    file_path = _validate_path(path)
    document = pymupdf.open(file_path)

    try:
        text = "\n".join(page.get_text() for page in document)

        if not text.strip():
            raise ValueError("PDF contains no extractable text.")

        return {
            "file_type": "pdf",
            "pages": len(document),
            "text": text,
        }
    finally:
        document.close()


def process_tabular_file(path: str) -> dict:
    file_path = _validate_path(path)
    suffix = file_path.suffix.lower()

    if suffix == ".csv":
        dataframe = pd.read_csv(file_path)
    else:
        dataframe = pd.read_excel(file_path)

    if dataframe.empty:
        raise ValueError("Tabular document contains no data rows.")

    return {
        "file_type": suffix.lstrip("."),
        "rows": len(dataframe),
        "columns": list(dataframe.columns),
        "data": dataframe.to_dict(orient="records"),
    }


def process_document(path: str) -> dict:
    file_path = _validate_path(path)
    suffix = file_path.suffix.lower()

    if suffix == ".pdf":
        return process_pdf(str(file_path))

    return process_tabular_file(str(file_path))