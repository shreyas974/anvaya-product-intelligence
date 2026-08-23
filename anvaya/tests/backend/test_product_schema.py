import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

print("\nDEBUG PROJECT_ROOT:", PROJECT_ROOT)
print("DEBUG sys.path:", sys.path[:5])

import backend

print("DEBUG backend:", backend)
print("DEBUG backend file:", getattr(backend, "__file__", None))
print("DEBUG backend path:", getattr(backend, "__path__", None))

import backend.schemas

print("DEBUG backend.schemas:", backend.schemas)

from backend.schemas.product import ProductCreate, ProductUpdate


def test_product_create_valid():
    product = ProductCreate(part_number="ABC-123")
    assert product.part_number == "ABC-123"


def test_product_create_requires_part_number():
    from pydantic import ValidationError
    import pytest

    with pytest.raises(ValidationError):
        ProductCreate()


def test_product_update_allows_partial_update():
    product = ProductUpdate(brand="Updated Brand")
    assert product.brand == "Updated Brand"
