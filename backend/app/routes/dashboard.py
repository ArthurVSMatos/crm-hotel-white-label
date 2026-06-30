from fastapi import APIRouter
from fastapi import Depends
from fastapi import Request

from sqlalchemy.orm import Session

from app.config.database import get_db

from app.services.dashboard_service import (
    DashboardService
)

router = APIRouter()


@router.get("/")
def get_dashboard(
    request: Request,
    db: Session = Depends(get_db)
):

    return DashboardService.get_dashboard(
        db=db,
        hotel_id=request.state.hotel_id
    )