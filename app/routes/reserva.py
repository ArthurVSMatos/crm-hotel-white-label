from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request
from sqlalchemy.orm import Session
from app.config.database import get_db
from app.models.reserva import Reserva
from app.schemas.reserva_schema import (
    ReservaCreateSchema,
    ReservaUpdateSchema
)
from app.services.reserva_service import (
    ReservaService
)
router = APIRouter(
    prefix="/reservas",
    tags=["Reservas"]
)

@router.post("/")
def create_reserva(
    payload: ReservaCreateSchema,
    request: Request,
    db: Session = Depends(get_db)
):

    try:

        reserva = Reserva(

            hotel_id=request.state.hotel_id,

            hospede_id=payload.hospede_id,

            quarto_id=payload.quarto_id,

            check_in=payload.check_in,

            check_out=payload.check_out,

            valor_total=payload.valor_total,

            valor_pago=payload.valor_pago,

            forma_pagamento=payload.forma_pagamento,

            observacoes=payload.observacoes
        )

        return ReservaService.create(
            db=db,
            reserva=reserva,
            usuario_email=request.state.email
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get("/")
def list_reservas(
    request: Request,
    db: Session = Depends(get_db)
):

    return ReservaService.get_all(
        db=db,
        hotel_id=request.state.hotel_id
    )


@router.get("/{reserva_id}")
def get_reserva(
    reserva_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    reserva = ReservaService.get_by_id(
        db=db,
        hotel_id=request.state.hotel_id,
        reserva_id=reserva_id
    )

    if not reserva:

        raise HTTPException(
            status_code=404,
            detail="Reserva nao encontrada"
        )

    return reserva


@router.put("/{reserva_id}/finalizar")
def finalizar_reserva(
    reserva_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    try:

        return ReservaService.finalizar(
            db=db,
            reserva_id=reserva_id,
            hotel_id=request.state.hotel_id,
            usuario_email=request.state.email
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.put("/{reserva_id}/cancelar")
def cancelar_reserva(
    reserva_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    try:

        return ReservaService.cancelar(
            db=db,
            reserva_id=reserva_id,
            hotel_id=request.state.hotel_id,
            usuario_email=request.state.email
        )

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.delete("/{reserva_id}")
def delete_reserva(
    reserva_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    reserva = ReservaService.get_by_id(
        db=db,
        hotel_id=request.state.hotel_id,
        reserva_id=reserva_id
    )

    if not reserva:

        raise HTTPException(
            status_code=404,
            detail="Reserva nao encontrada"
        )

    ReservaService.delete(
        db=db,
        reserva=reserva
    )

    return {
        "message": "Reserva removida"
    }