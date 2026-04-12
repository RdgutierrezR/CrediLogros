from flask import jsonify, request
from database import db
from modelo.turnos import Turno
from datetime import datetime

# Crear turno
def crear_turno(data):
    try:
        nuevo_turno = Turno(
            id_solicitud=data["id_solicitud"],
            fecha_turno=datetime.strptime(data["fecha_turno"], "%Y-%m-%d").date(),
            hora_turno=datetime.strptime(data["hora_turno"], "%H:%M:%S").time(),
            estado=data.get("estado", "pendiente")
        )

        db.session.add(nuevo_turno)
        db.session.commit()

        return jsonify({
            "message": "Turno creado exitosamente",
            "turno": nuevo_turno.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Listar todos o filtrar por estado
def obtener_turnos():
    estado = request.args.get("estado")

    if estado:
        turnos = Turno.query.filter_by(estado=estado).all()
        return jsonify([t.to_dict() for t in turnos]), 200

    turnos = Turno.query.all()
    return jsonify([t.to_dict() for t in turnos]), 200


# Obtener turno por ID
def obtener_turno(id_turno):
    turno = Turno.query.get(id_turno)
    if not turno:
        return jsonify({"error": "Turno no encontrado"}), 404

    return jsonify(turno.to_dict()), 200


# Actualizar turno
def actualizar_turno(id_turno, data):
    turno = Turno.query.get(id_turno)
    if not turno:
        return jsonify({"error": "Turno no encontrado"}), 404

    try:
        if "id_solicitud" in data:
            turno.id_solicitud = data["id_solicitud"]

        if "fecha_turno" in data:
            turno.fecha_turno = datetime.strptime(data["fecha_turno"], "%Y-%m-%d").date()

        if "hora_turno" in data:
            turno.hora_turno = datetime.strptime(data["hora_turno"], "%H:%M:%S").time()

        if "estado" in data:
            turno.estado = data["estado"]

        db.session.commit()

        return jsonify({
            "message": "Turno actualizado",
            "turno": turno.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Eliminar turno
def eliminar_turno(id_turno):
    turno = Turno.query.get(id_turno)
    if not turno:
        return jsonify({"error": "Turno no encontrado"}), 404

    try:
        db.session.delete(turno)
        db.session.commit()
        return jsonify({"message": "Turno eliminado"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Cola de turnos pendientes
def obtener_turnos_cola():
    turnos = (
        Turno.query
        .filter(Turno.estado == "pendiente")
        .order_by(Turno.fecha_turno, Turno.hora_turno)
        .all()
    )

    return jsonify([t.to_dict() for t in turnos]), 200


# Avanzar turno
def avanzar_turno():
    try:
        # 1. Turno actual en atención
        turno_actual = Turno.query.filter_by(estado="en atención").first()

        # Si existe turno en atención → marcarlo como completado
        if turno_actual:
            turno_actual.estado = "completado"

        # 2. Buscar el siguiente turno pendiente
        siguiente = (
            Turno.query
            .filter_by(estado="pendiente")
            .order_by(Turno.fecha_turno, Turno.hora_turno)
            .first()
        )

        # Si hay siguiente turno → ponerlo en atención
        if siguiente:
            siguiente.estado = "en atención"

        # Si no hay más turnos, igual guardar el cambio del último
        db.session.commit()

        return jsonify({
            "message": "Turno avanzado correctamente",
            "turno_antes": turno_actual.to_dict() if turno_actual else None,
            "turno_ahora": siguiente.to_dict() if siguiente else None
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
