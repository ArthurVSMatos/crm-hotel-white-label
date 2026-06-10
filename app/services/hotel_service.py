from sqlalchemy.orm import Session
from app.models.hotel import Hotel

class HotelService:

    @staticmethod
    def get_hotel(
        db: Session,
        hotel_id: int
    ):

        #busca o hotel

        hotel = db.query(
            Hotel
        ).filter(
            Hotel.id == hotel_id
        ).first()

        return hotel

    @staticmethod
    def update_hotel(
        db: Session,
        hotel: Hotel,
        data: dict
    ):

        #atualiza oscampos

        for key, value in data.items():
            setattr(
                hotel,
                key,
                value
            )

        #salva alteracoes

        db.commit()
        db.refresh(hotel)

        return hotel