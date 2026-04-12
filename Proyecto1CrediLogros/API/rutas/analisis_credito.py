from flask import Blueprint, request, jsonify
from controlador import analisis_credito

analisis_bp = Blueprint("analisis_bp", __name__, url_prefix="/api/analisis")

@analisis_bp.route("/", methods=["POST"])
def crear():
    data = request.json
    nuevo = analisis_credito.crear_analisis(data)
    return jsonify({"id": nuevo.id_analisis, "mensaje": "Análisis creado correctamente"}), 201

@analisis_bp.route("/", methods=["GET"])
def listar():
    lista = analisis_credito.obtener_analisis()
    return jsonify([
        {
            "id_analisis": a.id_analisis,
            "id_solicitud": a.id_solicitud,
            "analista_id": a.analista_id,
            "resultado": a.resultado,
            "fecha_analisis": a.fecha_analisis
        } for a in lista
    ])

@analisis_bp.route("/<int:id_analisis>", methods=["GET"])
def obtener(id_analisis):
    analisis = analisis_credito.obtener_analisis_por_id(id_analisis)
    if not analisis:
        return jsonify({"error": "Análisis no encontrado"}), 404
    return jsonify({
        "id_analisis": analisis.id_analisis,
        "id_solicitud": analisis.id_solicitud,
        "analista_id": analisis.analista_id,
        "resultado": analisis.resultado,
        "fecha_analisis": analisis.fecha_analisis
    })

@analisis_bp.route("/<int:id_analisis>", methods=["PUT"])
def actualizar(id_analisis):
    data = request.json
    actualizado = analisis_credito.actualizar_analisis(id_analisis, data)
    if not actualizado:
        return jsonify({"error": "Análisis no encontrado"}), 404
    return jsonify({"mensaje": "Análisis actualizado correctamente"})

@analisis_bp.route("/<int:id_analisis>", methods=["DELETE"])
def eliminar(id_analisis):
    eliminado = analisis_credito.eliminar_analisis(id_analisis)
    if not eliminado:
        return jsonify({"error": "Análisis no encontrado"}), 404
    return jsonify({"mensaje": "Análisis eliminado correctamente"})
