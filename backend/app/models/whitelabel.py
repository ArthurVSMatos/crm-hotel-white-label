from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import Boolean
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


    # identificador usado na url publica
    vitrine_slug = Column(
        String(80),
        unique=True,
        nullable=True
    )

    # liga/desliga a pagina publica sem precisar apagar a configuracao
    vitrine_ativa = Column(
        Boolean,
        default=True
    )

    vitrine_whatsapp = Column(String(20))

    vitrine_titulo_hero = Column(String(150))

    vitrine_subtitulo_hero = Column(Text)

    vitrine_texto_botao = Column(String(60))

    vitrine_horario_atendimento = Column(String(150))

    vitrine_mensagem_whatsapp = Column(Text)