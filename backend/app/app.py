from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Hotel, Usuario
from urllib.parse import quote_plus  ## caso a sua senha do banco tenha @

app = Flask(__name__)
CORS(app) # Permite que o React acesse esta API sem erros de segurança

senha_com_at = ""

# Formata a Senha para ser aceita
senha_escapada = quote_plus(senha_com_at)

# Entrada do Banco
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://postgres:{senha_escapada}@localhost:5432/crm_hotel'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicializa o banco de dados no Flask
db.init_app(app)


# Ela cria e garante que as tabelas existam no Postgres assim que o servidor ligar.
with app.app_context():
    db.create_all()

# --- ROTAS DA API ---

@app.route('/')
def index():
    return jsonify({"status": "Online", "projeto": "CRM Hotel White Label"})

@app.route('/config/<int:hotel_id>', methods=['GET'])
def get_config(hotel_id):
    """
    Rota fundamental para o White Label.
    O React envia o ID do hotel e recebe as cores e a logo.
    """
    try:
        hotel = Hotel.query.get_or_404(hotel_id)
        return jsonify({
            "id": hotel.id,
            "nome": hotel.nome,
            "cor_primaria": hotel.cor_primaria,
            "logo_url": hotel.logo_url
        }), 200
    except Exception as e:
        return jsonify({"erro": "Hotel não encontrado", "detalhe": str(e)}), 404

@app.route('/usuarios', methods=['GET'])
def listar_usuarios():
    """Exemplo de listagem simples de usuários"""
    usuarios = Usuario.query.all()
    output = []
    for user in usuarios:
        output.append({"id": user.id, "nome": user.nome, "email": user.email, "papel": user.papel})
    return jsonify(output)

# --- INICIALIZAÇÃO ---
if __name__ == '__main__':
    # Rode com debug=True para ele reiniciar sozinho quando você salvar o código
    app.run(debug=True)
