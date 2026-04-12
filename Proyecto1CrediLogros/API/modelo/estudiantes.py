from database import db

class Estudiante(db.Model):
    __tablename__ = "estudiantes"

    # id_estudiante es FK a usuarios.id_usuario
    id_estudiante = db.Column(db.Integer, db.ForeignKey("usuarios.id_usuario"), primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    cedula = db.Column(db.String(20), nullable=False, unique=True)
    telefono = db.Column(db.String(20), nullable=True)
    direccion = db.Column(db.String(150), nullable=True)

    def to_dict(self):
        return {
            "id_estudiante": self.id_estudiante,
            "nombre": self.nombre,
            "cedula": self.cedula,
            "telefono": self.telefono,
            "direccion": self.direccion
        }
