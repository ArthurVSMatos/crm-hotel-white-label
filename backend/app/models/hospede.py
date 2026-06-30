from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey
from sqlalchemy.sql import func
from app.config.database import Base

class Hospede(Base):
    __tablename__ = "hospede"

    id = Column(Integer, primary_key=True)

    hotel_id = Column(
        Integer,
        ForeignKey("hotel.id", ondelete="CASCADE"),
        nullable=False
    )

    nome = Column(
        String(150),
        nullable=False
    )

    cpf = Column(String(14))

    telefone = Column(String(20))

    criado_em = Column(
        DateTime,
        server_default=func.now()
    )