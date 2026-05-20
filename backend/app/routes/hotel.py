from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Hotel
from app.schemas import HotelCreate

#cria grupo de rotas
router = APIRouter()

#cria conexão com banco
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


#rota POST para cadastrar hotel
@router.post("/hotel/register")
def register_hotel(
    hotel: HotelCreate,
    db: Session = Depends(get_db)
):

    #cria objeto do hotel
    novo_hotel = Hotel(

        #define super admin
        super_admin_id=hotel.super_admin_id,

        #define nome
        nome=hotel.nome,

        #define cnpj
        cnpj=hotel.cnpj,

        #define slug
        slug=hotel.slug
    )

    #adiciona no banco
    db.add(novo_hotel)

    #salva alterações
    db.commit()

    #atualiza objetos
    db.refresh(novo_hotel)

    #retorno resposta api
    return {
        "mensagem": "Hotel criado com sucesso",
        "hotel_id": novo_hotel.id
    }