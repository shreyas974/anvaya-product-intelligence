from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.api.v1.router import api_router
from backend.core.config import settings
from backend.db.database import Base, engine

logger = logging.getLogger("anvaya.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is ready without preloading any fake or benchmark customer datasets
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("ANVAYA Backend initialized in clean state (ready for user file uploads).")
    except Exception as e:
        logger.error(f"Startup initialization error: {e}")
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    debug=settings.debug,
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "message": "Request validation failed",
            "errors": exc.errors(),
        },
    )


@app.exception_handler(ValueError)
async def value_error_handler(
    request: Request,
    exc: ValueError,
) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={
            "status": "error",
            "message": str(exc),
        },
    )


# Mount routers for both /api/v1 and /api
app.include_router(
    api_router,
    prefix="/api/v1",
)
app.include_router(
    api_router,
    prefix="/api",
)