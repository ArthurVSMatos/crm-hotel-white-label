from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_hotel():
    return {
        "message": "Hotel atual"
    }

@router.put("/")
def update_hotel():
    return {
        "message": "Atualizar hotel"
    }