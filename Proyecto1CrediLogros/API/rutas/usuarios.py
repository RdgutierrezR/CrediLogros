from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from controlador import usuarios
from datetime import timedelta

usuarios_bp = Blueprint("usuarios", __name__, url_prefix="/api/usuarios")

# -------------------- CRUD USUARIOS --------------------

# GET: Listar todos
@usuarios_bp.route("/", methods=["GET"])
def listar():
    lista = usuarios.listar_usuarios()
    return jsonify([u.to_dict() for u in lista])

# GET: Obtener por ID
@usuarios_bp.route("/<int:id_usuario>", methods=["GET"])
def obtener(id_usuario):
    usuario = usuarios.obtener_usuario(id_usuario)
    if usuario:
        return jsonify(usuario.to_dict())
    return jsonify({"error": "Usuario no encontrado"}), 404

# POST: Crear
@usuarios_bp.route("/", methods=["POST"])
def crear():
    data = request.get_json()
    nuevo = usuarios.crear_usuario(
        data["nombre"],
        data["correo"],
        data["contrasena"],
        data["rol_id"]
    )
    return jsonify(nuevo.to_dict()), 201

# PUT: Actualizar
@usuarios_bp.route("/<int:id_usuario>", methods=["PUT"])
def actualizar(id_usuario):
    data = request.get_json()
    usuario = usuarios.actualizar_usuario(
        id_usuario,
        data.get("nombre"),
        data.get("correo"),
        data.get("contrasena"),
        data.get("rol_id")
    )
    if usuario:
        return jsonify(usuario.to_dict())
    return jsonify({"error": "Usuario no encontrado"}), 404

# DELETE: Eliminar
@usuarios_bp.route("/<int:id_usuario>", methods=["DELETE"])
def eliminar(id_usuario):
    eliminado = usuarios.eliminar_usuario(id_usuario)
    if eliminado:
        return jsonify({"mensaje": "Usuario eliminado"})
    return jsonify({"error": "Usuario no encontrado"}), 404


# -------------------- AUTENTICACIÓN --------------------

# POST: Login
@usuarios_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    correo = data.get("correo")
    contrasena = data.get("contrasena")

    usuario = usuarios.obtener_por_correo(correo)
    if usuario and usuario.contrasena == contrasena:  # ⚠️ compara texto plano
        token = create_access_token(
            identity=usuario.id_usuario,
            additional_claims={"rol_id": usuario.rol_id},
            expires_delta=timedelta(hours=1)
        )
        return jsonify({
            "mensaje": "Login exitoso",
            "token": token ,
            "usuario": {
                "id_usuario": usuario.id_usuario,
                "nombre": usuario.nombre,
                "correo": usuario.correo,
                "rol_id": usuario.rol_id
            }
        })
    return jsonify({"error": "Credenciales inválidas"}), 401


# GET: Perfil del usuario autenticado
@usuarios_bp.route("/perfil", methods=["GET"])
@jwt_required()
def perfil():
    user_id = get_jwt_identity()
    usuario = usuarios.obtener_usuario(user_id)
    if usuario:
        return jsonify(usuario.to_dict())
    return jsonify({"error": "Usuario no encontrado"}), 404
