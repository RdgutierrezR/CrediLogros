from flask import Blueprint, request, jsonify
from controlador import chatbot

chatbot_bp = Blueprint("chatbot", __name__, url_prefix="/api/chatbot")

@chatbot_bp.route("", methods=["POST"])
def responder():
    data = request.get_json()
    if not data or "mensaje" not in data:
        return jsonify({"error": "Campo 'mensaje' es requerido"}), 400
    
    mensaje = data.get("mensaje")
    respuesta = chatbot.procesar_mensaje(mensaje)
    return jsonify({"respuesta": respuesta})