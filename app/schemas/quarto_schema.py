from decimal import Decimal

from pydantic import BaseModel


class QuartoCreateSchema(BaseModel):
    numero: str
    descricao: str | None = None

    valor_diaria: Decimal

    capacidade: int = 1


class QuartoUpdateSchema(BaseModel):
    numero: str

    descricao: str | None = None

    valor_diaria: Decimal

    capacidade: int

    status: str


class QuartoResponseSchema(BaseModel):
    id: int

    hotel_id: int

    numero: str

    descricao: str | None

    valor_diaria: Decimal

    capacidade: int

    status: str

    class Config:
        from_attributes = True