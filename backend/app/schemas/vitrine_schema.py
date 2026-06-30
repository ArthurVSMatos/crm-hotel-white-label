from pydantic import BaseModel

from app.schemas.quarto_schema import QuartoVitrineSchema


class VitrineConfigSchema(BaseModel):
    """Configuracao da vitrine, editada pelo proprio hotel logado"""

    vitrine_slug: str | None = None
    vitrine_ativa: bool = True
    vitrine_whatsapp: str | None = None
    vitrine_titulo_hero: str | None = None
    vitrine_subtitulo_hero: str | None = None
    vitrine_texto_botao: str | None = None
    vitrine_horario_atendimento: str | None = None
    vitrine_mensagem_whatsapp: str | None = None
    cor_primaria: str | None = None
    cor_secundaria: str | None = None

    class Config:
        from_attributes = True


class VitrinePublicaSchema(BaseModel):
    """Tudo o que a pagina publica (sem login) precisa pra se montar"""

    nome_empresa: str
    endereco: str | None
    logo_url: str | None

    vitrine_slug: str
    vitrine_whatsapp: str | None
    vitrine_titulo_hero: str | None
    vitrine_subtitulo_hero: str | None
    vitrine_texto_botao: str | None
    vitrine_horario_atendimento: str | None
    vitrine_mensagem_whatsapp: str | None
    cor_primaria: str | None
    cor_secundaria: str | None

    quartos: list[QuartoVitrineSchema]
