from fastapi import FastAPI
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import Base, engine

from app.middlewares import (
    AuthMiddleware,
    TenantMiddleware,
    ExceptionMiddleware
)

# parte login/auth
from app.routes.auth import router as auth_router
# parte hotel
from app.routes.hotel import router as hotel_router
# parte quartos
from app.routes.quartos import router as quarto_router
# parte hospedes
from app.routes.hospede import router as hospede_router
# parte reservas/calendario
from app.routes.reserva import router as reserva_router
# parte dashboard
from app.routes.dashboard import (
    router as dashboard_router
)
# parte financeiro
from app.routes.despesas import router as despesa_router
from app.routes.financeiro import (
    router as financeiro_router
)
from app.routes.financeiro_pdf import (
    router as financeiro_pdf_router     
)
# parte vitrine
from app.routes.vitrine import (
    router as vitrine_router
)
Base.metadata.create_all(bind=engine)

#instancia da fastapi
app = FastAPI(
    title="DealFlow API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


#nomes tecnicos -> nomes amigaveis, usados na mensagem de erro de validacao
NOMES_CAMPO_AMIGAVEIS = {
    "nome": "Nome",
    "email": "Email",
    "senha": "Senha",
    "cpf": "CPF",
    "cnpj": "CNPJ",
    "nome_empresa": "Nome da empresa",
    "endereco": "Endereço",
    "tipo_hospedagem": "Tipo de hospedagem",
    "numero": "Número/nome do quarto",
    "descricao": "Descrição",
    "valor_diaria": "Valor da diária",
    "capacidade": "Capacidade",
    "status": "Status",
    "categoria": "Categoria",
    "tipo": "Tipo",
    "valor": "Valor",
    "check_in": "Check-in",
    "check_out": "Check-out",
    "vitrine_slug": "Endereço da vitrine",
    "vitrine_whatsapp": "WhatsApp",
}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError
):

    primeiro_erro = exc.errors()[0] if exc.errors() else None

    if primeiro_erro:
        campo_tecnico = primeiro_erro.get("loc", [])[-1] if primeiro_erro.get("loc") else "campo"
        campo = NOMES_CAMPO_AMIGAVEIS.get(str(campo_tecnico), str(campo_tecnico))
        mensagem = primeiro_erro.get("msg", "Dados invalidos.")
        detalhe = f"{campo}: {mensagem}"
    else:
        detalhe = "Dados invalidos. Verifique os campos e tente novamente."

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "detail": detalhe,
            "message": detalhe
        }
    )


#cors
app.add_middleware(ExceptionMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)
app.add_middleware(TenantMiddleware)


# parte basica
@app.get("/")
def root():

    return {
        "success": True,
        "name": "DealFlow API",
        "version": "1.0.0"
    }


@app.get("/health")
def health():

    return {
        "status": "online"
    }


@app.get("/api-info")
def api_info():

    return {
        "success": True,
        "name": "DealFlow API",
        "version": "1.0.0",
        "status": "online"
    }


# parte login/auth

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Auth"]
)


# parte hotel

app.include_router(
    hotel_router,
    prefix="/hotel",
    tags=["Hotel"]
)


# parte quartos

app.include_router(
    quarto_router,
    prefix="/quartos",
    tags=["Quartos"]
)


# parte hospedes

app.include_router(
    hospede_router,
    prefix="/hospedes",
    tags=["Hospedes"]
)


# parte reservas/calendario

app.include_router(
    reserva_router,
    prefix="/reservas",
    tags=["Reservas"]
)

# parte financeiro

app.include_router(
    despesa_router,
    prefix="/despesas",
    tags=["Despesas"]
)

app.include_router(
    financeiro_router,
    prefix="/financeiro",
    tags=["Financeiro"]
)

app.include_router(
    financeiro_pdf_router,
    prefix="/financeiro",
    tags=["Financeiro"]
)

# parte dashboard

app.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Dashboard"]
)

# parte vitrine

app.include_router(
    vitrine_router,
    tags=["Vitrine"]
)