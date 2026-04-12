from flask import Blueprint, request
from controlador import solicitud_credito

solicitudes_bp = Blueprint("solicitudes_bp", __name__, url_prefix="/api")

@solicitudes_bp.route("/solicitudes", methods=["POST"])
def crear_solicitud():
    data = request.get_json()
    return solicitud_credito.crear_solicitud(data)

@solicitudes_bp.route("/solicitudes", methods=["GET"])
def obtener_solicitudes():
    return solicitud_credito.obtener_solicitudes()

@solicitudes_bp.route("/solicitudes/<int:id_solicitud>", methods=["GET"])
def obtener_solicitud(id_solicitud):
    return solicitud_credito.obtener_solicitud(id_solicitud)

# ==========================================================
# 🔥 NUEVA RUTA COMPLETA PARA VER DETALLE DE LA SOLICITUD
# ==========================================================
@solicitudes_bp.route("/solicitudes/<int:id_solicitud>/detalle", methods=["GET"])
def obtener_detalle_solicitud(id_solicitud):
    return solicitud_credito.obtener_detalle_solicitud(id_solicitud)

@solicitudes_bp.route("/solicitudes/<int:id_solicitud>", methods=["PUT"])
def actualizar_solicitud(id_solicitud):
    data = request.get_json()
    return solicitud_credito.actualizar_solicitud(id_solicitud, data)

@solicitudes_bp.route("/solicitudes/<int:id_solicitud>", methods=["DELETE"])
def eliminar_solicitud(id_solicitud):
    return solicitud_credito.eliminar_solicitud(id_solicitud)
