from flask import Blueprint, request, jsonify
from controlador import roles as roles_controller

roles_bp = Blueprint("roles", __name__, url_prefix="/api/roles")

# GET: Listar todos
@roles_bp.route("/", methods=["GET"])
def listar():
    lista_roles = roles_controller.listar_roles()
    return jsonify([rol.to_dict() for rol in lista_roles])

# GET: Obtener uno por ID
@roles_bp.route("/<int:id_rol>", methods=["GET"])
def obtener(id_rol):
    rol = roles_controller.obtener_rol(id_rol)
    if rol:
        return jsonify(rol.to_dict())
    return jsonify({"error": "Rol no encontrado"}), 404

# POST: Crear
@roles_bp.route("/", methods=["POST"])
def crear():
    data = request.get_json()
    nuevo_rol = roles_controller.crear_rol(data["nombre_rol"])
    return jsonify(nuevo_rol.to_dict()), 201

# PUT: Actualizar
@roles_bp.route("/<int:id_rol>", methods=["PUT"])
def actualizar(id_rol):
    data = request.get_json()
    rol = roles_controller.actualizar_rol(id_rol, data["nombre_rol"])
    if rol:
        return jsonify(rol.to_dict())
    return jsonify({"error": "Rol no encontrado"}), 404

# DELETE: Eliminar
@roles_bp.route("/<int:id_rol>", methods=["DELETE"])
def eliminar(id_rol):
    eliminado = roles_controller.eliminar_rol(id_rol)
    if eliminado:
        return jsonify({"mensaje": "Rol eliminado"})
    return jsonify({"error": "Rol no encontrado"}), 404
