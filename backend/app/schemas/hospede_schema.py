from pydantic import BaseModel
from pydantic import Field


class HospedeCreateSchema(BaseModel):
    nome: str = Field(min_length=1, description="Nome completo do hóspede")

    cpf: str | None = None

    telefone: str | None = None


class HospedeUpdateSchema(BaseModel):
    nome: str = Field(min_length=1)

    cpf: str | None = None

    telefone: str | None = None


class HospedeResponseSchema(BaseModel):
    id: int

    hotel_id: int

    nome: str

    cpf: str | None

    telefone: str | None

    class Config:
        from_attributes = True