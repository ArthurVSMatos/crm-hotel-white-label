from sqlalchemy.orm import Session
from app.models.quarto import Quarto

class QuartoService:

    @staticmethod
    def create(
        db: Session,
        quarto: Quarto
    ):
        #cria quarto
        db.add(quarto)
        db.commit()
        db.refresh(quarto)

        return quarto

    @staticmethod
    def get_all(
        db: Session,
        hotel_id: int
    ):
        #listaquartos

        return db.query(
            Quarto
        ).filter(
            Quarto.hotel_id == hotel_id
        ).all()

    @staticmethod
    def get_by_id(
        db: Session,
        hotel_id: int,
        quarto_id: int
    ):
        #busca o quarto
        return db.query(
            Quarto
        ).filter(
            Quarto.hotel_id == hotel_id,
            Quarto.id == quarto_id
        ).first()

    @staticmethod
    def delete(
        db: Session,
        quarto: Quarto
    ):

        #remov o quarto
        db.delete(quarto)
        db.commit()