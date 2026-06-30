from pydantic import BaseModel
from pydantic import EmailStr
from pydantic import Field


class HotelUpdateSchema(BaseModel):

    nome: str = Field(min_length=1, description="Nome do responsavel")
    email: EmailStr

    nome_empresa: str = Field(min_length=1)
    cnpj: str = Field(min_length=1)

    endereco: str = Field(min_length=1)
    tipo_hospedagem: str = Field(min_length=1)


class HotelResponseSchema(BaseModel):
    id: int

    nome: str
    cpf: str | None

    email: EmailStr

    nome_empresa: str
    cnpj: str

    endereco: str | None

    tipo_hospedagem: str | None

    ativo: bool

    class Config:
        from_attributes = True