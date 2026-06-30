from enum import Enum

from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import Numeric
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy import UniqueConstraint
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.sql import func
from app.config.database import Base

class StatusQuarto(str, Enum):

    disponivel = "disponivel"

    ocupado = "ocupado"

    manutencao = "manutencao"

    limpeza = "limpeza"

class Quarto(Base):

    __tablename__ = "quarto"

    __table_args__ = (
        UniqueConstraint(
            "hotel_id",
            "numero",
            name="unique_quarto_hotel"
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

    numero = Column(
        String(20),
        nullable=False
    )

    descricao = Column(Text)

    valor_diaria = Column(
        Numeric(10, 2),
        nullable=False
    )

    capacidade = Column(
        Integer,
        default=1
    )

    status = Column(
        SQLEnum(StatusQuarto),
        default=StatusQuarto.disponivel
    )

    imagem_url = Column(Text, nullable=True)

    descricao_vitrine = Column(Text, nullable=True)

    visivel_vitrine = Column(
        Boolean,
        default=True
    )

    criado_em = Column(
        DateTime,
        server_default=func.now()
    )