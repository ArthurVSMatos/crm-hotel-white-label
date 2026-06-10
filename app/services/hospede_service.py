from sqlalchemy.orm import Session
from app.models.hospede import Hospede

class HospedeService:

    @staticmethod
    def create(
        db: Session,
        hospede: Hospede
    ):

        #criacao hospede
        db.add(hospede)
        db.commit()
        db.refresh(hospede)

        return hospede

    @staticmethod
    def get_all(
        db: Session,
        hotel_id: int
    ):

        #listar os hospedes

        return db.query(
            Hospede
        ).filter(
            Hospede.hotel_id == hotel_id
        ).all()

    @staticmethod
    def get_by_id(
        db: Session,
        hotel_id: int,
        hospede_id: int
    ):
        #buscahospede
        return db.query(
            Hospede
        ).filter(
            Hospede.hotel_id == hotel_id,
            Hospede.id == hospede_id
        ).first()

    @staticmethod
    def delete(
        db: Session,
        hospede: Hospede
    ):

        db.delete(hospede)
        db.commit()