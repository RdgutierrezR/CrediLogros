import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME", "pruebacredilogros")

# 🔥 CONEXIÓN PRINCIPAL
if DB_HOST:
    DATABASE_URL = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        "?charset=utf8mb4&ssl_mode=REQUIRED"
    )
else:
    # 🔧 LOCAL
    DATABASE_URL = "mysql+pymysql://root:@localhost:3306/pruebacredilogros"

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "clave-secreta")
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False