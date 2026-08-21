from pathlib import Path
from backend.services.pipeline_service import run_document_pipeline
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from backend.services.quality_service import calculate_quality_metrics
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
from backend.schemas.ai import AIGenerateRequest, AIGenerateResponse
from backend.schemas.document import DocumentProcessResponse
from backend.schemas.file import FileUploadResponse
from backend.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)
from backend.services.ai_service import (
    AIServiceError,
    generate_ai_response,
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


@api_router.post(
    "/documents/process",
    response_model=DocumentProcessResponse,
)
async def process_document_endpoint(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
) -> DocumentProcessResponse:
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

@api_router.post(
    "/documents/pipeline",
    response_model=DocumentProcessResponse,
)
async def run_document_pipeline_endpoint(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    uploaded = await save_uploaded_file(file)

    file_path = Path("data/uploads") / uploaded["stored_filename"]

    try:
        return await run_document_pipeline(str(file_path))
    finally:
        if file_path.exists():
            file_path.unlink()
# ---------------- AI ----------------

@api_router.post(
    "/ai/generate",
    response_model=AIGenerateResponse,
)
async def generate_ai(
    request: AIGenerateRequest,
    current_user: dict = Depends(get_current_user),
) -> AIGenerateResponse:
    try:
        result = await generate_ai_response(request.prompt)

    except AIServiceError as exc:
        message = str(exc)

        if message == "AI service is not configured":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=message,
            ) from exc

        if message == "AI service request timed out":
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=message,
            ) from exc

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=message,
        ) from exc

    return AIGenerateResponse(
        status="success",
        response=result,
    )

# ---------------- Quality ----------------

@api_router.get(
    "/quality/metrics",
)
def get_quality_metrics(
    db: Session = Depends(get_db),
):
    return {
        "success": True,
        "data": calculate_quality_metrics(db),
    }
# ---------------- Products ----------------

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
    # ---------------- Enrichment ----------------

@api_router.get("/enrichment/status/{job_id}")
def get_enrichment_status(job_id: str):
    """
    Return the current status of an enrichment job.
    Temporary backend implementation until the real enrichment
    pipeline/job service is connected.
    """
    return {
        "success": True,
        "data": {
            "jobId": job_id,
            "status": "in_progress",
            "progress": 50,
            "totalProducts": 4,
            "processedProducts": 2,
            "estimatedTimeRemainingSeconds": 6,
            "resultsSummary": {
                "enrichedCount": 2,
                "flaggedCount": 0,
                "errorCount": 0,
            },
        },
    }


# ---------------- Intelligence ----------------

@api_router.get("/intelligence/category-insights")
def get_category_insights(categorySlug: str | None = None):
    """
    Return category-level intelligence insights matching the
    frontend CategoryInsight API contract.
    """
    insights = [
        {
            "category": "General",
            "categorySlug": "general",
            "productCount": 0,
            "averageQualityScore": 100.0,
            "averagePrice": 0.0,
            "currency": "INR",
            "topBrands": [],
            "completenessRate": 100.0,
            "commonMissingAttributes": [],
            "priceRange": {
                "min": 0.0,
                "max": 0.0,
                "median": 0.0,
                "average": 0.0,
            },
            "keyAttributeCoverage": {},
        }
    ]

    if categorySlug:
        insights = [
            item
            for item in insights
            if item["categorySlug"].lower() == categorySlug.lower()
        ]

    return {
        "success": True,
        "data": insights,
    }


@api_router.get("/intelligence/duplicates")
def get_duplicates(
    minSimilarity: float | None = None,
    clusterId: str | None = None,
):
    """
    Return semantic duplicate clusters.
    Temporary implementation until the semantic duplicate
    detection service is connected.
    """
    clusters = []

    if clusterId:
        clusters = [
            cluster
            for cluster in clusters
            if cluster["clusterId"] == clusterId
        ]

    if minSimilarity is not None:
        normalized_similarity = (
            minSimilarity / 100
            if minSimilarity > 1
            else minSimilarity
        )

        clusters = [
            cluster
            for cluster in clusters
            if cluster["similarityScore"] >= normalized_similarity
        ]

    return {
        "success": True,
        "data": clusters,
        }


@api_router.get("/intelligence/taxonomy")
def get_taxonomy():

    """

    Return the canonical product taxonomy tree.

    Temporary backend implementation until the taxonomy

    service is connected.

    """

    return {

        "success": True,

        "data": [],

    }
