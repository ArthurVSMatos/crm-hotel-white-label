from fastapi import APIRouter
from app.schemas.quarto_schema import (
    QuartoCreateSchema,
    QuartoUpdateSchema
)

router = APIRouter()

@router.post("/")
def create_quarto(
    payload: QuartoCreateSchema
):
    return payload

@router.get("/")
def list_quartos():
    return {
        "message": "Lista quartos"
    }

@router.get("/{quarto_id}")
def get_quarto(
    quarto_id: int
):
    return {
        "quarto_id": quarto_id
    }

@router.put("/{quarto_id}")
def update_quarto(
    quarto_id: int,
    payload: QuartoUpdateSchema
):
    return payload

@router.delete("/{quarto_id}")
def delete_quarto(
    quarto_id: int
):
    return {
        "deleted": quarto_id
    }