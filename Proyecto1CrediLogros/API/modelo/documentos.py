from database import db

class Documento(db.Model):
    __tablename__ = "documentos"

    id_documento = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_solicitud = db.Column(db.Integer, db.ForeignKey("solicitudes_credito.id_solicitud"), nullable=False)
    nombre_archivo = db.Column(db.String(150), nullable=False)
    ruta_archivo = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    fecha_subida = db.Column(db.DateTime, nullable=False)

    def to_dict(self):
        return {
            "id_documento": self.id_documento,
            "id_solicitud": self.id_solicitud,
            "nombre_archivo": self.nombre_archivo,
            "ruta_archivo": self.ruta_archivo,
            "tipo": self.tipo,
            "fecha_subida": self.fecha_subida.isoformat()
        }
