from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session

from backend.auth.dependencies import get_current_user, require_roles
from backend.auth.roles import UserRole
from backend.controllers.document_controller import process_uploaded_document
from backend.controllers.file_controller import save_uploaded_file
from backend.controllers.product_controller import (
    add_product,
    edit_product,
    find_product,
    list_products,
    remove_product,
)
from backend.db.database import get_db
from backend.schemas.file import FileUploadResponse
from backend.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)


api_router = APIRouter()


@api_router.get("/health")
def health_check() -> dict[str, str]:
    return {
        "status": "success",
        "message": "ANVAYA Backend is running",
    }


@api_router.post(
    "/files/upload",
    response_model=FileUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
) -> dict[str, str | int]:
    return await save_uploaded_file(file)


@api_router.post("/documents/process")
async def process_document_endpoint(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
) -> dict:
    uploaded = await save_uploaded_file(file)

    file_path = Path("data/uploads") / uploaded["stored_filename"]

    try:
        return process_uploaded_document(str(file_path))
    finally:
        if file_path.exists():
            file_path.unlink()


@api_router.get("/auth/me")
def get_current_user_info(
    current_user: dict = Depends(get_current_user),
) -> dict:
    return {
        "status": "success",
        "user": current_user,
    }


@api_router.get(
    "/products",
    response_model=list[ProductResponse],
)
def get_all_products(
    db: Session = Depends(get_db),
) -> list[ProductResponse]:
    return list_products(db)


@api_router.get(
    "/products/{product_id}",
    response_model=ProductResponse,
)
def get_single_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    return find_product(db, product_id)


@api_router.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        require_roles(UserRole.ENGINEER, UserRole.ADMIN)
    ),
):
    return add_product(db, product_data)


@api_router.put(
    "/products/{product_id}",
    response_model=ProductResponse,
)
def update_existing_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        require_roles(UserRole.ENGINEER, UserRole.ADMIN)
    ),
):
    return edit_product(
        db,
        product_id,
        product_data,
    )


@api_router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_existing_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(
        require_roles(UserRole.ADMIN)
    ),
) -> None:
    remove_product(db, product_id)