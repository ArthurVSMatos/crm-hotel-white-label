from fastapi import FastAPI
from app.database import engine
from app.database import Base

#cria tabelas do banco
Base.metadata.create_all(bind=engine)

#inicializacao da fastapi
app = FastAPI(
    title="hotel api"
)


#rota principale
@app.get("/")
def root():

    return {
        "status": "online"
    }