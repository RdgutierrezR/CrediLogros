from database import db
from modelo.solicitud_credito import SolicitudCredito
from sqlalchemy import Enum

class Turno(db.Model):
    __tablename__ = "turnos"

    id_turno = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_solicitud = db.Column(db.Integer, db.ForeignKey("solicitudes_credito.id_solicitud"), nullable=False)
    fecha_turno = db.Column(db.Date, nullable=False)
    hora_turno = db.Column(db.Time, nullable=False)

    estado = db.Column(
        Enum("pendiente", "en atención", "completado", "cancelado", name="estado_turno"),
        default="pendiente"
    )

    solicitud = db.relationship("SolicitudCredito", backref="turnos", lazy=True)

    def to_dict(self):
        return {
            "id_turno": self.id_turno,
            "id_solicitud": self.id_solicitud,
            "fecha_turno": self.fecha_turno.isoformat(),
            "hora_turno": self.hora_turno.strftime("%H:%M:%S"),
            "estado": self.estado
        }
