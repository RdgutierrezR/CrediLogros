from database import db

class SolicitudCredito(db.Model):
    __tablename__ = "solicitudes_credito"

    id_solicitud = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_estudiante = db.Column(db.Integer, db.ForeignKey("estudiantes.id_estudiante"), nullable=False)
    fecha_solicitud = db.Column(db.Date, nullable=False)
    estado = db.Column(db.Enum("pendiente", "en estudio", "aprobado", "rechazado"), default="pendiente")
    monto_solicitado = db.Column(db.Numeric(12, 2), nullable=True)
    monto_aprobado = db.Column(db.Numeric(12, 2), nullable=True)

    estudiante = db.relationship("Estudiante", backref="solicitudes", lazy=True)

    def to_dict(self):
        return {
            "id_solicitud": self.id_solicitud,
            "id_estudiante": self.id_estudiante,
            "fecha_solicitud": self.fecha_solicitud.isoformat(),
            "estado": self.estado,
            "monto_solicitado": float(self.monto_solicitado) if self.monto_solicitado else None,
            "monto_aprobado": float(self.monto_aprobado) if self.monto_aprobado else None
        }
