from modelo.estudiantes import Estudiante
from modelo.usuarios import Usuario
from database import db

# Listar todos
def listar_estudiantes():
    return Estudiante.query.all()

# Obtener por ID
def obtener_estudiante(id_estudiante):
    return Estudiante.query.get(id_estudiante)

# Obtener por Cédula
def obtener_por_cedula(cedula):
    return Estudiante.query.filter_by(cedula=cedula).first()

# Buscar o crear estudiante rápido (sin usuario)
def buscar_o_crear_estudiante(cedula, nombre=None, telefono=None, direccion=None):
    # Buscar si ya existe
    existente = Estudiante.query.filter_by(cedula=cedula).first()
    if existente:
        return existente, False  # False = no se creó, ya existía
    
    # Buscar si hay un usuario disponible sin estudiante
    # O crear nuevo usuario + estudiante
    usuario_existente = Usuario.query.filter(
        ~Usuario.id_usuario.in_(db.session.query(Estudiante.id_estudiante))
    ).first()
    
    if usuario_existente:
        # Usar usuario existente
        nuevo = Estudiante(
            id_estudiante=usuario_existente.id_usuario,
            nombre=nombre,
            cedula=cedula,
            telefono=telefono,
            direccion=direccion
        )
    else:
        # Crear nuevo usuario
        nuevo_usuario = Usuario(
            nombre=nombre or f"Est_{cedula}",
            correo=f"est_{cedula}@credilogros.local",
            contrasena=cedula,  # Temporal
            rol_id=1  # Estudiante
        )
        db.session.add(nuevo_usuario)
        db.session.flush()
        
        nuevo = Estudiante(
            id_estudiante=nuevo_usuario.id_usuario,
            nombre=nombre,
            cedula=cedula,
            telefono=telefono,
            direccion=direccion
        )
    
    db.session.add(nuevo)
    db.session.commit()
    return nuevo, True  # True = se creó nuevo
