from app import db

class AnalisisCredito(db.Model):
    __tablename__ = "analisis_credito"

    id_analisis = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_solicitud = db.Column(db.Integer, db.ForeignKey("solicitudes_credito.id_solicitud"), nullable=False)
    analista_id = db.Column(db.Integer, db.ForeignKey("usuarios.id_usuario"), nullable=False)
    resultado = db.Column(db.Text, nullable=False)
    fecha_analisis = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp(), nullable=False)
