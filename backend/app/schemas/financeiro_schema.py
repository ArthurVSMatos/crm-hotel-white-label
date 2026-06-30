from decimal import Decimal

from pydantic import BaseModel
from pydantic import Field
from pydantic import field_validator


TIPOS_VALIDOS = {"entrada", "saida"}


class FinanceiroCreateSchema(BaseModel):
    descricao: str = Field(min_length=1, description="Descrição do lançamento")
    categoria: str = Field(min_length=1)
    tipo: str = "saida"
    valor: Decimal = Field(gt=0, description="Valor do lançamento, deve ser maior que zero")

    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, v: str) -> str:
        if v not in TIPOS_VALIDOS:
            raise ValueError('O tipo deve ser "entrada" ou "saida".')
        return v


class FinanceiroUpdateSchema(BaseModel):
    descricao: str = Field(min_length=1)
    categoria: str = Field(min_length=1)
    tipo: str = "saida"
    valor: Decimal = Field(gt=0)

    @field_validator("tipo")
    @classmethod
    def validar_tipo(cls, v: str) -> str:
        if v not in TIPOS_VALIDOS:
            raise ValueError('O tipo deve ser "entrada" ou "saida".')
        return v


class FinanceiroResponseSchema(BaseModel):
    id: int
    hotel_id: int
    descricao: str
    categoria: str
    tipo: str
    valor: Decimal

    class Config:
        from_attributes = True
