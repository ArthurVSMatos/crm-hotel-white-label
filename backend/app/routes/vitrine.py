from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request

from sqlalchemy.orm import Session

from app.config.database import get_db

from app.schemas.vitrine_schema import VitrineConfigSchema

from app.services.vitrine_service import VitrineService

router = APIRouter()



@router.get("/vitrine/{slug}")
def get_vitrine_publica(
    slug: str,
    db: Session = Depends(get_db)
):

    dados = VitrineService.buscar_publica_por_slug(
        db,
        slug
    )

    if not dados:
        raise HTTPException(
            status_code=404,
            detail="Vitrine nao encontrada"
        )

    return dados



@router.get("/vitrine-config")
def get_vitrine_config(
    request: Request,
    db: Session = Depends(get_db)
):

    return VitrineService.get_config_com_hotel(
        db,
        request.state.hotel_id
    )


@router.put("/vitrine-config")
def update_vitrine_config(
    payload: VitrineConfigSchema,
    request: Request,
    db: Session = Depends(get_db)
):

    return VitrineService.atualizar_config(
        db,
        request.state.hotel_id,
        payload.model_dump(exclude_unset=True)
    )
