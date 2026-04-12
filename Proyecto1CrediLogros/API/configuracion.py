import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "clave-secreta")
    # Conexión a la base de datos MySQL ya creada
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:@localhost:3306/PruebaCredilogros"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
