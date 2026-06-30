from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import Numeric
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func

from app.config.database import Base


class Despesa(Base):

    __tablename__ = "despesa"

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

    descricao = Column(
        Text,
        nullable=False
    )

    categoria = Column(
        String(100),
        nullable=False
    )

    valor = Column(
        Numeric(10, 2),
        nullable=False
    )

    criado_em = Column(
        DateTime,
        server_default=func.now()
    )