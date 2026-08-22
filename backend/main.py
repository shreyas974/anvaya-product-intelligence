from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.api.v1.router import api_router
from backend.core.config import settings


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    debug=settings.debug,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
allow_headers=["Authorization", "Content-Type"],
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


app.include_router(
    api_router,
    prefix="/api/v1",
)