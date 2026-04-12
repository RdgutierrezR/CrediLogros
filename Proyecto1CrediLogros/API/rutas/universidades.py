from flask import Blueprint, request, jsonify
from controlador import universidad

universidades_bp = Blueprint("universidades", __name__, url_prefix="/api/universidades")

# Crear universidad
@universidades_bp.route("/", methods=["POST"])
def crear():
    data = request.json
    nueva = universidad.crear_universidad(data)
    return jsonify(nueva), 201

# Listar todas las universidades
@universidades_bp.route("/", methods=["GET"])
def listar():
    lista = universidad.obtener_universidades()
    return jsonify(lista), 200

# Obtener universidad por ID
@universidades_bp.route("/<int:id_universidad>", methods=["GET"])
def obtener(id_universidad):
    uni = universidad.obtener_universidad(id_universidad)
    if uni:
        return jsonify(uni), 200
    return jsonify({"error": "Universidad no encontrada"}), 404

# Actualizar universidad
@universidades_bp.route("/<int:id_universidad>", methods=["PUT"])
def actualizar(id_universidad):
    data = request.json
    uni = universidad.actualizar_universidad(id_universidad, data)
    if uni:
        return jsonify(uni), 200
    return jsonify({"error": "Universidad no encontrada"}), 404

# Eliminar universidad
@universidades_bp.route("/<int:id_universidad>", methods=["DELETE"])
def eliminar(id_universidad):
    eliminado = universidad.eliminar_universidad(id_universidad)
    if eliminado:
        return jsonify({"mensaje": "Universidad eliminada"}), 200
    return jsonify({"error": "Universidad no encontrada"}), 404
