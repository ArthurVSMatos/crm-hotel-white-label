from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Numeric
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func
from app.config.database import Base

class Financeiro(Base):

    __tablename__ = "financeiro"

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
        String(255),
        nullable=False
    )

    categoria = Column(
        String(100),
        nullable=False
    )

    tipo = Column(
        String(20),
        nullable=False,
        default="saida"
    )

    valor = Column(
        Numeric(10, 2),
        nullable=False
    )

    criado_em = Column(
        DateTime,
        server_default=func.now()
    )