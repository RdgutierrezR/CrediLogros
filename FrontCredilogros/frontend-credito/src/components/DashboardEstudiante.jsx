import { useState, useEffect } from "react";
import { API_URL } from "../config";
export default function DashboardEstudiante({ usuario, onLogout }) {
  const [activeTab, setActiveTab] = useState("solicitudes");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [solicitudes, setSolicitudes] = useState([]);
  const [turnoAsignado, setTurnoAsignado] = useState(null);
  const [turnoActual, setTurnoActual] = useState(null);
  const [posicionCola, setPosicionCola] = useState(null);
  const [estudiante, setEstudiante] = useState(null);
  const [formEstudiante, setFormEstudiante] = useState({
    nombre: usuario.nombre || "",
    cedula: "",
    telefono: "",
    direccion: "",
  });
  const [cargando, setCargando] = useState(true);
  const [archivos, setArchivos] = useState([]);
  const [documentosSubidos, setDocumentosSubidos] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [monto, setMonto] = useState("");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cargar estudiante
  useEffect(() => {
    const fetchEstudiante = async () => {
      try {
        const res = await fetch(`${API_URL}/estudiantes/`);
        const data = await res.json();
        const idUsuarioActual = parseInt(usuario.id_usuario);
        const miEstudiante = data.find((e) => parseInt(e.id_estudiante) === idUsuarioActual);
        if (miEstudiante) {
          setEstudiante(miEstudiante);
          setFormEstudiante({
            nombre: miEstudiante.nombre || "",
            cedula: miEstudiante.cedula || "",
            telefono: miEstudiante.telefono || "",
            direccion: miEstudiante.direccion || "",
          });
        }
      } catch (err) {
        console.error("Error cargando estudiante:", err);
      } finally {
        setCargando(false);
      }
    };
    fetchEstudiante();
  }, [usuario]);
  // Cargar solicitudes
  useEffect(() => {
    if (!estudiante) return;
    const fetchSolicitudes = async () => {
      try {
        const res = await fetch(`${API_URL}/solicitudes`);
        const data = await res.json();
        const idEstudianteActual = parseInt(estudiante.id_estudiante);
        const misSolicitudes = data.filter((s) => parseInt(s.id_estudiante) === idEstudianteActual);
        setSolicitudes(misSolicitudes);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSolicitudes();
  }, [estudiante]);
  // Turnos
  useEffect(() => {
    if (!solicitudes.length) return;
    const fetchTurnos = async () => {
      try {
        const resActual = await fetch(`${API_URL}/turnos/?estado=en atención`);
        const turnoActualData = await resActual.json();
        setTurnoActual(turnoActualData[0] || null);
        const resCola = await fetch(`${API_URL}/turnos/cola`);
        const cola = await resCola.json();
        const idsSolicitudes = solicitudes.map((s) => s.id_solicitud);
        const miTurno = cola.find((t) => idsSolicitudes.includes(t.id_solicitud)) || null;
        setTurnoAsignado(miTurno);
        if (miTurno) {
          const pendientes = cola.filter((t) => t.estado === "pendiente");
          const index = pendientes.findIndex((t) => t.id_turno === miTurno.id_turno);
          setPosicionCola(index !== -1 ? index + 1 : null);
        } else setPosicionCola(null);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTurnos();
  }, [solicitudes]);
  const handleGuardarEstudiante = async () => {
    if (!formEstudiante.nombre || !formEstudiante.cedula || !formEstudiante.telefono || !formEstudiante.direccion) {
      alert("Completa todos los campos");
      return;
    }
    try {
      if (estudiante) {
        const res = await fetch(`${API_URL}/estudiantes/${parseInt(estudiante.id_estudiante)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formEstudiante),
        });
        if (res.ok) {
          const data = await res.json();
          setEstudiante(data);
          alert("Perfil actualizado correctamente");
        } else {
          alert("Error al actualizar el perfil");
        }
      } else {
        const res = await fetch(`${API_URL}/estudiantes/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ...formEstudiante, 
            id_usuario: parseInt(usuario.id_usuario) 
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setEstudiante(data);
          alert("Perfil guardado correctamente");
        } else {
          alert(data.error || "Error al guardar el perfil");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar el perfil");
    }
  };
  const handleSolicitarCredito = async () => {
    if (!monto) return alert("Ingresa el monto");
    if (!estudiante) return alert("Debes tener un perfil");
    try {
      const res = await fetch(`${API_URL}/solicitudes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: parseInt(estudiante.id_estudiante),
          fecha_solicitud: new Date().toISOString().split("T")[0],
          estado: "pendiente",
          monto_solicitado: parseFloat(monto),
          monto_aprobado: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error al crear solicitud");
        return;
      }
      const nuevaSolicitud = data.solicitud || data;
      alert("Solicitud creada");
      setSolicitudes((prev) => [...prev, nuevaSolicitud]);
      setMonto("");
    } catch (err) {
      console.error(err);
      alert("Error al crear solicitud");
    }
  };
  const handleEliminarSolicitud = async (id_solicitud) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar esta solicitud?");
    if (!confirmar) return;
    try {
      const res = await fetch(`${API_URL}/solicitudes/${id_solicitud}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setSolicitudes((prev) => prev.filter((s) => parseInt(s.id_solicitud) !== parseInt(id_solicitud)));
        alert("Solicitud eliminada");
      } else {
        alert(data.error || "Error al eliminar la solicitud");
      }
    } catch (err) {
      console.error(err);
      alert("Error al eliminar la solicitud");
    }
  };
  const handleSubirArchivos = async (id_solicitud) => {
    if (archivos.length === 0) return alert("Selecciona archivos");
    setSubiendo(true);
    const formData = new FormData();
    archivos.forEach((file) => formData.append("file", file));
    formData.append("id_solicitud", id_solicitud);
    try {
      const res = await fetch(`${API_URL}/documentos`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setDocumentosSubidos((prev) => [...prev, data.documento]);
        setArchivos([]);
        alert("Archivo(s) subidos");
      } else {
        alert(data.error || "Error al subir");
      }
    } catch (err) {
      console.error(err);
      alert("Error al subir archivo");
    } finally {
      setSubiendo(false);
    }
  };
  const getBadgeClass = (estado) => {
    switch (estado) {
      case "aprobado": return styles.badgeApproved;
      case "rechazado": return styles.badgeRejected;
      default: return styles.badgePending;
    }
  };
  if (cargando) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }
  return isMobile ? (
    // VERSIÓN MÓVIL
    <div className="dashboard-mobile-container">
      {/* Header */}
      <header className="dashboard-header-mobile">
        <h1 className="dashboard-header-title">
          {activeTab === "perfil" && "Mi Perfil"}
          {activeTab === "solicitudes" && "Mis Solicitudes"}
          {activeTab === "turno" && "Mi Turno"}
        </h1>
        <div className="dashboard-header-user">
          {usuario.nombre?.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* Content */}
      <main className="dashboard-content-mobile">
        {activeTab === "perfil" && (
          <div className="dashboard-card-mobile">
            <h2 className="dashboard-card-title">Información Personal</h2>
            <div className="dashboard-form-grid">
              <div className="dashboard-input-group">
                <label>Nombre completo</label>
                <input type="text" value={formEstudiante.nombre} onChange={(e) => setFormEstudiante({ ...formEstudiante, nombre: e.target.value })} placeholder="Tu nombre" />
              </div>
              <div className="dashboard-input-group">
                <label>Cédula</label>
                <input type="text" value={formEstudiante.cedula} onChange={(e) => setFormEstudiante({ ...formEstudiante, cedula: e.target.value })} placeholder="Tu cédula" />
              </div>
              <div className="dashboard-input-group">
                <label>Teléfono</label>
                <input type="text" value={formEstudiante.telefono} onChange={(e) => setFormEstudiante({ ...formEstudiante, telefono: e.target.value })} placeholder="Tu teléfono" />
              </div>
              <div className="dashboard-input-group">
                <label>Dirección</label>
                <input type="text" value={formEstudiante.direccion} onChange={(e) => setFormEstudiante({ ...formEstudiante, direccion: e.target.value })} placeholder="Tu dirección" />
              </div>
            </div>
            <button className="dashboard-btn-primary" onClick={handleGuardarEstudiante}>
              {estudiante ? "Actualizar Perfil" : "Guardar Perfil"}
            </button>
          </div>
        )}

        {activeTab === "solicitudes" && (
          <div>
            <div className="dashboard-card-mobile">
              <h2 className="dashboard-card-title">Nueva Solicitud</h2>
              {!estudiante ? (
                <p style={{color: "#6b7280", marginBottom: "12px"}}>Completa tu perfil primero</p>
              ) : (
                <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
                  <input type="number" placeholder="Monto ($)" value={monto} onChange={(e) => setMonto(e.target.value)} style={{flex: "1 1 150px", minWidth: "150px", padding: "12px", borderRadius: "10px", border: "2px solid #e5e7eb", fontSize: "15px", boxSizing: "border-box"}} />
                  <button className="dashboard-btn-primary" style={{marginTop: 0, flex: "0 0 auto", padding: "12px 20px", whiteSpace: "nowrap"}} onClick={handleSolicitarCredito}>Solicitar</button>
                </div>
              )}
            </div>
            
            <div className="dashboard-card-mobile">
              <h2 className="dashboard-card-title">Historial</h2>
              {solicitudes.length === 0 ? (
                <p style={{color: "#9ca3af", textAlign: "center", padding: "20px"}}>No tienes solicitudes aún</p>
              ) : (
                <div className="dashboard-solicitudes-list">
                  {solicitudes.map((s) => (
                    <div key={s.id_solicitud} className="dashboard-solicitud-item">
                      <div className="dashboard-solicitud-header">
                        <span className="dashboard-solicitud-id">#{s.id_solicitud}</span>
                        <span className={`dashboard-badge ${s.estado}`}>{s.estado}</span>
                      </div>
                      <p style={{fontSize: "14px", color: "#6b7280"}}><strong>Monto:</strong> ${s.monto_solicitado}</p>
                      <p style={{fontSize: "14px", color: "#6b7280"}}><strong>Fecha:</strong> {s.fecha_solicitud}</p>
                      
                      {s.estado === "pendiente" && (
                        <div style={{marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e5e7eb"}}>
                          <p style={{fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "8px"}}>Subir documentos</p>
                          <div style={{display: "flex", gap: "8px", alignItems: "center"}}>
                            <label className="dashboard-file-upload">
                              <input type="file" multiple onChange={(e) => setArchivos(Array.from(e.target.files))} style={{display: "none"}} />
                              {archivos.length > 0 ? `${archivos.length} archivo(s)` : "📎 Seleccionar"}
                            </label>
                            <button className="dashboard-upload-btn" onClick={() => handleSubirArchivos(s.id_solicitud)} disabled={subiendo}>
                              {subiendo ? "Subiendo..." : "Subir"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "turno" && (
          <div>
            <div className="dashboard-stats-grid">
              <div className="dashboard-stat-card">
                <div className="dashboard-stat-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <div><p className="dashboard-stat-label">Mi Turno</p><p className="dashboard-stat-value">#{turnoAsignado?.id_turno || "—"}</p></div>
              </div>
              <div className="dashboard-stat-card">
                <div className="dashboard-stat-icon green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/></svg>
                </div>
                <div><p className="dashboard-stat-label">Estado</p><p className="dashboard-stat-value">{turnoAsignado?.estado || "Sin turno"}</p></div>
              </div>
              <div className="dashboard-stat-card">
                <div className="dashboard-stat-icon orange">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/></svg>
                </div>
                <div><p className="dashboard-stat-label">Posición</p><p className="dashboard-stat-value">#{posicionCola || "—"}</p></div>
              </div>
            </div>
            <div className="dashboard-card-mobile">
              <h2 className="dashboard-card-title">Turno en Atención</h2>
              <div className="dashboard-turno-actual">
                <p className="dashboard-turno-text">{turnoActual ? `Atendiendo #${turnoActual.id_turno}` : "No hay nadie en atención"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button className="dashboard-logout-btn" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
          Cerrar Sesión
        </button>
      </main>

      {/* Navigation Bar Inferior */}
      <nav className="dashboard-nav-bottom">
        <button className={`dashboard-nav-item ${activeTab === "perfil" ? "active" : ""}`} onClick={() => setActiveTab("perfil")}>
          <span className="dashboard-nav-icon">👤</span>
          Perfil
        </button>
        <button className={`dashboard-nav-item ${activeTab === "solicitudes" ? "active" : ""}`} onClick={() => setActiveTab("solicitudes")}>
          <span className="dashboard-nav-icon">📄</span>
          Solicitudes
        </button>
        <button className={`dashboard-nav-item ${activeTab === "turno" ? "active" : ""}`} onClick={() => setActiveTab("turno")}>
          <span className="dashboard-nav-icon">⏰</span>
          Turno
        </button>
      </nav>
    </div>
  ) : (
    // VERSIÓN DESKTOP
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.logoIconSmall}>C</div>
          <span style={styles.logoText}>CrediLogros</span>
        </div>
        
        <nav style={styles.sidebarNav}>
          <button style={activeTab === "perfil" ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab("perfil")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Mi Perfil
          </button>
          <button style={activeTab === "solicitudes" ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab("solicitudes")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Mis Solicitudes
          </button>
          <button style={activeTab === "turno" ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab("turno")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Mi Turno
          </button>
        </nav>
        <div style={styles.sidebarFooter}>
          <button style={styles.logoutBtn} onClick={onLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main style={styles.mainContent}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              {activeTab === "perfil" && "Mi Perfil"}
              {activeTab === "solicitudes" && "Mis Solicitudes"}
              {activeTab === "turno" && "Mi Turno"}
            </h1>
            <p style={styles.headerSubtitle}>Bienvenido, {usuario.nombre}</p>
          </div>
          <div style={styles.userAvatar}>
            {usuario.nombre?.charAt(0).toUpperCase()}
          </div>
        </header>
        {/* Content */}
        <div style={styles.content}>
          {/* TAB: PERFIL */}
          {activeTab === "perfil" && (
            <div style={styles.card} className="fade-in">
              <h2 style={styles.cardTitle}>Información Personal</h2>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nombre completo</label>
                  <input
                    type="text"
                    value={formEstudiante.nombre}
                    onChange={(e) => setFormEstudiante({ ...formEstudiante, nombre: e.target.value })}
                    style={styles.input}
                    placeholder="Tu nombre"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Cédula</label>
                  <input
                    type="text"
                    value={formEstudiante.cedula}
                    onChange={(e) => setFormEstudiante({ ...formEstudiante, cedula: e.target.value })}
                    style={styles.input}
                    placeholder="Tu cédula"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Teléfono</label>
                  <input
                    type="text"
                    value={formEstudiante.telefono}
                    onChange={(e) => setFormEstudiante({ ...formEstudiante, telefono: e.target.value })}
                    style={styles.input}
                    placeholder="Tu teléfono"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Dirección</label>
                  <input
                    type="text"
                    value={formEstudiante.direccion}
                    onChange={(e) => setFormEstudiante({ ...formEstudiante, direccion: e.target.value })}
                    style={styles.input}
                    placeholder="Tu dirección"
                  />
                </div>
              </div>
              <button style={styles.primaryBtn} onClick={handleGuardarEstudiante}>
                {estudiante ? "Actualizar Perfil" : "Guardar Perfil"}
              </button>
            </div>
          )}
          {/* TAB: SOLICITUDES */}
          {activeTab === "solicitudes" && (
            <div style={styles.fadeIn}>
              {/* Nueva Solicitud */}
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Nueva Solicitud de Crédito</h2>
                {!estudiante ? (
                  <div style={{textAlign: "center", padding: "20px"}}>
                    <p style={{color: "#6b7280", marginBottom: "16px"}}>Debes completar tu perfil primero para solicitar un crédito</p>
                    <button style={styles.primaryBtn} onClick={() => setActiveTab("perfil")}>
                      Ir a Mi Perfil
                    </button>
                  </div>
                ) : (
                  <div style={styles.solicitudForm}>
                    <input
                      type="number"
                      placeholder="Monto a solicitar ($)"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      style={{...styles.input, flex: 1}}
                    />
                    <button style={styles.primaryBtn} onClick={handleSolicitarCredito}>
                      Solicitar
                    </button>
                  </div>
                )}
              </div>
              {/* Lista de Solicitudes */}
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Historial de Solicitudes</h2>
                {solicitudes.length === 0 ? (
                  <p style={styles.emptyText}>No tienes solicitudes aún</p>
                ) : (
                  <div style={styles.solicitudesList}>
                    {solicitudes.map((s) => (
                      <div key={s.id_solicitud} style={styles.solicitudItem}>
                        <div style={styles.solicitudHeader}>
                          <span style={styles.solicitudId}>#{s.id_solicitud}</span>
                          <div style={styles.solicitudActions}>
                            <span style={getBadgeClass(s.estado)}>{s.estado}</span>
                            {s.estado === "pendiente" && (
                              <button 
                                style={styles.deleteBtn} 
                                onClick={() => handleEliminarSolicitud(s.id_solicitud)}
                                title="Eliminar solicitud"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={styles.solicitudBody}>
                          <div style={styles.solicitudInfo}>
                            <p><strong>Monto:</strong> ${s.monto_solicitado}</p>
                            <p><strong>Fecha:</strong> {s.fecha_solicitud}</p>
                            {s.monto_aprobado && <p><strong>Aprobado:</strong> ${s.monto_aprobado}</p>}
                          </div>
                          
                          {/* Upload de documentos */}
                          <div style={styles.uploadSection}>
                            <p style={styles.uploadTitle}>Documentos</p>
                            <div style={styles.uploadRow}>
                              <label style={styles.fileInput}>
                                <input
                                  type="file"
                                  multiple
                                  onChange={(e) => setArchivos(Array.from(e.target.files))}
                                  style={{ display: "none" }}
                                />
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                                </svg>
                                {archivos.length > 0 ? `${archivos.length} archivo(s)` : "Seleccionar"}
                              </label>
                              <button
                                style={subiendo ? styles.btnLoading : styles.uploadBtn}
                                onClick={() => handleSubirArchivos(s.id_solicitud)}
                                disabled={subiendo}
                              >
                                {subiendo ? "Subiendo..." : "Subir"}
                              </button>
                            </div>
                            
                            {/* Lista de documentos subidos */}
                            <div style={styles.docList}>
                              {documentosSubidos
                                .filter((d) => d.id_solicitud === s.id_solicitud)
                                .map((d) => {
                                  const baseUrl = API_URL.replace('/api', '');
                                  return (
                                  <a
                                    key={d.id_documento}
                                    href={`${baseUrl}/${d.ruta_archivo}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={styles.docLink}
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                      <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                    {d.nombre_archivo.substring(0, 20)}...
                                  </a>
                                );
                                })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* TAB: TURNO */}
          {activeTab === "turno" && (
            <div style={styles.fadeIn}>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statIconBlue}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <p style={styles.statLabel}>Mi Turno</p>
                    <p style={styles.statValue}>#{turnoAsignado?.id_turno || "—"}</p>
                  </div>
                </div>
                
                <div style={styles.statCard}>
                  <div style={styles.statIconGreen}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <div>
                    <p style={styles.statLabel}>Estado</p>
                    <p style={styles.statValue}>{turnoAsignado?.estado || "Sin turno"}</p>
                  </div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statIconOrange}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </div>
                  <div>
                    <p style={styles.statLabel}>Posición</p>
                    <p style={styles.statValue}>#{posicionCola || "—"}</p>
                  </div>
                </div>
              </div>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Turno en Atención</h2>
                <div style={styles.turnoActual}>
                  <p style={styles.turnoActualText}>
                    {turnoActual
                      ? `Atendiendo turno #${turnoActual.id_turno}`
                      : "No hay nadie en atención"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f3f4f6",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    gap: "16px",
    color: "#6b7280",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTopColor: "#1e3a8a",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  sidebar: {
    width: "260px",
    background: "white",
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
    position: "fixed",
    height: "100vh",
  },
  sidebarLogo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "24px 20px",
    borderBottom: "1px solid #e5e7eb",
  },
  logoIconSmall: {
    width: "36px",
    height: "36px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "18px",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  sidebarNav: {
    flex: 1,
    padding: "20px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "transparent",
    color: "#6b7280",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    width: "100%",
    textAlign: "left",
  },
  navItemActive: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    color: "white",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
  },
  sidebarFooter: {
    padding: "20px",
    borderTop: "1px solid #e5e7eb",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "2px solid #dc2626",
    background: "transparent",
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  mainContent: {
    flex: 1,
    marginLeft: "260px",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 32px",
    background: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "4px",
  },
  headerSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },
  userAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "18px",
  },
  content: {
    padding: "24px 32px",
    flex: 1,
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    marginBottom: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "2px solid #e5e7eb",
    fontSize: "15px",
    transition: "all 0.2s",
    background: "#f9fafb",
  },
  primaryBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  solicitudForm: {
    display: "flex",
    gap: "12px",
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    padding: "40px",
  },
  solicitudesList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  solicitudItem: {
    background: "#f9fafb",
    borderRadius: "12px",
    padding: "20px",
    border: "1px solid #e5e7eb",
  },
  solicitudHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  solicitudActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  deleteBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: "none",
    background: "#fee2e2",
    color: "#dc2626",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  solicitudId: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
  },
  badgePending: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    background: "#fef3c7",
    color: "#92400e",
    textTransform: "capitalize",
  },
  badgeApproved: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    background: "#d1fae5",
    color: "#065f46",
    textTransform: "capitalize",
  },
  badgeRejected: {
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    background: "#fee2e2",
    color: "#991b1b",
    textTransform: "capitalize",
  },
  solicitudBody: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
  },
  solicitudInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    color: "#6b7280",
    fontSize: "14px",
  },
  uploadSection: {
    flex: 1,
    minWidth: "250px",
  },
  uploadTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
  },
  uploadRow: {
    display: "flex",
    gap: "8px",
  },
  fileInput: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    background: "white",
    border: "2px dashed #d1d5db",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#6b7280",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  uploadBtn: {
    padding: "8px 16px",
    background: "#059669",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnLoading: {
    padding: "8px 16px",
    background: "#9ca3af",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "not-allowed",
  },
  docList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },
  docLink: {
     display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    background: "white",
    borderRadius: "6px",
    fontSize: "12px",
    color: "#1e3a8a",
    textDecoration: "none",
    border: "1px solid #e5e7eb",
  },
  fadeIn: {
    animation: "fadeIn 0.3s ease",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "24px",
  },
  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  statIconBlue: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#dbeafe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1e40af",
  },
  statIconGreen: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#d1fae5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#059669",
  },
  statIconOrange: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#fef3c7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#d97706",
  },
  statLabel: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "2px",
  },
  statValue: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1f2937",
  },
  turnoActual: {
    background: "#f0fdf4",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
  },
  turnoActualText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#059669",
  },
};