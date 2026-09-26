"""
app/core/errors.py
Consistent error response shape matching API_CONTRACT.md:
  { "error": "short_code", "message": "human readable message" }
"""
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppError(Exception):
    def __init__(self, status_code: int, error: str, message: str):
        self.status_code = status_code
        self.error = error
        self.message = message
        super().__init__(message)


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    # Collapse Pydantic validation errors into the contract's error shape
    first = exc.errors()[0] if exc.errors() else {}
    loc = " -> ".join(str(l) for l in first.get("loc", []))
    msg = first.get("msg", "Invalid input")
    return JSONResponse(
        status_code=422,
        content={"error": "validation_error", "message": f"{loc}: {msg}"},
    )


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.error, "message": exc.message},
    )


async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "message": "An unexpected error occurred."},
    )
