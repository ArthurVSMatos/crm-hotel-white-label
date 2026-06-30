from fastapi import APIRouter
from fastapi import Depends
from fastapi import Request

from sqlalchemy.orm import Session

from app.config.database import get_db

from app.schemas.auth_schema import (
    RegisterSchema,
    LoginSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    ChangePasswordSchema
)

from app.services.auth_service import (
    AuthService
)

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


@router.get("/check-cpf")
def check_cpf(
    cpf: str,
    db: Session = Depends(get_db)
):
    return AuthService.check_cpf(
        db=db,
        cpf=cpf
    )


@router.get("/check-cnpj")
def check_cnpj(
    cnpj: str,
    db: Session = Depends(get_db)
):
    return AuthService.check_cnpj(
        db=db,
        cnpj=cnpj
    )


@router.get("/check-email")
def check_email(
    email: str,
    db: Session = Depends(get_db)
):
    return AuthService.check_email(
        db=db,
        email=email
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
def me(
    request: Request,
    db: Session = Depends(get_db)
):
    return AuthService.me(
        db=db,
        hotel_id=request.state.hotel_id
    )


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordSchema,
    db: Session = Depends(get_db)
):
    return AuthService.forgot_password(
        db=db,
        payload=payload
    )


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordSchema,
    db: Session = Depends(get_db)
):
    return AuthService.reset_password(
        db=db,
        payload=payload
    )


@router.post("/change-password")
def change_password(
    payload: ChangePasswordSchema,
    request: Request,
    db: Session = Depends(get_db)
):
    return AuthService.change_password(
        db=db,
        hotel_id=request.state.hotel_id,
        payload=payload
    )