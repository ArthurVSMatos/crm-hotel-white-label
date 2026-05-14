from sqlalchemy import Column, Integer, String
from app.database import Base


# tabela hotel (teste inicial)
class Hotel(Base):

    # nome da tabela no banco
    __tablename__ = "hotel"

    # id primário
    id = Column(Integer, primary_key=True, index=True)

    # nome do hotel
    nome = Column(String(150), nullable=False)