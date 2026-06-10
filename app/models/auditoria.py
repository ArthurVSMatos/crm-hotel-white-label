from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from app.config.database import Base

class Auditoria(Base):

    __tablename__ = "auditoria"

    id = Column(
        Integer,
        primary_key=True
    )

    hotel_id = Column(
        Integer,
        nullable=False
    )

    usuario_email = Column(
        String(150),
        nullable=False
    )

    acao = Column(
        String(100),
        nullable=False
    )

    descricao = Column(Text)

    criado_em = Column(
        DateTime,
        server_default=func.now()
    )