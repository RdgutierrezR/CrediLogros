import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "pruebacredilogros")

if DB_HOST:
    # Para producción en Render con Aiven (SSL)
    DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
else:
    # Para desarrollo local (sin SSL)
    DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/pruebacredilogros")

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "credilogros-secreto-2026")
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # ⭐ LA CLAVE: Configuración SSL igual a tu proyecto funcionando
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "ssl": {
                "check_hostname": False,  # Cambiado a False para Aiven
                "verify_cert": False,      # Cambiado a False para evitar problemas
            }
        },
        "pool_recycle": 300,
        "pool_pre_ping": True,
        "pool_timeout": 30,
    }
    
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-credilogros-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

def obtener_info_conexion():
    return {
        "host": DB_HOST,
        "port": DB_PORT,
        "database": DB_NAME,
        "ssl": True if DB_HOST else False
    }