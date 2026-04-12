from flask import jsonify
from database import db
from modelo.documentos import Documento
from modelo.solicitud_credito import SolicitudCredito
from datetime import datetime
import os
import uuid

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ----------------------------------------------------
# 🟩 CREAR DOCUMENTO
# ----------------------------------------------------
def crear_documento(file, id_solicitud):
    try:
        # Validar id_solicitud numérico
        try:
            id_solicitud = int(id_solicitud)
        except:
            return jsonify({"error": "id_solicitud debe ser un número"}), 400

        # Validar existencia de la solicitud
        solicitud = SolicitudCredito.query.get(id_solicitud)
        if not solicitud:
            return jsonify({"error": "El id_solicitud no existe"}), 404

        # Generar nombre único
        extension = os.path.splitext(file.filename)[1]
        nombre_archivo = f"{uuid.uuid4().hex}{extension}"

        ruta_archivo = os.path.join(UPLOAD_FOLDER, nombre_archivo)
        file.save(ruta_archivo)

        nuevo_doc = Documento(
            id_solicitud=id_solicitud,
            nombre_archivo=nombre_archivo,
            ruta_archivo=ruta_archivo,
            tipo=file.content_type,
            fecha_subida=datetime.now()
        )

        db.session.add(nuevo_doc)
        db.session.commit()

        return jsonify({
            "message": "Documento subido exitosamente",
            "documento": nuevo_doc.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



# ----------------------------------------------------
# 🟦 LISTAR DOCUMENTOS
# ----------------------------------------------------
def listar_documentos():
    documentos = Documento.query.all()
    return jsonify([d.to_dict() for d in documentos]), 200



# ----------------------------------------------------
# 🟧 OBTENER DOCUMENTO
# ----------------------------------------------------
def obtener_documento(id_documento):
    doc = Documento.query.get(id_documento)
    if not doc:
        return jsonify({"error": "Documento no encontrado"}), 404
    return jsonify(doc.to_dict()), 200



# ----------------------------------------------------
# 🟥 ELIMINAR DOCUMENTO
# ----------------------------------------------------
def eliminar_documento(id_documento):
    doc = Documento.query.get(id_documento)
    if not doc:
        return jsonify({"error": "Documento no encontrado"}), 404

    try:
        # Eliminar archivo físico
        if os.path.exists(doc.ruta_archivo):
            os.remove(doc.ruta_archivo)

        db.session.delete(doc)
        db.session.commit()

        return jsonify({"message": "Documento eliminado exitosamente"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
