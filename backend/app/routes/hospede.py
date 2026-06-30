from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request

from sqlalchemy.orm import Session

from app.config.database import get_db

from app.models.hospede import Hospede
from app.models.reserva import Reserva

from app.schemas.hospede_schema import (
    HospedeCreateSchema,
    HospedeUpdateSchema
)

from app.services.hospede_service import (
    HospedeService
)

router = APIRouter()


@router.post("/")
def create_hospede(
    payload: HospedeCreateSchema,
    request: Request,
    db: Session = Depends(get_db)
):

    #cria o hospede
    hospede = Hospede(
        hotel_id=request.state.hotel_id,
        nome=payload.nome,
        cpf=payload.cpf,
        telefone=payload.telefone
    )

    return HospedeService.create(
        db,
        hospede
    )


@router.get("/")
def list_hospedes(
    request: Request,
    db: Session = Depends(get_db)
):

    #lista os hospedes do hotel
    return HospedeService.get_all(
        db,
        request.state.hotel_id
    )


@router.get("/{hospede_id}")
def get_hospede(
    hospede_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    #busca o hospede
    hospede = HospedeService.get_by_id(
        db,
        request.state.hotel_id,
        hospede_id
    )

    if not hospede:
        raise HTTPException(
            status_code=404,
            detail="Hospede nao encontrado"
        )

    return hospede


@router.put("/{hospede_id}")
def update_hospede(
    hospede_id: int,
    payload: HospedeUpdateSchema,
    request: Request,
    db: Session = Depends(get_db)
):

    #busca o hospede
    hospede = HospedeService.get_by_id(
        db,
        request.state.hotel_id,
        hospede_id
    )

    if not hospede:

        raise HTTPException(
            status_code=404,
            detail="Hospede nao encontrado"
        )

    #atualiza os dados
    return HospedeService.update(
        db,
        hospede,
        payload.model_dump()
    )


@router.delete("/{hospede_id}")
def delete_hospede(
    hospede_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    
    hospede = HospedeService.get_by_id(
        db,
        request.state.hotel_id,
        hospede_id
    )

    if not hospede:

        raise HTTPException(
            status_code=404,
            detail="Hospede nao encontrado"
        )

    tem_reserva = db.query(Reserva).filter(
        Reserva.hospede_id == hospede_id
    ).first()

    if tem_reserva:
        raise HTTPException(
            status_code=400,
            detail="Esse hóspede possui reservas vinculadas e não pode ser excluído."
        )


    HospedeService.delete(
        db,
        hospede
    )

    return {
        "success": True,
        "message": "Hospede removido"
    }