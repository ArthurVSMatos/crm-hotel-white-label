from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.database import Base


# tabela hotel
class Hotel(Base):

    __tablename__ = "hotel"

    # id uuid
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # nome do hotel
    nome = Column(String(150), nullable=False)

    # cnpj
    cnpj = Column(String(18), nullable=False, unique=True)

    # slug amigavel
    slug = Column(String(120), nullable=False, unique=True)

    # email
    email = Column(String(150), nullable=False, unique=True)

    # telefone
    telefone = Column(String(20))

    # tipo hospedagem
    tipo = Column(String(50), nullable=False)