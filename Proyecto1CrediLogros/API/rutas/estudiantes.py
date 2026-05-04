from flask import Blueprint, request, jsonify
from controlador import estudiantes

estudiantes_bp = Blueprint("estudiantes", __name__, url_prefix="/api/estudiantes")

# GET: Listar todos
@estudiantes_bp.route("/", methods=["GET"])
def listar():
    lista = estudiantes.listar_estudiantes()
    return jsonify([e.to_dict() for e in lista]), 200

# GET: Obtener por ID
@estudiantes_bp.route("/<int:id_estudiante>", methods=["GET"])
def obtener(id_estudiante):
    estudiante = estudiantes.obtener_estudiante(id_estudiante)
    if estudiante:
        return jsonify(estudiante.to_dict()), 200
    return jsonify({"error": "Estudiante no encontrado"}), 404

# GET: Buscar por Cédula (usando query param)
@estudiantes_bp.route("/buscar", methods=["GET"])
def buscar_por_cedula():
    cedula = request.args.get("cedula", "")
    if not cedula:
        return jsonify({"error": "Cédula requerida"}), 400
    estudiante = estudiantes.obtener_por_cedula(cedula)
    if estudiante:
        return jsonify(estudiante.to_dict()), 200
    return jsonify({"error": "Estudiante no encontrado"}), 404

# POST: Crear estudiante rápido (sin usuario)
@estudiantes_bp.route("/crear-rapido", methods=["POST"])
def crear_rapido():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    if "cedula" not in data or not data["cedula"]:
        return jsonify({"error": "La cédula es obligatoria"}), 400

    try:
        nuevo, creado = estudiantes.buscar_o_crear_estudiante(
            data["cedula"],
            data.get("nombre"),
            data.get("telefono"),
            data.get("direccion")
        )
        return jsonify(nuevo.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST: Crear (actualizado para registro rápido)
@estudiantes_bp.route("/", methods=["POST"])
def crear():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No se enviaron datos"}), 400

    # Si no hay id_usuario, usar la función de registro rápido
    if "id_usuario" not in data:
        try:
            nuevo, creado = estudiantes.buscar_o_crear_estudiante(
                data.get("cedula"),
                data.get("nombre"),
                data.get("telefono"),
                data.get("direccion")
            )
            return jsonify(nuevo.to_dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # Validamos los campos obligatorios
    if "id_usuario" not in data or "nombre" not in data or "cedula" not in data:
        return jsonify({"error": "Faltan campos obligatorios (id_usuario, nombre, cedula)"}), 400

    try:
        nuevo = estudiantes.crear_estudiante(
            data["id_usuario"],  # id_usuario existente en usuarios
            data["nombre"],
            data["cedula"],
            data.get("telefono"),
            data.get("direccion")
        )
        return jsonify(nuevo.to_dict()), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# PUT: Actualizar
@estudiantes_bp.route("/<int:id_estudiante>", methods=["PUT"])
def actualizar(id_estudiante):
    data = request.get_json()
    estudiante = estudiantes.actualizar_estudiante(
        id_estudiante,
        data.get("nombre"),
        data.get("cedula"),
        data.get("telefono"),
        data.get("direccion")
    )
    if estudiante:
        return jsonify(estudiante.to_dict()), 200
    return jsonify({"error": "Estudiante no encontrado"}), 404

# DELETE: Eliminar
@estudiantes_bp.route("/<int:id_estudiante>", methods=["DELETE"])
def eliminar(id_estudiante):
    eliminado = estudiantes.eliminar_estudiante(id_estudiante)
    if eliminado:
        return jsonify({"mensaje": "Estudiante eliminado"}), 200
    return jsonify({"error": "Estudiante no encontrado"}), 404
