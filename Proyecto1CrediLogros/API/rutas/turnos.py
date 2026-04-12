from flask import Blueprint, request
from controlador import turnos

turnos_bp = Blueprint("turnos_bp", __name__, url_prefix="/api/turnos")

@turnos_bp.route("/", methods=["POST"])
def crear():
    data = request.get_json()
    return turnos.crear_turno(data)

@turnos_bp.route("/", methods=["GET"])
def listar():
    return turnos.obtener_turnos()  # soporta ?estado=

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
