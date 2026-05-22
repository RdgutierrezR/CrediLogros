from app import app, db

with app.app_context():
    indices = [
        ("ix_usuarios_rol_id", "CREATE INDEX ix_usuarios_rol_id ON usuarios (rol_id)"),
        ("ix_estudiantes_cedula", "CREATE INDEX ix_estudiantes_cedula ON estudiantes (cedula)"),
        ("ix_estudiantes_telefono", "CREATE INDEX ix_estudiantes_telefono ON estudiantes (telefono)"),
        ("ix_solicitudes_id_estudiante", "CREATE INDEX ix_solicitudes_id_estudiante ON solicitudes_credito (id_estudiante)"),
        ("ix_solicitudes_estado", "CREATE INDEX ix_solicitudes_estado ON solicitudes_credito (estado)"),
        ("ix_turnos_id_solicitud", "CREATE INDEX ix_turnos_id_solicitud ON turnos (id_solicitud)"),
        ("ix_turnos_estado", "CREATE INDEX ix_turnos_estado ON turnos (estado)"),
        ("ix_documentos_id_solicitud", "CREATE INDEX ix_documentos_id_solicitud ON documentos (id_solicitud)"),
        ("ix_documentos_tipo", "CREATE INDEX ix_documentos_tipo ON documentos (tipo)"),
        ("ix_analisis_id_solicitud", "CREATE INDEX ix_analisis_id_solicitud ON analisis_credito (id_solicitud)"),
        ("ix_analisis_analista_id", "CREATE INDEX ix_analisis_analista_id ON analisis_credito (analista_id)"),
        ("ix_firmas_id_documento", "CREATE INDEX ix_firmas_id_documento ON firmas_digitales (id_documento)"),
        ("ix_firmas_id_estudiante", "CREATE INDEX ix_firmas_id_estudiante ON firmas_digitales (id_estudiante)"),
        ("ix_firmas_hash", "CREATE INDEX ix_firmas_hash ON firmas_digitales (firma_hash)"),
    ]
    
    for index_name, sql in indices:
        try:
            db.session.execute(db.text(sql))
            db.session.commit()
            print(f"Creado: {index_name}")
        except Exception as e:
            db.session.rollback()
            if "Duplicate" in str(e):
                print(f"Ya existe: {index_name}")
            else:
                print(f"Error {index_name}: {e}")
    
    print("\nListo!")