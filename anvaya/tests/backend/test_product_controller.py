from unittest.mock import Mock

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

import pytest
from fastapi import HTTPException

from backend.controllers.product_controller import (
    add_product,
    edit_product,
    find_product,
    list_products,
)
from backend.schemas.product import ProductCreate, ProductUpdate


def test_list_products(monkeypatch):
    db = Mock()
    expected = [Mock(), Mock()]

    monkeypatch.setattr(
        "backend.controllers.product_controller.get_products",
        lambda db: expected,
    )

    assert list_products(db) == expected


def test_find_product_not_found(monkeypatch):
    db = Mock()

    monkeypatch.setattr(
        "backend.controllers.product_controller.get_product",
        lambda db, product_id: None,
    )

    with pytest.raises(HTTPException) as exc:
        find_product(db, 999)

    assert exc.value.status_code == 404


def test_add_product(monkeypatch):
    db = Mock()
    expected = Mock()

    monkeypatch.setattr(
        "backend.controllers.product_controller.create_product",
        lambda db, data: expected,
    )

    data = ProductCreate(part_number="ABC-123")

    assert add_product(db, data) == expected


def test_edit_product(monkeypatch):
    db = Mock()
    existing = Mock()
    expected = Mock()

    monkeypatch.setattr(
        "backend.controllers.product_controller.get_product",
        lambda db, product_id: existing,
    )

    monkeypatch.setattr(
        "backend.controllers.product_controller.update_product",
        lambda db, product, data: expected,
    )

    data = ProductUpdate(brand="Updated")

    assert edit_product(db, 1, data) == expected
