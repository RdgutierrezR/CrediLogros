from database import db
from datetime import datetime

class FirmaDigital(db.Model):
    __tablename__ = "firmas_digitales"

    id_firma = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_documento = db.Column(db.Integer, db.ForeignKey("documentos.id_documento"), nullable=False)
    id_estudiante = db.Column(db.Integer, db.ForeignKey("estudiantes.id_estudiante"), nullable=False)
    firma_hash = db.Column(db.String(255), nullable=False)
    fecha_firma = db.Column(db.DateTime, default=datetime.utcnow)

    documento = db.relationship("Documento", backref="firmas", lazy=True)
    estudiante = db.relationship("Estudiante", backref="firmas", lazy=True)

    def to_dict(self):
        return {
            "id_firma": self.id_firma,
            "id_documento": self.id_documento,
            "id_estudiante": self.id_estudiante,
            "firma_hash": self.firma_hash,
            "fecha_firma": self.fecha_firma.isoformat()
        }
