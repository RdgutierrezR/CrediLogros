from modelo.estudiantes import Estudiante
from modelo.usuarios import Usuario
from database import db

# Listar todos
def listar_estudiantes():
    return Estudiante.query.all()

# Obtener por ID
def obtener_estudiante(id_estudiante):
    return Estudiante.query.get(id_estudiante)

# Crear
def crear_estudiante(id_usuario, nombre, cedula, telefono=None, direccion=None):
    # Validar que el usuario exista
    usuario = Usuario.query.get(id_usuario)
    if not usuario:
        raise ValueError("El usuario asociado no existe")

    # Crear estudiante usando el mismo id que el usuario
    nuevo = Estudiante(
        id_estudiante=id_usuario,
        nombre=nombre,
        cedula=cedula,
        telefono=telefono,
        direccion=direccion
    )
    db.session.add(nuevo)
    db.session.commit()
    return nuevo

# Actualizar
def actualizar_estudiante(id_estudiante, nombre=None, cedula=None, telefono=None, direccion=None):
    estudiante = Estudiante.query.get(id_estudiante)
    if estudiante:
        if nombre:
            estudiante.nombre = nombre
        if cedula:
            estudiante.cedula = cedula
        if telefono:
            estudiante.telefono = telefono
        if direccion:
            estudiante.direccion = direccion
        db.session.commit()
    return estudiante

# Eliminar
def eliminar_estudiante(id_estudiante):
    estudiante = Estudiante.query.get(id_estudiante)
    if estudiante:
        db.session.delete(estudiante)
        db.session.commit()
        return True
    return False
