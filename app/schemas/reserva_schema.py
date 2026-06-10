from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class ReservaCreateSchema(BaseModel):
    hospede_id: int

    quarto_id: int

    check_in: date

    check_out: date

    valor_total: Decimal

    valor_pago: Decimal = 0

    forma_pagamento: str | None = None

    observacoes: str | None = None


class ReservaUpdateSchema(BaseModel):
    check_in: date

    check_out: date

    valor_total: Decimal

    valor_pago: Decimal

    forma_pagamento: str | None = None

    observacoes: str | None = None

    status: str


class ReservaResponseSchema(BaseModel):
    id: int

    hotel_id: int

    hospede_id: int

    quarto_id: int

    check_in: date

    check_out: date

    valor_total: Decimal

    valor_pago: Decimal

    forma_pagamento: str | None

    observacoes: str | None

    status: str

    class Config:
        from_attributes = True