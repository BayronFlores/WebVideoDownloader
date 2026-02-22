from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from flask_bcrypt import check_password_hash
from models import Usuario, db

auth = Blueprint('auth', __name__)


@auth.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Usuario y contraseña requeridos"}), 400

    user = Usuario.query.filter_by(username=username).first()

    # Timing-safe: siempre se evalúa check_password_hash aunque no exista el usuario
    dummy_hash = "$2b$12$eiUra.fVGQpbFjX3OEMfW.QB9PjShRDkMhiAYzwE8WLlvBCH3h6e2"
    password_hash = user.password_hash if user else dummy_hash

    if user and check_password_hash(password_hash, password):
        login_user(user, remember=False)
        return jsonify({"mensaje": "Login exitoso", "username": user.username}), 200

    return jsonify({"error": "Credenciales inválidas"}), 401


@auth.route('/api/logout', methods=['POST', 'OPTIONS'])
@login_required
def logout():
    if request.method == 'OPTIONS':
        return '', 200

    logout_user()
    return jsonify({"mensaje": "Sesión cerrada"}), 200


@auth.route('/api/me', methods=['GET'])
def me():
    """Permite al frontend verificar si la sesión sigue activa al recargar la página."""
    if current_user.is_authenticated:
        return jsonify({"loggedIn": True, "username": current_user.username}), 200
    return jsonify({"loggedIn": False}), 200
