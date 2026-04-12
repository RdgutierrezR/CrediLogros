from flask import Blueprint, request, jsonify
from controlador.documentos import (
    crear_documento,
    listar_documentos,
    obtener_documento,
    eliminar_documento
)

documentos_bp = Blueprint("documentos_bp", __name__, url_prefix="/api/documentos")


# ----------------------------------------------------
# 🟩 SUBIR DOCUMENTO
# ----------------------------------------------------
@documentos_bp.route("/", methods=["POST"])
def subir_documento_route():
    file = request.files.get("file")
    id_solicitud = request.form.get("id_solicitud")

    if not file or not id_solicitud:
        return jsonify({"error": "Se requiere archivo y id_solicitud"}), 400

    return crear_documento(file, id_solicitud)


# ----------------------------------------------------
# 🟦 LISTAR DOCUMENTOS
# ----------------------------------------------------
@documentos_bp.route("/", methods=["GET"])
def listar_documentos_route():
    return listar_documentos()


# ----------------------------------------------------
# 🟧 OBTENER DOCUMENTO POR ID
# ----------------------------------------------------
@documentos_bp.route("/<int:id_documento>", methods=["GET"])
def obtener_documento_route(id_documento):
    return obtener_documento(id_documento)


# ----------------------------------------------------
# 🟥 ELIMINAR DOCUMENTO
# ----------------------------------------------------
@documentos_bp.route("/<int:id_documento>", methods=["DELETE"])
def eliminar_documento_route(id_documento):
    return eliminar_documento(id_documento)
