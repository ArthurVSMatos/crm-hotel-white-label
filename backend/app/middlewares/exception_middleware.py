from fastapi import HTTPException, Request
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
        except HTTPException as e:
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "success": False,
                    "detail": e.detail,
                    "message": e.detail
                },
                headers=getattr(e, "headers", None)
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "message": str(e)
                }
            )