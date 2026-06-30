import re
import unicodedata

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.hotel import Hotel
from app.models.whitelabel import ConfiguracaoWhitelabel
from app.models.quarto import Quarto


def slugificar(texto: str) -> str:
    """Transforma um texto qualquer (ex: nome do hotel) em um slug de URL,
    ex: 'Pousada Mar Azul' -> 'pousada-mar-azul'."""

    texto = unicodedata.normalize("NFKD", texto or "")
    texto = texto.encode("ascii", "ignore").decode("ascii")
    texto = texto.lower().strip()
    texto = re.sub(r"[^a-z0-9]+", "-", texto)
    texto = re.sub(r"-+", "-", texto).strip("-")

    return texto or "minha-pousada"


class VitrineService:

    @staticmethod
    def get_or_create_config(
        db: Session,
        hotel_id: int
    ) -> ConfiguracaoWhitelabel:

        config = db.query(
            ConfiguracaoWhitelabel
        ).filter(
            ConfiguracaoWhitelabel.hotel_id == hotel_id
        ).first()

        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()

        if config:
            # hoteis cadastrados antes dessa feature ja tem whitelabel,
            # mas podem nao ter slug ainda — gera um automaticamente
            if not config.vitrine_slug:
                config.vitrine_slug = VitrineService.gerar_slug_unico(
                    db,
                    hotel.nome_empresa if hotel else f"hotel-{hotel_id}",
                    hotel_id
                )
                db.commit()
                db.refresh(config)

            return config

        # hoteis criados antes dessa feature podem nao ter whitelabel ainda
        slug_sugerido = VitrineService.gerar_slug_unico(
            db,
            hotel.nome_empresa if hotel else f"hotel-{hotel_id}",
            hotel_id
        )

        config = ConfiguracaoWhitelabel(
            hotel_id=hotel_id,
            nome_sistema=hotel.nome_empresa if hotel else None,
            cor_primaria="#2563eb",
            cor_secundaria="#1e293b",
            vitrine_ativa=True,
            vitrine_slug=slug_sugerido
        )

        db.add(config)
        db.commit()
        db.refresh(config)

        return config

    @staticmethod
    def get_config_com_hotel(
        db: Session,
        hotel_id: int
    ) -> dict:
        """Junta a configuracao da vitrine com dados do proprio hotel
        (como a logo) que o editor no painel precisa exibir."""

        config = VitrineService.get_or_create_config(db, hotel_id)
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()

        return {
            "vitrine_slug": config.vitrine_slug,
            "vitrine_ativa": config.vitrine_ativa,
            "vitrine_whatsapp": config.vitrine_whatsapp,
            "vitrine_titulo_hero": config.vitrine_titulo_hero,
            "vitrine_subtitulo_hero": config.vitrine_subtitulo_hero,
            "vitrine_texto_botao": config.vitrine_texto_botao,
            "vitrine_horario_atendimento": config.vitrine_horario_atendimento,
            "vitrine_mensagem_whatsapp": config.vitrine_mensagem_whatsapp,
            "cor_primaria": config.cor_primaria,
            "cor_secundaria": config.cor_secundaria,
            "logo_url": hotel.logo_url if hotel else None,
        }

    @staticmethod
    def gerar_slug_unico(
        db: Session,
        base: str,
        hotel_id: int
    ) -> str:

        slug_base = slugificar(base)
        slug = slug_base
        contador = 1

        while True:
            existente = db.query(
                ConfiguracaoWhitelabel
            ).filter(
                ConfiguracaoWhitelabel.vitrine_slug == slug,
                ConfiguracaoWhitelabel.hotel_id != hotel_id
            ).first()

            if not existente:
                return slug

            contador += 1
            slug = f"{slug_base}-{contador}"

    @staticmethod
    def atualizar_config(
        db: Session,
        hotel_id: int,
        dados: dict
    ) -> ConfiguracaoWhitelabel:

        config = VitrineService.get_or_create_config(db, hotel_id)

        novo_slug = dados.get("vitrine_slug")

        if novo_slug:
            novo_slug = slugificar(novo_slug)

            # garante que o slug e unico entre TODOS os hoteis, mas
            # nao bloqueia o proprio hotel de manter/reescrever o seu
            em_uso = db.query(
                ConfiguracaoWhitelabel
            ).filter(
                ConfiguracaoWhitelabel.vitrine_slug == novo_slug,
                ConfiguracaoWhitelabel.hotel_id != hotel_id
            ).first()

            if em_uso:
                raise HTTPException(
                    status_code=400,
                    detail="Esse endereco de vitrine ja esta em uso por outro hotel. Escolha outro."
                )

            dados["vitrine_slug"] = novo_slug
        elif "vitrine_slug" in dados:
            # o campo foi enviado vazio (ex: o hoteleiro apagou o texto).
            # Nunca deixamos a vitrine sem slug — sem ele, o link publico
            # para de funcionar e a pagina fica inacessivel. Mantemos o
            # slug atual em vez de salvar vazio.
            dados.pop("vitrine_slug")

        for chave, valor in dados.items():
            if hasattr(config, chave):
                setattr(config, chave, valor)

        db.commit()
        db.refresh(config)

        return config

    @staticmethod
    def buscar_publica_por_slug(
        db: Session,
        slug: str
    ):

        config = db.query(
            ConfiguracaoWhitelabel
        ).filter(
            ConfiguracaoWhitelabel.vitrine_slug == slug,
            ConfiguracaoWhitelabel.vitrine_ativa == True  # noqa: E712
        ).first()

        if not config:
            return None

        hotel = db.query(
            Hotel
        ).filter(
            Hotel.id == config.hotel_id,
            Hotel.ativo == True  # noqa: E712
        ).first()

        if not hotel:
            return None

        # so quartos marcados como visiveis na vitrine, do hotel certo
        # (isolamento: um hotel jamais ve quartos de outro)
        quartos = db.query(
            Quarto
        ).filter(
            Quarto.hotel_id == hotel.id,
            Quarto.visivel_vitrine == True  # noqa: E712
        ).all()

        return {
            "nome_empresa": hotel.nome_empresa,
            "endereco": hotel.endereco,
            "logo_url": hotel.logo_url,
            "vitrine_slug": config.vitrine_slug,
            "vitrine_whatsapp": config.vitrine_whatsapp,
            "vitrine_titulo_hero": config.vitrine_titulo_hero,
            "vitrine_subtitulo_hero": config.vitrine_subtitulo_hero,
            "vitrine_texto_botao": config.vitrine_texto_botao,
            "vitrine_horario_atendimento": config.vitrine_horario_atendimento,
            "vitrine_mensagem_whatsapp": config.vitrine_mensagem_whatsapp,
            "cor_primaria": config.cor_primaria,
            "cor_secundaria": config.cor_secundaria,
            "quartos": quartos,
        }
