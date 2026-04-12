from modelo.universidad import Universidad
from database import db

# Crear universidad
def crear_universidad(data):
    nueva = Universidad(
        nombre=data.get("nombre"),
        direccion=data.get("direccion"),
        telefono=data.get("telefono")
    )
    db.session.add(nueva)
    db.session.commit()
    return nueva.to_dict()

# Obtener todas las universidades
def obtener_universidades():
    universidades = Universidad.query.all()
    return [u.to_dict() for u in universidades]

# Obtener universidad por ID
def obtener_universidad(id_universidad):
    universidad = Universidad.query.get(id_universidad)
    return universidad.to_dict() if universidad else None

# Actualizar universidad
def actualizar_universidad(id_universidad, data):
    universidad = Universidad.query.get(id_universidad)
    if universidad:
        universidad.nombre = data.get("nombre", universidad.nombre)
        universidad.direccion = data.get("direccion", universidad.direccion)
        universidad.telefono = data.get("telefono", universidad.telefono)
        db.session.commit()
        return universidad.to_dict()
    return None

# Eliminar universidad
def eliminar_universidad(id_universidad):
    universidad = Universidad.query.get(id_universidad)
    if universidad:
        db.session.delete(universidad)
        db.session.commit()
        return True
    return False
