from modelo.analisis_credito import AnalisisCredito
from app import db

def crear_analisis(data):
    nuevo = AnalisisCredito(
        id_solicitud=data["id_solicitud"],
        analista_id=data["analista_id"],
        resultado=data["resultado"]
    )
    db.session.add(nuevo)
    db.session.commit()
    return nuevo

def obtener_analisis():
    return AnalisisCredito.query.all()

def obtener_analisis_por_id(id_analisis):
    return AnalisisCredito.query.get(id_analisis)

def actualizar_analisis(id_analisis, data):
    analisis = AnalisisCredito.query.get(id_analisis)
    if analisis:
        analisis.resultado = data.get("resultado", analisis.resultado)
        db.session.commit()
    return analisis

def eliminar_analisis(id_analisis):
    analisis = AnalisisCredito.query.get(id_analisis)
    if analisis:
        db.session.delete(analisis)
        db.session.commit()
    return analisis
