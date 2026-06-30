from fastapi import APIRouter
from fastapi import Depends
from fastapi import Request
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.financeiro import Financeiro
from app.schemas.financeiro_schema import (
    FinanceiroCreateSchema,
    FinanceiroUpdateSchema
)
from app.services.financeiro_service import (
    FinanceiroService
)

router = APIRouter()
@router.get("/")
def listar_financeiro(
    request: Request,
    db: Session = Depends(get_db)
):

    return FinanceiroService.get_all(
        db,
        request.state.hotel_id
    )


@router.post("/")
def criar_financeiro(
    payload: FinanceiroCreateSchema,
    request: Request,
    db: Session = Depends(get_db)
):

    financeiro = Financeiro(
        hotel_id=request.state.hotel_id,
        descricao=payload.descricao,
        categoria=payload.categoria,
        tipo=payload.tipo,
        valor=payload.valor
    )

    return FinanceiroService.create(
        db,
        financeiro
    )


@router.put("/{financeiro_id}")
def editar_financeiro(
    financeiro_id: int,
    payload: FinanceiroUpdateSchema,
    request: Request,
    db: Session = Depends(get_db)
):

    financeiro = FinanceiroService.get_by_id(
        db,
        request.state.hotel_id,
        financeiro_id
    )

    if not financeiro:

        raise HTTPException(
            status_code=404,
            detail="Registro nao encontrado"
        )

    return FinanceiroService.update(
        db,
        financeiro,
        payload.model_dump()
    )


@router.delete("/{financeiro_id}")
def deletar_financeiro(
    financeiro_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    financeiro = FinanceiroService.get_by_id(
        db,
        request.state.hotel_id,
        financeiro_id
    )

    if not financeiro:

        raise HTTPException(
            status_code=404,
            detail="Registro nao encontrado"
        )

    FinanceiroService.delete(
        db,
        financeiro
    )

    return {
        "message": "Removido"
    }