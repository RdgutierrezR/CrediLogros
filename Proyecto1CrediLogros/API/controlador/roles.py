from modelo.roles import Rol
from database import db

def listar_roles():
    return Rol.query.all()

def obtener_rol(id_rol):
    return Rol.query.get(id_rol)

def crear_rol(nombre_rol):
    nuevo_rol = Rol(nombre_rol=nombre_rol)
    db.session.add(nuevo_rol)
    db.session.commit()
    return nuevo_rol

def actualizar_rol(id_rol, nuevo_nombre):
    rol = Rol.query.get(id_rol)
    if rol:
        rol.nombre_rol = nuevo_nombre
        db.session.commit()
        return rol
    return None

def eliminar_rol(id_rol):
    rol = Rol.query.get(id_rol)
    if rol:
        db.session.delete(rol)
        db.session.commit()
        return True
    return False
