from pydantic import BaseModel
from pydantic import EmailStr


class RegisterSchema(BaseModel):
    nome: str
    cpf: str | None = None

    email: EmailStr
    senha: str

    nome_empresa: str
    cnpj: str

    endereco: str | None = None

    tipo_hospedagem: str | None = None


class LoginSchema(BaseModel):
    email: EmailStr
    senha: str


class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"