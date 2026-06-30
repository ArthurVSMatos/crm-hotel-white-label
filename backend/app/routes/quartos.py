from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request
from fastapi import UploadFile, File
import base64

from sqlalchemy.orm import Session

from app.config.database import get_db

from app.models.quarto import Quarto
from app.models.reserva import Reserva

from app.schemas.quarto_schema import (
    QuartoCreateSchema,
    QuartoUpdateSchema
)

from app.services.quarto_service import (
    QuartoService
)

router = APIRouter()


@router.post("/")
def create_quarto(
    payload: QuartoCreateSchema,
    request: Request,
    db: Session = Depends(get_db)
):

    ja_existe = db.query(Quarto).filter(
        Quarto.hotel_id == request.state.hotel_id,
        Quarto.numero == payload.numero
    ).first()

    if ja_existe:
        raise HTTPException(
            status_code=400,
            detail=f'Já existe um quarto com o nome/número "{payload.numero}".'
        )

    quarto = Quarto(
        hotel_id=request.state.hotel_id,
        numero=payload.numero,
        descricao=payload.descricao,
        valor_diaria=payload.valor_diaria,
        capacidade=payload.capacidade,
        imagem_url=payload.imagem_url,
        descricao_vitrine=payload.descricao_vitrine,
        visivel_vitrine=payload.visivel_vitrine
    )

    return QuartoService.create(
        db,
        quarto
    )


@router.get("/")
def list_quartos(
    request: Request,
    db: Session = Depends(get_db)
):

    return QuartoService.get_all(
        db,
        request.state.hotel_id
    )


@router.get("/{quarto_id}")
def get_quarto(
    quarto_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    quarto = QuartoService.get_by_id(
        db,
        request.state.hotel_id,
        quarto_id
    )

    if not quarto:
        raise HTTPException(
            status_code=404,
            detail="Quarto nao encontrado"
        )

    return quarto


@router.put("/{quarto_id}")
def update_quarto(
    quarto_id: int,
    payload: QuartoUpdateSchema,
    request: Request,
    db: Session = Depends(get_db)
):

    quarto = QuartoService.get_by_id(
        db,
        request.state.hotel_id,
        quarto_id
    )

    if not quarto:
        raise HTTPException(
            status_code=404,
            detail="Quarto nao encontrado"
        )

    ja_existe = db.query(Quarto).filter(
        Quarto.hotel_id == request.state.hotel_id,
        Quarto.numero == payload.numero,
        Quarto.id != quarto_id
    ).first()

    if ja_existe:
        raise HTTPException(
            status_code=400,
            detail=f'Já existe um quarto com o nome/número "{payload.numero}".'
        )

    return QuartoService.update(
        db,
        quarto,
        payload.model_dump(exclude_unset=True)
    )


@router.delete("/{quarto_id}")
def delete_quarto(
    quarto_id: int,
    request: Request,
    db: Session = Depends(get_db)
):

    quarto = QuartoService.get_by_id(
        db,
        request.state.hotel_id,
        quarto_id
    )

    if not quarto:
        raise HTTPException(
            status_code=404,
            detail="Quarto nao encontrado"
        )

    tem_reserva = db.query(Reserva).filter(
        Reserva.quarto_id == quarto_id
    ).first()

    if tem_reserva:
        raise HTTPException(
            status_code=400,
            detail="Esse quarto possui reservas vinculadas e não pode ser excluído. "
                    "Desative-o (oculte da vitrine ou marque como manutenção) em vez de excluir."
        )

    QuartoService.delete(
        db,
        quarto
    )

    return {
        "success": True,
        "message": "Quarto removido"
    }


@router.post("/{quarto_id}/imagem")
async def upload_imagem_quarto(
    quarto_id: int,
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    quarto = QuartoService.get_by_id(
        db,
        request.state.hotel_id,
        quarto_id
    )

    if not quarto:
        raise HTTPException(
            status_code=404,
            detail="Quarto nao encontrado"
        )

    conteudo = await file.read()
    mime = file.content_type or "image/png"
    b64 = base64.b64encode(conteudo).decode("utf-8")
    data_url = f"data:{mime};base64,{b64}"

    return QuartoService.update(
        db,
        quarto,
        {"imagem_url": data_url}
    )