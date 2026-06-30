from sqlalchemy.orm import Session
from app.models.quarto import Quarto

class QuartoService:

    @staticmethod
    def create(
        db: Session,
        quarto: Quarto
    ):
        db.add(quarto)
        db.commit()
        db.refresh(quarto)

        return quarto

    @staticmethod
    def get_all(
        db: Session,
        hotel_id: int
    ):
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
        db.delete(quarto)
        db.commit()

    @staticmethod
    def update(
        db: Session,
        quarto: Quarto,
        data: dict
    ):
        for key, value in data.items():
            setattr(
                quarto,
                key,
                value
            )

        db.commit()
        db.refresh(quarto)

        return quarto