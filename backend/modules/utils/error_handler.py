from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from utils.app_errors import AppError


class ErrorHandler:
    """Registers the app's exception -> HTTP response mapping in one place,
    so services can raise domain errors without knowing about HTTP."""

    @staticmethod
    def register(app: FastAPI) -> None:
        @app.exception_handler(AppError)
        async def handle_app_error(request: Request, exc: AppError) -> JSONResponse:
            return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

        @app.exception_handler(RequestValidationError)
        async def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
            # exc.errors() can embed the raised ValueError inside ctx, which
            # isn't JSON-serializable on its own — jsonable_encoder strips it
            # down to plain types the same way FastAPI's default handler does.
            return JSONResponse(status_code=422, content={"detail": jsonable_encoder(exc.errors())})
