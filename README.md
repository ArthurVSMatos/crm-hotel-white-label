# 🏨 CRM Hotel White Label

[![Python](https://img.shields.io/badge/python-3.12-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/flask-3.0+-green.svg)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-16-blue.svg)](https://www.postgresql.org/)

Sistema de gerenciamento hoteleiro com arquitetura **Multi-tenant**. O foco do projeto é permitir que diferentes hotéis utilizem a mesma plataforma, mas com identidades visuais (cores, logos) e dados totalmente isolados.

---

## 🚀 Tecnologias

* **Backend:** Flask (Python)
* **Banco de Dados:** PostgreSQL
* **ORM:** SQLAlchemy (Integração Banco -> Python)
* **Frontend:** React + Tailwind CSS (Em breve)

---

## 🛠️ Configuração do Ambiente

### 1. Requisitos
* Python 3.12+
* PostgreSQL rodando localmente

### 2. Instalação (Backend)
Entre na pasta do backend e configure o ambiente virtual:
```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
## 3. Banco de Dados
No seu terminal do PostgreSQL ou DBeaver, crie o banco de dados:

SQL
``
CREATE DATABASE crm_hotel;
``
Nota: Certifique-se de ajustar a URL de conexão no arquivo app.py com o seu usuário e senha do Postgres.

###📁 Estrutura de PastasPlaintext

```bash

├── backend/            # API, Modelos e Lógica do Servidor
├── frontend/           # Interface do Usuário (React)
├── docs/               # Documentação e Diagramas do DBA
└── .gitignore          # Arquivos ignorados pelo Git
```
## 👥 Equipe e Funções

| Nome | Função | GitHub |
| :--- | :--- | :--- |
| **Arthur Vinicius** | Líder & Backend Developer | [@ArthurVSMatos](https://github.com/ArthurVSMatos) |
| **Phelipe Gonçalves**| Frontend Developer | [@Liphez](https://github.com/Liphez) |
| **Artur Melo**| DBA | [@Melopjl](https://github.com/Melopjl) |
|  **Pedro Vinicius**| DBA | [@Melopjl](https://github.com/Melopjl) |
| **Brian Luka**| Documentação | [@Brianlk157](https://github.com/Brianlk157) |
| **Victor Gutemberg**| Tester | [@Melopjl](https://github.com/Melopjl) |
