from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.config import get_db
from app.schemas.auth_schema import (
    RegisterSchema,
    LoginSchema
)
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/register")
def register(
    payload: RegisterSchema,
    db: Session = Depends(get_db)
):
    return AuthService.register(
        db=db,
        payload=payload
    )

@router.post("/login")
def login(
    payload: LoginSchema,
    db: Session = Depends(get_db)
):
    return AuthService.login(
        db=db,
        payload=payload
    )

@router.get("/me")
def me():
    return {
        "message": "Implementar JWT depois"
    }