from sqlalchemy.orm import Session
from app.models.auditoria import Auditoria
class AuditService:
    @staticmethod
    def log(
        db: Session,
        hotel_id: int,
        email: str,
        acao: str,
        descricao: str
    ):
        auditoria = Auditoria(
            hotel_id=hotel_id,

            usuario_email=email,

            acao=acao,

            descricao=descricao
        )
        db.add(auditoria)
        db.commit()