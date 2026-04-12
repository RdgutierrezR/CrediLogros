from database import db
from modelo.usuarios import Usuario

# Listar
def listar_usuarios():
    return Usuario.query.all()

# Obtener por ID
def obtener_usuario(id_usuario):
    return Usuario.query.get(id_usuario)

# Crear
def crear_usuario(nombre, correo, contrasena, rol_id):
    nuevo = Usuario(
        nombre=nombre,
        correo=correo,
        contrasena=contrasena,  # ⚠️ Texto plano
        rol_id=rol_id
    )
    db.session.add(nuevo)
    db.session.commit()
    return nuevo

# Actualizar
def actualizar_usuario(id_usuario, nombre=None, correo=None, contrasena=None, rol_id=None):
    usuario = Usuario.query.get(id_usuario)
    if usuario:
        if nombre: usuario.nombre = nombre
        if correo: usuario.correo = correo
        if contrasena: usuario.contrasena = contrasena
        if rol_id: usuario.rol_id = rol_id
        db.session.commit()
    return usuario

# Eliminar
def eliminar_usuario(id_usuario):
    usuario = Usuario.query.get(id_usuario)
    if usuario:
        db.session.delete(usuario)
        db.session.commit()
        return True
    return False

# 🔑 Buscar por correo (para login)
def obtener_por_correo(correo):
    return Usuario.query.filter_by(correo=correo).first()
