from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
class TenantMiddleware(
    BaseHTTPMiddleware
):

    async def dispatch(
        self,
        request: Request,
        call_next
    ):

        #garanteo hotel logado
        if hasattr(
            request.state,
            "hotel_id"
        ):
            request.state.tenant = {
                "hotel_id": request.state.hotel_id
            }
        return await call_next(
            request
        )