from pydantic import BaseModel
from pydantic import EmailStr


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