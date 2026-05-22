from flask import Blueprint, request, jsonify
from modelo.documentos import Documento
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
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    per_page = min(per_page, 100)
    paginated = request.args.get("paginated", "true").lower() == "true"
    id_solicitud = request.args.get("id_solicitud", type=int)
    
    if paginated:
        query = Documento.query
        if id_solicitud:
            query = query.filter_by(id_solicitud=id_solicitud)
        query = query.order_by(Documento.id_documento.desc())
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return {
            "items": [d.to_dict() for d in pagination.items],
            "total": pagination.total,
            "page": page,
            "per_page": per_page,
            "pages": pagination.pages
        }, 200
    
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
