from enum import Enum
from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Date
from sqlalchemy import Text
from sqlalchemy import Numeric
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import CheckConstraint
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.sql import func
from app.config.database import Base
class StatusReserva(str, Enum):

    pendente = "pendente"

    ativa = "ativa"

    finalizada = "finalizada"

    cancelada = "cancelada"

class Reserva(Base):

    __tablename__ = "reserva"

    __table_args__ = (
        CheckConstraint(
            "check_out > check_in",
            name="chk_datas_reserva"
        ),
    )

    id = Column(
        Integer,
        primary_key=True
    )

    hotel_id = Column(
        Integer,
        ForeignKey(
            "hotel.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    hospede_id = Column(
        Integer,
        ForeignKey(
            "hospede.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    quarto_id = Column(
        Integer,
        ForeignKey(
            "quarto.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    check_in = Column(
        Date,
        nullable=False
    )

    check_out = Column(
        Date,
        nullable=False
    )

    valor_total = Column(
        Numeric(10, 2),
        nullable=False
    )

    valor_pago = Column(
        Numeric(10, 2),
        default=0
    )

    forma_pagamento = Column(Text)

    observacoes = Column(Text)

    status = Column(
        SQLEnum(StatusReserva),
        default=StatusReserva.ativa
    )

    criado_em = Column(
        DateTime,
        server_default=func.now()
    )