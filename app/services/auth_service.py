from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.hotel import Hotel
from app.models.whitelabel import ConfiguracaoWhitelabel
from app.schemas.auth_schema import (
    RegisterSchema,
    LoginSchema
)
from app.config.security import (
    hash_password,
    verify_password,
    create_access_token
)

class AuthService:

    @staticmethod
    def register(
        db: Session,
        payload: RegisterSchema
    ):

        #verifica oemail

        email_exists = db.query(
            Hotel
        ).filter(
            Hotel.email == payload.email
        ).first()

        if email_exists:
            raise HTTPException(
                status_code=400,
                detail="Email ja cadastrado"
            )

        #verificacao do cnpj

        cnpj_exists = db.query(
            Hotel
        ).filter(
            Hotel.cnpj == payload.cnpj
        ).first()

        if cnpj_exists:
            raise HTTPException(
                status_code=400,
                detail="CNPJ ja cadastrado"
            )

        #cria hotel

        hotel = Hotel(
            nome=payload.nome,
            cpf=payload.cpf,
            email=payload.email,
            senha_hash=hash_password(
                payload.senha
            ),
            nome_empresa=payload.nome_empresa,
            cnpj=payload.cnpj,
            endereco=payload.endereco,
            tipo_hospedagem=payload.tipo_hospedagem
        )

        db.add(hotel)
        db.commit()
        db.refresh(hotel)

        #cria whitelabel

        whitelabel = ConfiguracaoWhitelabel(
            hotel_id=hotel.id,
            nome_sistema=payload.nome_empresa,

            #cores padrao

            cor_primaria="#2563eb",
            cor_secundaria="#1e293b"
        )

        db.add(whitelabel)
        db.commit()


        token = create_access_token({
            "hotel_id": hotel.id,
            "email": hotel.email
        })


        return {
            "success": True,
            "message": "Hotel criado com sucesso",
            "access_token": token,
            "token_type": "bearer"
        }

    @staticmethod
    def login(
        db: Session,
        payload: LoginSchema
    ):


        hotel = db.query(
            Hotel
        ).filter(
            Hotel.email == payload.email
        ).first()

        if not hotel:
            raise HTTPException(
                status_code=401,
                detail="Credenciais invalidas"
            )

        #verifica senha

        if not verify_password(
            payload.senha,
            hotel.senha_hash
        ):
            raise HTTPException(
                status_code=401,
                detail="Credenciais invalidas"
            )


        token = create_access_token({
            "hotel_id": hotel.id,
            "email": hotel.email
        })

        #retorno

        return {
            "success": True,
            "hotel_id": hotel.id,
            "nome": hotel.nome,
            "email": hotel.email,
            "access_token": token,
            "token_type": "bearer"
        }

    @staticmethod
    def me(
        db: Session,
        hotel_id: int
    ):

        #busca o hotel

        hotel = db.query(
            Hotel
        ).filter(
            Hotel.id == hotel_id
        ).first()

        if not hotel:
            raise HTTPException(
                status_code=404,
                detail="Hotel nao encontrado"
            )

        #retorno
        return {
            "id": hotel.id,
            "nome": hotel.nome,
            "cpf": hotel.cpf,
            "email": hotel.email,
            "nome_empresa": hotel.nome_empresa,
            "cnpj": hotel.cnpj,
            "endereco": hotel.endereco,
            "tipo_hospedagem": hotel.tipo_hospedagem,
            "ativo": hotel.ativo
        }