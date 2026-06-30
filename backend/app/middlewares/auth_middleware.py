from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.config.security import (
    decode_access_token
)


class AuthMiddleware(
    BaseHTTPMiddleware
):
    async def dispatch(
        self,
        request: Request,
        call_next
    ):

        #permite preflight cors
        if request.method == "OPTIONS":
            return await call_next(
                request
            )

        #rotas publicas(caminho exato)

        public_routes = [
            "/",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/auth/login",
            "/auth/register",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/check-cpf",
            "/auth/check-cnpj",
            "/auth/check-email",
            "/health"
        ]

        if request.url.path in public_routes:
            return await call_next(
                request
            )

        #rotas publicas com prefixo caminho dinamico,ex: /vitrine/{slug}

        public_prefixes = [
            "/vitrine/"
        ]

        if any(
            request.url.path.startswith(prefixo)
            for prefixo in public_prefixes
        ):
            return await call_next(
                request
            )

        #buscar o token
        authorization = request.headers.get(
            "Authorization"
        )

        if not authorization:
            return JSONResponse(
                status_code=401,
                content={
                    "detail": "Token nao informado"
                }
            )

        try:

            token = authorization.replace(
                "Bearer ",
                ""
            )

            payload = decode_access_token(
                token
            )

            request.state.hotel_id = payload.get(
                "hotel_id"
            )

            request.state.email = payload.get(
                "email"
            )

        except Exception:

            return JSONResponse(
                status_code=401,
                content={
                    "detail": "Token invalido"
                }
            )

        return await call_next(
            request
        )