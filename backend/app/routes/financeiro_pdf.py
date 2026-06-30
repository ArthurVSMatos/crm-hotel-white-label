from io import BytesIO

from fastapi import APIRouter
from fastapi import Depends
from fastapi import Request

from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)

from reportlab.lib.styles import (
    getSampleStyleSheet
)

from app.config.database import get_db

from app.services.financeiro_service import (
    FinanceiroService
)

router = APIRouter()


@router.get("/pdf")
def exportar_pdf(
    request: Request,
    db: Session = Depends(get_db)
):

    despesas = FinanceiroService.get_all(
        db,
        request.state.hotel_id
    )

    buffer = BytesIO()

    doc = SimpleDocTemplate(buffer)

    styles = getSampleStyleSheet()

    elementos = []

    elementos.append(
        Paragraph(
            "Relatorio Financeiro",
            styles["Title"]
        )
    )

    elementos.append(
        Spacer(1, 20)
    )

    total = 0

    for despesa in despesas:

        total += float(
            despesa.valor
        )

        elementos.append(
            Paragraph(
                f"{despesa.descricao} - R$ {despesa.valor}",
                styles["BodyText"]
            )
        )

    elementos.append(
        Spacer(1, 20)
    )

    elementos.append(
        Paragraph(
            f"Total: R$ {total:.2f}",
            styles["Heading2"]
        )
    )

    doc.build(elementos)

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            "attachment; filename=financeiro.pdf"
        }
    )