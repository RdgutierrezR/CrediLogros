from flask import Flask, send_from_directory
from configuracion import Config
from database import db
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from modelo.usuarios import Usuario
from modelo.estudiantes import Estudiante
import os

UPLOAD_FOLDER = "uploads"

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    # Crear carpeta uploads si no existe
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # Inicializar JWT
    jwt = JWTManager(app)

    # Habilitar CORS para todo
    CORS(app, resources={r"/api/*": {"origins": "*"}})  # <--- IMPORTANTE

    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024

    # Ruta para servir archivos subidos
    @app.route(f"/{UPLOAD_FOLDER}/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(UPLOAD_FOLDER, filename)

    # Importar y registrar rutas
    from rutas.roles import roles_bp
    from rutas.usuarios import usuarios_bp
    from rutas.estudiantes import estudiantes_bp
    from rutas.universidades import universidades_bp
    from rutas.solicitud_credito import solicitudes_bp
    from rutas.turnos import turnos_bp
    from rutas.documentos import documentos_bp
    from rutas.firma import firmas_bp
    from rutas.analisis_credito import analisis_bp
    from rutas.chatbot import chatbot_bp
    
    app.register_blueprint(analisis_bp)
    app.register_blueprint(chatbot_bp)
    app.register_blueprint(firmas_bp)
    app.register_blueprint(documentos_bp)
    app.register_blueprint(turnos_bp)  
    app.register_blueprint(solicitudes_bp)
    app.register_blueprint(universidades_bp)
    app.register_blueprint(estudiantes_bp)
    app.register_blueprint(roles_bp)
    app.register_blueprint(usuarios_bp)

    return app

app = create_app()

if __name__ == "__main__":
    app = create_app() 
    app.run(host='0.0.0.0', port=5002, debug=True, use_reloader=False)
