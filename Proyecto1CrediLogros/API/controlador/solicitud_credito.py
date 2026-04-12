from flask import jsonify
from database import db
from modelo.solicitud_credito import SolicitudCredito
from modelo.turnos import Turno
from modelo.estudiantes import Estudiante
from modelo.usuarios import Usuario
from modelo.documentos import Documento
from datetime import datetime, timedelta


# ================================================
# 🔥 NUEVA FUNCIÓN: DETALLE COMPLETO DE SOLICITUD
# ================================================
def obtener_detalle_solicitud(id_solicitud):
    solicitud = SolicitudCredito.query.get(id_solicitud)
    if not solicitud:
        return jsonify({"error": "Solicitud no encontrada"}), 404

    # Estudiante
    estudiante = Estudiante.query.get(solicitud.id_estudiante)

    # Usuario del estudiante
    usuario = Usuario.query.get(estudiante.id_estudiante)

    # Documentos
    documentos = Documento.query.filter_by(id_solicitud=id_solicitud).all()

    return jsonify({
        "solicitud": solicitud.to_dict(),
        "estudiante": estudiante.to_dict(),
        "usuario": usuario.to_dict(),
        "documentos": [d.to_dict() for d in documentos]
    }), 200


# Crear solicitud y turno automáticamente
def crear_solicitud(data):
    try:
        nueva_solicitud = SolicitudCredito(
            id_estudiante=data["id_estudiante"],
            fecha_solicitud=datetime.strptime(data["fecha_solicitud"], "%Y-%m-%d").date(),
            estado=data.get("estado", "pendiente"),
            monto_solicitado=data.get("monto_solicitado"),
            monto_aprobado=data.get("monto_aprobado")
        )

        db.session.add(nueva_solicitud)
        db.session.commit()

        turno = Turno(
            id_solicitud=nueva_solicitud.id_solicitud,
            fecha_turno=datetime.now().date(),
            hora_turno=(datetime.now() + timedelta(minutes=10)).time(),
            estado="pendiente"
        )

        db.session.add(turno)
        db.session.commit()

        return jsonify({
            "message": "Solicitud creada exitosamente",
            "solicitud": nueva_solicitud.to_dict(),
            "turno_asignado": turno.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400



def obtener_solicitudes():
    solicitudes = SolicitudCredito.query.all()
    return jsonify([s.to_dict() for s in solicitudes]), 200


def obtener_solicitud(id_solicitud):
    solicitud = SolicitudCredito.query.get(id_solicitud)
    if not solicitud:
        return jsonify({"error": "Solicitud no encontrada"}), 404
    return jsonify(solicitud.to_dict()), 200


def actualizar_solicitud(id_solicitud, data):
    solicitud = SolicitudCredito.query.get(id_solicitud)
    if not solicitud:
        return jsonify({"error": "Solicitud no encontrada"}), 404

    try:
        solicitud.id_estudiante = data.get("id_estudiante", solicitud.id_estudiante)

        if "fecha_solicitud" in data:
            solicitud.fecha_solicitud = datetime.strptime(data["fecha_solicitud"], "%Y-%m-%d").date()

        solicitud.estado = data.get("estado", solicitud.estado)
        solicitud.monto_solicitado = data.get("monto_solicitado", solicitud.monto_solicitado)
        solicitud.monto_aprobado = data.get("monto_aprobado", solicitud.monto_aprobado)

        db.session.commit()

        return jsonify({
            "message": "Solicitud actualizada exitosamente",
            "solicitud": solicitud.to_dict()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


def eliminar_solicitud(id_solicitud):
    solicitud = SolicitudCredito.query.get(id_solicitud)
    if not solicitud:
        return jsonify({"error": "Solicitud no encontrada"}), 404

    try:
        Turno.query.filter_by(id_solicitud=id_solicitud).delete()
        Documento.query.filter_by(id_solicitud=id_solicitud).delete()
        db.session.delete(solicitud)
        db.session.commit()
        return jsonify({"message": "Solicitud eliminada exitosamente"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
