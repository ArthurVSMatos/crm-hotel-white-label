from datetime import datetime
from datetime import timedelta

from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.hotel import Hotel
from app.models.whitelabel import ConfiguracaoWhitelabel
from app.models.password_reset_token import PasswordResetToken
from app.schemas.auth_schema import (
    RegisterSchema,
    LoginSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
    ChangePasswordSchema
)
from app.config.settings import settings
from app.config.security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_reset_token,
    hash_reset_token
)
from app.services.email_service import EmailService

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

        #verificacao do cpf

        if payload.cpf:
            cpf_exists = db.query(
                Hotel
            ).filter(
                Hotel.cpf == payload.cpf
            ).first()

            if cpf_exists:
                raise HTTPException(
                    status_code=400,
                    detail="CPF ja cadastrado"
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
    def check_cpf(
        db: Session,
        cpf: str
    ):

        #usado no formulario de cadastro pra avisar em tempo real,
        #antes do usuario terminar de preencher tudo

        cpf_exists = db.query(
            Hotel
        ).filter(
            Hotel.cpf == cpf
        ).first()

        return {
            "disponivel": cpf_exists is None
        }

    @staticmethod
    def check_cnpj(
        db: Session,
        cnpj: str
    ):

        #mesma logica do check_cpf, so que pro cnpj (etapa 2 do cadastro)

        cnpj_exists = db.query(
            Hotel
        ).filter(
            Hotel.cnpj == cnpj
        ).first()

        return {
            "disponivel": cnpj_exists is None
        }

    @staticmethod
    def check_email(
        db: Session,
        email: str
    ):

        #mesma logica do check_cpf, so que pro email (etapa 1 do cadastro)

        email_exists = db.query(
            Hotel
        ).filter(
            Hotel.email == email
        ).first()

        return {
            "disponivel": email_exists is None
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
            "logo_url": hotel.logo_url,
            "ativo": hotel.ativo
        }

    @staticmethod
    def forgot_password(
        db: Session,
        payload: ForgotPasswordSchema
    ):

        #mensagem generica, igual independente do email existir ou nao

        resposta_generica = {
            "success": True,
            "message": (
                "Se existir uma conta vinculada a este e-mail, "
                "enviaremos instrucoes para redefinicao de senha."
            )
        }

        hotel = db.query(
            Hotel
        ).filter(
            Hotel.email == payload.email
        ).first()

        #nao revela se o email existe ou nao

        if not hotel:
            return resposta_generica

        #invalida tokens anteriores ainda validos deste hotel

        db.query(
            PasswordResetToken
        ).filter(
            PasswordResetToken.hotel_id == hotel.id,
            PasswordResetToken.used == False
        ).update(
            {"used": True}
        )

        #gera token seguro (valor cru vai por e-mail, hash vai pro banco)

        raw_token, token_hash = generate_reset_token()

        expires_at = datetime.utcnow() + timedelta(
            minutes=settings.RESET_PASSWORD_TOKEN_EXPIRE_MINUTES
        )

        reset_token = PasswordResetToken(
            hotel_id=hotel.id,
            token=token_hash,
            expires_at=expires_at,
            used=False
        )

        db.add(reset_token)
        db.commit()

        #monta link de redefinicao e envia e-mail

        link_reset = (
            f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
        )

        EmailService.enviar_email_recuperacao_senha(
            destinatario=hotel.email,
            link_reset=link_reset
        )

        return resposta_generica

    @staticmethod
    def reset_password(
        db: Session,
        payload: ResetPasswordSchema
    ):

        token_hash = hash_reset_token(payload.token)

        reset_token = db.query(
            PasswordResetToken
        ).filter(
            PasswordResetToken.token == token_hash
        ).first()

        #token inexistente, expirado ou ja usado -> mesmo erro generico

        token_invalido = (
            not reset_token
            or reset_token.used
            or reset_token.expires_at < datetime.utcnow()
        )

        if token_invalido:
            raise HTTPException(
                status_code=400,
                detail="Token invalido ou expirado"
            )

        hotel = db.query(
            Hotel
        ).filter(
            Hotel.id == reset_token.hotel_id
        ).first()

        if not hotel:
            raise HTTPException(
                status_code=400,
                detail="Token invalido ou expirado"
            )

        #atualiza a senha (com hash) e marca o token como usado

        hotel.senha_hash = hash_password(payload.nova_senha)
        reset_token.used = True

        db.commit()

        return {
            "success": True,
            "message": "Senha alterada com sucesso."
        }

    @staticmethod
    def change_password(
        db: Session,
        hotel_id: int,
        payload: ChangePasswordSchema
    ):

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

        #confirma que a senha atual esta correta antes de trocar

        if not verify_password(
            payload.senha_atual,
            hotel.senha_hash
        ):
            raise HTTPException(
                status_code=400,
                detail="Senha atual incorreta"
            )

        #nao deixa "trocar" pra mesma senha que ja tem

        if verify_password(
            payload.nova_senha,
            hotel.senha_hash
        ):
            raise HTTPException(
                status_code=400,
                detail="A nova senha deve ser diferente da senha atual"
            )

        hotel.senha_hash = hash_password(
            payload.nova_senha
        )

        db.commit()

        return {
            "success": True,
            "message": "Senha alterada com sucesso."
        }