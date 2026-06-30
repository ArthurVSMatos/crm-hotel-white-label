from sqlalchemy.orm import Session

from app.models.quarto import (
    Quarto,
    StatusQuarto
)

from app.models.hospede import Hospede

from app.models.reserva import (
    Reserva,
    StatusReserva
)


class DashboardService:

    @staticmethod
    def get_dashboard(
        db: Session,
        hotel_id: int
    ):

        total_quartos = (
            db.query(Quarto)
            .filter(
                Quarto.hotel_id == hotel_id
            )
            .count()
        )

        quartos_ocupados = (
            db.query(Quarto)
            .filter(
                Quarto.hotel_id == hotel_id,
                Quarto.status == StatusQuarto.ocupado
            )
            .count()
        )

        total_hospedes = (
            db.query(Hospede)
            .filter(
                Hospede.hotel_id == hotel_id
            )
            .count()
        )

        reservas_ativas = (
            db.query(Reserva)
            .filter(
                Reserva.hotel_id == hotel_id,
                Reserva.status == StatusReserva.ativa
            )
            .count()
        )

        reservas = (
            db.query(Reserva)
            .filter(
                Reserva.hotel_id == hotel_id
            )
            .all()
        )

        faturamento_mes = sum(
            float(r.valor_pago or 0)
            for r in reservas
        )

        ocupacao = 0

        if total_quartos > 0:

            ocupacao = round(
                (
                    quartos_ocupados
                    / total_quartos
                ) * 100,
                2
            )

        return {
            "ocupacao": ocupacao,
            "total_quartos": total_quartos,
            "quartos_ocupados": quartos_ocupados,
            "total_hospedes": total_hospedes,
            "reservas_ativas": reservas_ativas,
            "faturamento_mes": faturamento_mes
        }