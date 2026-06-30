from decimal import Decimal

from pydantic import BaseModel
from pydantic import Field
from pydantic import field_validator


STATUS_QUARTO_VALIDOS = {"disponivel", "ocupado", "manutencao", "limpeza"}


class QuartoCreateSchema(BaseModel):
    numero: str = Field(min_length=1, description="Nome ou número do quarto")
    descricao: str | None = None

    valor_diaria: Decimal = Field(gt=0, description="Valor da diária, deve ser maior que zero")

    capacidade: int = Field(default=1, ge=1)

    # campos opcionais, usados so na vitrine publica
    imagem_url: str | None = None
    descricao_vitrine: str | None = None
    visivel_vitrine: bool = True


class QuartoUpdateSchema(BaseModel):
    numero: str = Field(min_length=1)

    descricao: str | None = None

    valor_diaria: Decimal = Field(gt=0)

    capacidade: int = Field(ge=1)

    status: str

    # campos opcionais, usados so na vitrine publica
    imagem_url: str | None = None
    descricao_vitrine: str | None = None
    visivel_vitrine: bool = True

    @field_validator("status")
    @classmethod
    def validar_status(cls, v: str) -> str:
        if v not in STATUS_QUARTO_VALIDOS:
            raise ValueError(
                f'Status invalido. Use um dos seguintes: {", ".join(sorted(STATUS_QUARTO_VALIDOS))}.'
            )
        return v


class QuartoResponseSchema(BaseModel):
    id: int

    hotel_id: int

    numero: str

    descricao: str | None

    valor_diaria: Decimal

    capacidade: int

    status: str

    imagem_url: str | None = None
    descricao_vitrine: str | None = None
    visivel_vitrine: bool = True

    class Config:
        from_attributes = True


class QuartoVitrineSchema(BaseModel):

    id: int
    numero: str
    descricao: str | None
    descricao_vitrine: str | None
    valor_diaria: Decimal
    capacidade: int
    imagem_url: str | None

    class Config:
        from_attributes = True