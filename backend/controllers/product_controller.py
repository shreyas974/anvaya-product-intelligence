from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.models.product import Product
from backend.schemas.product import ProductCreate, ProductUpdate
from backend.services.product_service import (
    create_product,
    delete_product,
    get_product,
    get_products,
    update_product,
)


def list_products(db: Session) -> list[Product]:
    return get_products(db)


def find_product(
    db: Session,
    product_id: int,
) -> Product:
    product = get_product(db, product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


def add_product(
    db: Session,
    product_data: ProductCreate,
) -> Product:
    return create_product(db, product_data)


def edit_product(
    db: Session,
    product_id: int,
    product_data: ProductUpdate,
) -> Product:
    product = find_product(db, product_id)

    return update_product(
        db,
        product,
        product_data,
    )


def remove_product(
    db: Session,
    product_id: int,
) -> None:
    product = find_product(db, product_id)

    delete_product(db, product)

    return product


def add_product(
    db: Session,
    product_data: ProductCreate,
) -> Product:
    return create_product(db, product_data)


def edit_product(
    db: Session,
    product_id: int,
    product_data: ProductUpdate,
) -> Product:
    product = find_product(db, product_id)

    return update_product(
        db,
        product,
        product_data,
    )


def remove_product(
    db: Session,
    product_id: int,
) -> None:
    product = find_product(db, product_id)

    delete_product(db, product)