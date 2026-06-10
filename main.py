from fastapi import FastAPI
from app.config.database import Base
from app.config.database import engine
from app.middlewares import (
    AuthMiddleware,
    TenantMiddleware,
    ExceptionMiddleware
)
from app.routes.auth import router as auth_router
from app.routes.hotel import router as hotel_router
from app.routes.quartos import router as quarto_router
from app.routes.hospede import router as hospede_router
from app.routes.reserva import router as reserva_router

#cria_tabelas
Base.metadata.create_all(
    bind=engine
)

#instancia api
app = FastAPI(
    title="DealFlow API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


#middlewares
app.add_middleware(
    ExceptionMiddleware
)

app.add_middleware(
    AuthMiddleware
)

app.add_middleware(
    TenantMiddleware
)


#rota_raiz
@app.get("/")
def root():

    return {
        "success": True,
        "name": "DealFlow API",
        "version": "1.0.0"
    }

#checar see ta vivo
@app.get("/health")
def health():

    return {
        "status": "online"
    }

#rotas
app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Auth"]
)

app.include_router(
    hotel_router,
    prefix="/hotel",
    tags=["Hotel"]
)

app.include_router(
    quarto_router,
    prefix="/quartos",
    tags=["Quartos"]
)

app.include_router(
    hospede_router,
    prefix="/hospedes",
    tags=["Hospedes"]
)

app.include_router(
    reserva_router,
    prefix="/reservas",
    tags=["Reservas"]
)