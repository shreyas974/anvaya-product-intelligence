from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models.product import Product
from backend.schemas.product import ProductCreate, ProductUpdate


def get_products(db: Session) -> list[Product]:
    statement = select(Product).order_by(Product.id)

    return list(
        db.scalars(statement).all()
    )


def get_product(
    db: Session,
    product_id: int,
) -> Product | None:
    return db.get(Product, product_id)


def create_product(
    db: Session,
    product_data: ProductCreate,
) -> Product:
    product = Product(
        part_number=product_data.part_number,
        brand=product_data.brand,
        model=product_data.model,
        description=product_data.description,
    )

    db.add(product)
    db.commit()
    db.refresh(product)

    return product


def update_product(
    db: Session,
    product: Product,
    product_data: ProductUpdate,
) -> Product:
    update_data = product_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


def delete_product(
    db: Session,
    product: Product,
) -> None:
    db.delete(product)
    db.commit()