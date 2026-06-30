from pydantic import BaseModel
from pydantic import EmailStr
from pydantic import field_validator


class RegisterSchema(BaseModel):
    nome: str
    cpf: str

    email: EmailStr
    senha: str

    nome_empresa: str
    cnpj: str

    endereco: str

    tipo_hospedagem: str


class LoginSchema(BaseModel):
    email: EmailStr
    senha: str


class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordSchema(BaseModel):
    email: EmailStr


class ResetPasswordSchema(BaseModel):
    token: str
    nova_senha: str

    @field_validator("nova_senha")
    @classmethod
    def validar_senha(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError(
                "A senha deve ter no minimo 8 caracteres"
            )
        return v


class ChangePasswordSchema(BaseModel):
    senha_atual: str
    nova_senha: str

    @field_validator("nova_senha")
    @classmethod
    def validar_senha(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError(
                "A nova senha deve ter no minimo 8 caracteres"
            )
        return v