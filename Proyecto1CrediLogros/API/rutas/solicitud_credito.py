from flask import Blueprint, request, jsonify
from database import db
from modelo.solicitud_credito import SolicitudCredito
from controlador import solicitud_credito

solicitudes_bp = Blueprint("solicitudes_bp", __name__, url_prefix="/api")


def obtener_solicitudes_paginado():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    per_page = min(per_page, 100)
    
    query = SolicitudCredito.query.order_by(SolicitudCredito.id_solicitud.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "items": [s.to_dict() for s in pagination.items],
        "total": pagination.total,
        "page": page,
        "per_page": per_page,
        "pages": pagination.pages
    }), 200


@solicitudes_bp.route("/solicitudes", methods=["GET"])
def obtener_solicitudes():
    use_pagination = request.args.get("paginated", "true").lower() == "true"
    if use_pagination:
        return obtener_solicitudes_paginado()
    return solicitud_credito.obtener_solicitudes()

@solicitudes_bp.route("/solicitudes", methods=["POST"])
def crear_solicitud():
    data = request.get_json()
    return solicitud_credito.crear_solicitud(data)

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
