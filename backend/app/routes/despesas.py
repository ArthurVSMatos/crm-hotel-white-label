from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request

from sqlalchemy.orm import Session

from app.config.database import get_db

from app.models.despesas import Despesa

from app.schemas.despesas_schema import (
    DespesaCreateSchema,
    DespesaUpdateSchema
)

from app.services.despesas_service import (
    DespesaService
)

router = APIRouter()


@router.post("/")
def create_despesa(
    payload: DespesaCreateSchema,
    request: Request,
    db: Session = Depends(get_db)
):

    despesa = Despesa(
        hotel_id=request.state.hotel_id,
        descricao=payload.descricao,
        categoria=payload.categoria,
        valor=payload.valor
    )

    return DespesaService.create(
        db,
        despesa
    )


@router.get("/")
def list_despesas(
    request: Request,
    db: Session = Depends(get_db)
):

    return DespesaService.get_all(
        db,
        request.state.hotel_id
    )


@router.get("/{despesa_id}")
def get_despesa(
    despesa_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    despesa = DespesaService.get_by_id(
        db,
        request.state.hotel_id,
        despesa_id
    )

    if not despesa:
        raise HTTPException(
            status_code=404,
            detail="Despesa nao encontrada"
        )

    return despesa


@router.put("/{despesa_id}")
def update_despesa(
    despesa_id: int,
    payload: DespesaUpdateSchema,
    request: Request,
    db: Session = Depends(get_db)
):

    despesa = DespesaService.get_by_id(
        db,
        request.state.hotel_id,
        despesa_id
    )

    if not despesa:
        raise HTTPException(
            status_code=404,
            detail="Despesa nao encontrada"
        )

    return DespesaService.update(
        db,
        despesa,
        payload.model_dump()
    )


@router.delete("/{despesa_id}")
def delete_despesa(
    despesa_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    despesa = DespesaService.get_by_id(
        db,
        request.state.hotel_id,
        despesa_id
    )

    if not despesa:
        raise HTTPException(
            status_code=404,
            detail="Despesa nao encontrada"
        )

    DespesaService.delete(
        db,
        despesa
    )

    return {
        "success": True,
        "message": "Despesa removida"
    }