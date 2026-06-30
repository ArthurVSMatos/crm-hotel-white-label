from datetime import datetime
from datetime import timedelta
from jose import jwt
from passlib.context import CryptContext
import secrets
import hashlib

from app.config.settings import settings

#hash das senhas
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

#geracao da hash
def hash_password(
    password: str
):

    return pwd_context.hash(
        password
    )

#verificacao hash
def verify_password(
    plain_password: str,
    hashed_password: str
):

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


#jwt
def create_access_token(
    data: dict
):

    payload = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload.update({
        "exp": expire
    })

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


#decodificajwt
def decode_access_token(
    token: str
):

    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.ALGORITHM]
    )


#geracao de token de recuperacao de senha
def generate_reset_token():

    raw_token = secrets.token_urlsafe(32)

    return raw_token, hash_reset_token(raw_token)


#hash do token de recuperacao(p permitir busca no banco)
def hash_reset_token(
    raw_token: str
):

    return hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()