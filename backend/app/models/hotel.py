from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy.sql import func
from app.config.database import Base

class Hotel(Base):
    __tablename__ = "hotel"

    id = Column(Integer, primary_key=True, index=True)

    nome = Column(String(120), nullable=False)

    cpf = Column(String(14), unique=True)

    email = Column(String(150), unique=True, nullable=False)

    senha_hash = Column(Text, nullable=False)

    nome_empresa = Column(String(150), nullable=False)

    cnpj = Column(String(18), unique=True, nullable=False)

    endereco = Column(Text)

    tipo_hospedagem = Column(String(100))

    logo_url = Column(Text, nullable=True)

    ativo = Column(Boolean, default=True)

    criado_em = Column(
        DateTime,
        server_default=func.now()
    )