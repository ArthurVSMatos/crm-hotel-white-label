from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import (
    BaseHTTPMiddleware
)

class ExceptionMiddleware(
    BaseHTTPMiddleware
):

  async def dispatch(
        self,
        request: Request,
        call_next
    ):
        try:

            return await call_next(
                request
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "message": str(e)
                }
            )