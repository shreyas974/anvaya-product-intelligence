"""
logging_config.py -- Centralized application logging for ANVAYA backend.

Previously the app had no root logging configuration (only one stray
`logging.basicConfig` inside seeding_service.py), so most `logger.info` /
`logger.warning` calls across the codebase were silently dropped depending
on import order. This sets up one consistent, structured log format for
the whole process and adds a request-timing middleware.
"""

import logging
import sys
import time

from fastapi import FastAPI, Request


def configure_logging(debug: bool = False) -> None:
    """Configure root logging once, at process startup."""
    level = logging.DEBUG if debug else logging.INFO

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root = logging.getLogger()
    root.setLevel(level)
    # Avoid duplicate handlers if this is called more than once (e.g. reload)
    root.handlers = [handler]

    # Quiet down noisy third-party loggers unless in debug mode
    if not debug:
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
        logging.getLogger("httpx").setLevel(logging.WARNING)


def add_request_logging(app: FastAPI) -> None:
    """Attach a middleware that logs method, path, status, and latency for every request."""
    logger = logging.getLogger("anvaya.requests")

    @app.middleware("http")
    async def log_requests(request: Request, call_next):
        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            duration_ms = (time.perf_counter() - start) * 1000
            logger.exception(
                "%s %s failed after %.1fms", request.method, request.url.path, duration_ms
            )
            raise
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "%s %s -> %s (%.1fms)",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
        )
        return response
