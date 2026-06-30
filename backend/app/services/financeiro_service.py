from sqlalchemy.orm import Session
from app.models.financeiro import Financeiro

class FinanceiroService:

    @staticmethod
    def create(
        db: Session,
        financeiro: Financeiro
    ):

        db.add(financeiro)

        db.commit()

        db.refresh(financeiro)

        return financeiro


    @staticmethod
    def get_all(
        db: Session,
        hotel_id: int
    ):

        return db.query(
            Financeiro
        ).filter(
            Financeiro.hotel_id == hotel_id
        ).all()


    @staticmethod
    def update(
        db: Session,
        financeiro: Financeiro,
        payload: dict
    ):

        financeiro.descricao = payload["descricao"]

        financeiro.categoria = payload["categoria"]

        financeiro.tipo = payload["tipo"]

        financeiro.valor = payload["valor"]

        db.commit()

        db.refresh(financeiro)

        return financeiro


    @staticmethod
    def delete(
        db: Session,
        financeiro: Financeiro
    ):

        db.delete(financeiro)

        db.commit()


    @staticmethod
    def get_by_id(
        db: Session,
        hotel_id: int,
        financeiro_id: int
    ):

        return db.query(
            Financeiro
        ).filter(
            Financeiro.hotel_id == hotel_id,
            Financeiro.id == financeiro_id
        ).first()