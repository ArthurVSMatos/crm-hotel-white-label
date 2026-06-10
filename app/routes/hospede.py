from fastapi import APIRouter
from app.schemas.hospede_schema import (
    HospedeCreateSchema,
    HospedeUpdateSchema
)

router = APIRouter()

@router.post("/")
def create_hospede(
    payload: HospedeCreateSchema
):
    return payload

@router.get("/")
def list_hospedes():
    return {
        "message": "Lista hóspedes"
    }

@router.get("/{hospede_id}")
def get_hospede(
    hospede_id: int
):
    return {
        "id": hospede_id
    }

@router.put("/{hospede_id}")
def update_hospede(
    hospede_id: int,
    payload: HospedeUpdateSchema
):
    return payload

@router.delete("/{hospede_id}")
def delete_hospede(
    hospede_id: int
):
    return {
        "deleted": hospede_id
    }