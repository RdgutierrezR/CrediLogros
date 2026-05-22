from flask import Blueprint, request
from controlador import turnos
from modelo.turnos import Turno

turnos_bp = Blueprint("turnos_bp", __name__, url_prefix="/api/turnos")


@turnos_bp.route("/", methods=["POST"])
def crear():
    data = request.get_json()
    return turnos.crear_turno(data)


@turnos_bp.route("/", methods=["GET"])
def listar():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    per_page = min(per_page, 100)
    estado = request.args.get("estado")
    paginated = request.args.get("paginated", "true").lower() == "true"
    
    if paginated:
        query = Turno.query
        if estado:
            query = query.filter_by(estado=estado)
        query = query.order_by(Turno.fecha_turno.desc(), Turno.hora_turno.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "items": [t.to_dict() for t in pagination.items],
            "total": pagination.total,
            "page": page,
            "per_page": per_page,
            "pages": pagination.pages
        }, 200
    
    return turnos.obtener_turnos()

@turnos_bp.route("/<int:id_turno>", methods=["GET"])
def obtener(id_turno):
    return turnos.obtener_turno(id_turno)

@turnos_bp.route("/<int:id_turno>", methods=["PUT"])
def actualizar(id_turno):
    data = request.get_json()
    return turnos.actualizar_turno(id_turno, data)

@turnos_bp.route("/<int:id_turno>", methods=["DELETE"])
def eliminar(id_turno):
    return turnos.eliminar_turno(id_turno)

@turnos_bp.route("/cola", methods=["GET"])
def cola():
    return turnos.obtener_turnos_cola()

@turnos_bp.route("/avanzar", methods=["PUT"])
def avanzar():
    return turnos.avanzar_turno()
