from sqlalchemy.orm import Session
from app.models.reserva import (
    Reserva,
    StatusReserva
)
from app.models.quarto import (
    Quarto,
    StatusQuarto
)
from app.models.hospede import Hospede
from app.services.auditoria_services import AuditService

class ReservaService:
    @staticmethod
    def create(
        db: Session,
        reserva: Reserva,
        usuario_email: str
    ):
        #valida datas
        if reserva.check_out <= reserva.check_in:

            raise Exception(
                "Check-out deve ser maior que check-in"
            )

        #verifica hospede
        hospede = (
            db.query(Hospede)
            .filter(
                Hospede.id == reserva.hospede_id
            )
            .first()
        )

        if not hospede:

            raise Exception(
                "Hospede nao encontrado"
            )

        #verifica quarto
        quarto = (
            db.query(Quarto)
            .filter(
                Quarto.id == reserva.quarto_id
            )
            .first()
        )

        if not quarto:

            raise Exception(
                "Quarto nao encontrado"
            )

        #nao permite quarto em manutencao
        if quarto.status == StatusQuarto.manutencao:

            raise Exception(
                "Quarto em manutencao"
            )

        #nao permite quarto em limpeza
        if quarto.status == StatusQuarto.limpeza:

            raise Exception(
                "Quarto em limpeza"
            )

        #verifica conflito de datas
        conflito = (
            db.query(Reserva)
            .filter(
                Reserva.quarto_id == reserva.quarto_id,
                Reserva.status != StatusReserva.cancelada,
                Reserva.check_in < reserva.check_out,
                Reserva.check_out > reserva.check_in
            )
            .first()
        )

        if conflito:

            raise Exception(
                "Ja existe reserva para esse periodo"
            )

        #ocupa quarto
        quarto.status = StatusQuarto.ocupado

        db.add(reserva)

        db.commit()

        db.refresh(reserva)

        AuditService.log(
            db=db,
            hotel_id=reserva.hotel_id,
            email=usuario_email,
            acao="CRIAR_RESERVA",
            descricao=f"Reserva {reserva.id} criada"
        )
        return reserva

    @staticmethod
    def get_all(
        db: Session,
        hotel_id: int
    ):
        return (
            db.query(Reserva)
            .filter(
                Reserva.hotel_id == hotel_id
            )
            .all()
        )
    @staticmethod
    def get_by_id(
        db: Session,
        hotel_id: int,
        reserva_id: int
    ):
        return (
            db.query(Reserva)
            .filter(
                Reserva.hotel_id == hotel_id,
                Reserva.id == reserva_id
            )
            .first()
        )
    @staticmethod
    def finalizar(
        db: Session,
        reserva_id: int,
        hotel_id: int,
        usuario_email: str
    ):
        reserva = (
            db.query(Reserva)
            .filter(
                Reserva.id == reserva_id,
                Reserva.hotel_id == hotel_id
            )
            .first()
        )

        if not reserva:

            raise Exception(
                "Reserva nao encontrada"
            )

        reserva.status = (
            StatusReserva.finalizada
        )

        quarto = (
            db.query(Quarto)
            .filter(
                Quarto.id == reserva.quarto_id
            )
            .first()
        )

        if quarto:

            quarto.status = (
                StatusQuarto.disponivel
            )

        db.commit()

        AuditService.log(
            db=db,
            hotel_id=hotel_id,
            email=usuario_email,
            acao="FINALIZAR_RESERVA",
            descricao=f"Reserva {reserva.id} finalizada"
        )

        return reserva

    @staticmethod
    def cancelar(
        db: Session,
        reserva_id: int,
        hotel_id: int,
        usuario_email: str
    ):

        reserva = (
            db.query(Reserva)
            .filter(
                Reserva.id == reserva_id,
                Reserva.hotel_id == hotel_id
            )
            .first()
        )

        if not reserva:

            raise Exception(
                "Reserva nao encontrada"
            )

        reserva.status = (
            StatusReserva.cancelada
        )

        quarto = (
            db.query(Quarto)
            .filter(
                Quarto.id == reserva.quarto_id
            )
            .first()
        )

        if quarto:

            quarto.status = (
                StatusQuarto.disponivel
            )

        db.commit()

        AuditService.log(
            db=db,
            hotel_id=hotel_id,
            email=usuario_email,
            acao="CANCELAR_RESERVA",
            descricao=f"Reserva {reserva.id} cancelada"
        )

        return reserva

    @staticmethod
    def delete(
        db: Session,
        reserva: Reserva
    ):

        db.delete(reserva)

        db.commit()