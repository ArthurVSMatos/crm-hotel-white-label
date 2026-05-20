from fastapi import FastAPI
from sqlalchemy.orm import Session

from app.database import engine
from app.database import SessionLocal
from app.database import Base

from app.models import Hotel
from app.schemas import HotelCreate


# cria tabelas
Base.metadata.create_all(bind=engine)


# inicia fastapi
app = FastAPI(
    title="DealFlow API"
)


# rota principale
@app.get("/")
def root():

    return {
        "status": "online"
    }


# rota cadastro hotel
@app.post("/hotel/register")
def register_hotel(hotel: HotelCreate):

    # abre conexao banco
    db: Session = SessionLocal()

    try:

        # cria hotel
        novo_hotel = Hotel(
            nome=hotel.nome,
            cnpj=hotel.cnpj,
            slug=hotel.slug,
            email=hotel.email,
            telefone=hotel.telefone,
            tipo=hotel.tipo
        )

        # salva
        db.add(novo_hotel)
        db.commit()
        db.refresh(novo_hotel)

        return {
            "message": "hotel criado",
            "id": str(novo_hotel.id)
        }

    except Exception as e:

        db.rollback()

        return {
            "erro": str(e)
        }

    finally:

        db.close()