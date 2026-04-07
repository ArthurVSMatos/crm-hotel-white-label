from flask_sqlalchemy import SQLAlchemy
import uuid

db = SQLAlchemy()


class Hotel(db.Model):
    __tablename__ = 'hoteis'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cor_primaria = db.Column(db.String(7), default="#3B82F6")  # Hexadecimal
    logo_url = db.Column(db.Text)

    # Relacionamentos (Ajuda o SQLAlchemy a buscar dados vinculados)
    usuarios = db.relationship('Usuario', backref='hotel', lazy=True)
    hospedes = db.relationship('Hospede', backref='hotel', lazy=True)


class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hoteis.id'), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    papel = db.Column(db.String(20), default='usuario')  # 'admin' ou 'usuario'


class Hospede(db.Model):
    __tablename__ = 'hospedes'
    id = db.Column(db.Integer, primary_key=True)
    hotel_id = db.Column(db.Integer, db.ForeignKey('hoteis.id'), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    whatsapp = db.Column(db.String(20))