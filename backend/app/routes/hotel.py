from fastapi import APIRouter
from fastapi import Depends
from fastapi import Request
from fastapi import HTTPException
from fastapi import UploadFile, File
import base64

from sqlalchemy.orm import Session

from app.config.database import get_db

from app.models.hotel import Hotel

from app.schemas.hotel_schema import HotelUpdateSchema

from app.services.hotel_service import (
    HotelService
)

router = APIRouter()


@router.get("/")
def get_hotel(
    request: Request,
    db: Session = Depends(get_db)
):

    hotel = HotelService.get_hotel(
        db,
        request.state.hotel_id
    )

    if not hotel:
        raise HTTPException(
            status_code=404,
            detail="Hotel nao encontrado"
        )

    return hotel


@router.put("/")
def update_hotel(
    payload: HotelUpdateSchema,
    request: Request,
    db: Session = Depends(get_db)
):

    hotel = HotelService.get_hotel(
        db,
        request.state.hotel_id
    )

    if not hotel:
        raise HTTPException(
            status_code=404,
            detail="Hotel nao encontrado"
        )

    email_em_uso = db.query(Hotel).filter(
        Hotel.email == payload.email,
        Hotel.id != hotel.id
    ).first()

    if email_em_uso:
        raise HTTPException(
            status_code=400,
            detail="Este email ja esta em uso por outra conta."
        )

    cnpj_em_uso = db.query(Hotel).filter(
        Hotel.cnpj == payload.cnpj,
        Hotel.id != hotel.id
    ).first()

    if cnpj_em_uso:
        raise HTTPException(
            status_code=400,
            detail="Este CNPJ ja esta cadastrado em outra conta."
        )

    return HotelService.update_hotel(
        db,
        hotel,
        payload.model_dump()
    )


@router.post("/logo")
async def upload_logo(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):


    hotel = HotelService.get_hotel(
        db,
        request.state.hotel_id
    )

    if not hotel:
        raise HTTPException(
            status_code=404,
            detail="Hotel nao encontrado"
        )

    conteudo = await file.read()
    mime = file.content_type or "image/png"
    b64 = base64.b64encode(conteudo).decode("utf-8")
    data_url = f"data:{mime};base64,{b64}"

    return HotelService.update_hotel(
        db,
        hotel,
        {"logo_url": data_url}
    )


@router.delete("/logo")
def remove_logo(
    request: Request,
    db: Session = Depends(get_db)
):

    hotel = HotelService.get_hotel(
        db,
        request.state.hotel_id
    )

    if not hotel:
        raise HTTPException(
            status_code=404,
            detail="Hotel nao encontrado"
        )

    return HotelService.update_hotel(
        db,
        hotel,
        {"logo_url": None}
    )