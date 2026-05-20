from pydantic import BaseModel


# dados recebidos da api
class HotelCreate(BaseModel):

    nome: str
    cnpj: str
    slug: str
    email: str
    telefone: str
    tipo: str