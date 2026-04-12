from flask import jsonify, request
from database import db
from modelo.firma import FirmaDigital
from datetime import datetime
import hashlib

# Crear firma digital
def crear_firma():
    try:
        data = request.get_json()

        if not data or "id_documento" not in data or "id_estudiante" not in data:
            return jsonify({"error": "Faltan campos obligatorios (id_documento, id_estudiante, firma_hash)"}), 400

        # Generar hash de la firma (ejemplo: hash del documento + estudiante + fecha)
        raw_data = f"{data['id_documento']}{data['id_estudiante']}{datetime.utcnow()}"
        firma_hash = hashlib.sha256(raw_data.encode()).hexdigest()

        nueva_firma = FirmaDigital(
            id_documento=data["id_documento"],
            id_estudiante=data["id_estudiante"],
            firma_hash=firma_hash
        )
        db.session.add(nueva_firma)
        db.session.commit()

        return jsonify({"message": "Firma registrada exitosamente", "firma": nueva_firma.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# Obtener todas las firmas
def obtener_firmas():
    firmas = FirmaDigital.query.all()
    return jsonify([f.to_dict() for f in firmas]), 200


# Obtener una firma por ID
def obtener_firma(id_firma):
    firma = FirmaDigital.query.get(id_firma)
    if not firma:
        return jsonify({"error": "Firma no encontrada"}), 404
    return jsonify(firma.to_dict()), 200


# Eliminar firma
def eliminar_firma(id_firma):
    firma = FirmaDigital.query.get(id_firma)
    if not firma:
        return jsonify({"error": "Firma no encontrada"}), 404
    try:
        db.session.delete(firma)
        db.session.commit()
        return jsonify({"message": "Firma eliminada exitosamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
