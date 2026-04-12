from database import db

class Universidad(db.Model):
    __tablename__ = "universidades"

    id_universidad = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(150), nullable=False)
    direccion = db.Column(db.String(200), nullable=True)
    telefono = db.Column(db.String(20), nullable=True)

    def to_dict(self):
        return {
            "id_universidad": self.id_universidad,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "telefono": self.telefono
        }
