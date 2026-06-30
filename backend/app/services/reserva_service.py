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

from app.models.financeiro import Financeiro

from app.services.auditoria_services import (
    AuditService
)


class ReservaService:

    @staticmethod
    def create(
        db: Session,
        reserva: Reserva,
        usuario_email: str
    ):

        if reserva.check_out <= reserva.check_in:

            raise Exception(
                "Check-out deve ser maior que check-in"
            )

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

        if quarto.status == StatusQuarto.manutencao:

            raise Exception(
                "Quarto em manutencao"
            )

        if quarto.status == StatusQuarto.limpeza:

            raise Exception(
                "Quarto em limpeza"
            )

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
                "Este quarto ja esta ocupado nesse periodo. "
                "Escolha outro quarto ou outras datas."
            )

        quarto.status = (
            StatusQuarto.ocupado
        )

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

        reservas = (
            db.query(
                Reserva,
                Hospede.nome,
                Quarto.numero
            )
            .join(
                Hospede,
                Hospede.id == Reserva.hospede_id
            )
            .join(
                Quarto,
                Quarto.id == Reserva.quarto_id
            )
            .filter(
                Reserva.hotel_id == hotel_id
            )
            .all()
        )

        resultado = []

        for (
            reserva,
            hospede_nome,
            quarto_numero
        ) in reservas:

            resultado.append({

                "id":
                    reserva.id,

                "hospede_id":
                    reserva.hospede_id,

                "quarto_id":
                    reserva.quarto_id,

                "hospede_nome":
                    hospede_nome,

                "quarto_numero":
                    quarto_numero,

                "check_in":
                    reserva.check_in,

                "check_out":
                    reserva.check_out,

                "valor_total":
                    float(
                        reserva.valor_total
                    ),

                "valor_pago":
                    float(
                        reserva.valor_pago or 0
                    ),

                "forma_pagamento":
                    reserva.forma_pagamento,

                "observacoes":
                    reserva.observacoes,

                "status":
                    reserva.status.value,

                "criado_em":
                    reserva.criado_em

            })

        return resultado

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

        if reserva.status == StatusReserva.finalizada:

            raise Exception(
                "Esta reserva ja foi finalizada"
            )

        if reserva.status == StatusReserva.cancelada:

            raise Exception(
                "Uma reserva cancelada nao pode ser finalizada"
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

        # Cria entrada no financeiro automaticamente
        entrada = Financeiro(
            hotel_id=hotel_id,
            descricao=f"Reserva #{reserva.id} finalizada",
            categoria="Hospedagem",
            tipo="entrada",
            valor=reserva.valor_pago or reserva.valor_total
        )

        db.add(entrada)

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

        if reserva.status == StatusReserva.finalizada:

            raise Exception(
                "Uma reserva finalizada nao pode ser cancelada"
            )

        if reserva.status == StatusReserva.cancelada:

            raise Exception(
                "Esta reserva ja esta cancelada"
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

    @staticmethod
    def get_calendar(
        db: Session,
        hotel_id: int
    ):

        reservas = (
            db.query(
                Reserva,
                Hospede.nome,
                Quarto.numero
            )
            .join(
                Hospede,
                Hospede.id == Reserva.hospede_id
            )
            .join(
                Quarto,
                Quarto.id == Reserva.quarto_id
            )
            .filter(
                Reserva.hotel_id == hotel_id
            )
            .all()
        )

        eventos = []

        for (
            reserva,
            hospede_nome,
            quarto_numero
        ) in reservas:

            eventos.append({

                "id": reserva.id,

                "title": hospede_nome,

                "start": str(
                    reserva.check_in
                ),

                "end": str(
                    reserva.check_out
                ),

                "hospede": hospede_nome,

                "quarto": quarto_numero,

                "valor": float(
                    reserva.valor_total
                ),

                "status": reserva.status.value

            })

        return eventos



    @staticmethod
    def update(
        db: Session,
        reserva_id: int,
        hotel_id: int,
        dados,
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
 
        if dados.check_out <= dados.check_in:
 
            raise Exception(
                "Check-out deve ser maior que check-in"
            )
 
        # se as datas mudarem, verifica conflito com outras reservas
        # do mesmo quarto 'exceto ela mesma e exceto canceladas'
        conflito = (
            db.query(Reserva)
            .filter(
                Reserva.quarto_id == reserva.quarto_id,
                Reserva.id != reserva.id,
                Reserva.status != StatusReserva.cancelada,
                Reserva.check_in < dados.check_out,
                Reserva.check_out > dados.check_in
            )
            .first()
        )
 
        if conflito:
 
            raise Exception(
                "Este quarto ja esta ocupado nesse periodo. "
                "Escolha outro quarto ou outras datas."
            )
 
        reserva.check_in = dados.check_in
        reserva.check_out = dados.check_out
        reserva.valor_total = dados.valor_total
        reserva.valor_pago = dados.valor_pago
        reserva.forma_pagamento = dados.forma_pagamento
        reserva.observacoes = dados.observacoes
 
        try:
            reserva.status = StatusReserva(dados.status)
        except ValueError:
            raise Exception(
                "Status invalido"
            )
 
        db.commit()
        db.refresh(reserva)
 
        AuditService.log(
            db=db,
            hotel_id=hotel_id,
            email=usuario_email,
            acao="EDITAR_RESERVA",
            descricao=f"Reserva {reserva.id} editada"
        )
 
        return reserva