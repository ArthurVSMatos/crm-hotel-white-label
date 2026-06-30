from sqlalchemy.orm import Session

from app.models.despesas import Despesa


class DespesaService:

    @staticmethod
    def create(
        db: Session,
        despesa: Despesa
    ):

        db.add(despesa)

        db.commit()

        db.refresh(despesa)

        return despesa

    @staticmethod
    def get_all(
        db: Session,
        hotel_id: int
    ):

        return db.query(
            Despesa
        ).filter(
            Despesa.hotel_id == hotel_id
        ).all()

    @staticmethod
    def get_by_id(
        db: Session,
        hotel_id: int,
        despesa_id: int
    ):

        return db.query(
            Despesa
        ).filter(
            Despesa.hotel_id == hotel_id,
            Despesa.id == despesa_id
        ).first()

    @staticmethod
    def update(
        db: Session,
        despesa: Despesa,
        data: dict
    ):

        for key, value in data.items():

            if value is not None:

                setattr(
                    despesa,
                    key,
                    value
                )

        db.commit()

        db.refresh(despesa)

        return despesa

    @staticmethod
    def delete(
        db: Session,
        despesa: Despesa
    ):

        db.delete(despesa)

        db.commit()