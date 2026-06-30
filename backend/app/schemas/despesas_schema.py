from pydantic import BaseModel


class DespesaCreateSchema(BaseModel):

    descricao: str

    categoria: str

    valor: float


class DespesaUpdateSchema(BaseModel):

    descricao: str | None = None

    categoria: str | None = None

    valor: float | None = None