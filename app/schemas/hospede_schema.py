from pydantic import BaseModel


class HospedeCreateSchema(BaseModel):
    nome: str

    cpf: str | None = None

    telefone: str | None = None


class HospedeUpdateSchema(BaseModel):
    nome: str

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