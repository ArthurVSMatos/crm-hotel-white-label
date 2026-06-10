from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import ForeignKey
from app.config.database import Base

class ConfiguracaoWhitelabel(Base):
    __tablename__ = "configuracoes_whitelabel"

    id = Column(Integer, primary_key=True)

    hotel_id = Column(
        Integer,
        ForeignKey("hotel.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    cor_primaria = Column(String(7))

    cor_secundaria = Column(String(7))

    logo_url = Column(Text)

    nome_sistema = Column(String(120))