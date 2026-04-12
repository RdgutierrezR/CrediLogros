from flask import Blueprint
from controlador import firma

firmas_bp = Blueprint("firmas_bp", __name__, url_prefix="/api/firmas")

@firmas_bp.route("/", methods=["POST"])
def crear_firma():
    return firma.crear_firma()

@firmas_bp.route("/", methods=["GET"])
def obtener_firmas():
    return firma.obtener_firmas()

@firmas_bp.route("/<int:id_firma>", methods=["GET"])
def obtener_firma(id_firma):
    return firma.obtener_firma(id_firma)

@firmas_bp.route("/<int:id_firma>", methods=["DELETE"])
def eliminar_firma(id_firma):
    return firma.eliminar_firma(id_firma)
