import { useState, useEffect } from "react";
import { API_URL, FRONTEND_URL } from "../config";
import QRModal from "./QRModal";
import { formatearCOP } from "../utils/formatoMoneda";
export default function DashboardAnalista({ usuario, onLogout }) {
  const [activeTab, setActiveTab] = useState("solicitudes");
  const [solicitudes, setSolicitudes] = useState([]);
  const [colaTurnos, setColaTurnos] = useState([]);
  const [turnoActual, setTurnoActual] = useState(null);
  const [todosTurnos, setTodosTurnos] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [qrUrl, setQrUrl] = useState("");

  const generarQR = () => {
    setQrUrl(`${FRONTEND_URL}/estudiante`);
    setShowQRModal(true);
  };
  // Stats
  const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;
  const aprobados = solicitudes.filter((s) => s.estado === "aprobado").length;
  const rechazados = solicitudes.filter((s) => s.estado === "rechazado").length;
  const cargarSolicitudes = async () => {
    const res = await fetch(`${API_URL}/solicitudes`);
    const data = await res.json();
    setSolicitudes(data);
  };
  const cargarTurnos = async () => {
    const resCola = await fetch(`${API_URL}/turnos/cola`);
    const cola = await resCola.json();
    setColaTurnos(cola);
    const resActual = await fetch(`${API_URL}/turnos/?estado=en atención`);
    const actual = await resActual.json();
    setTurnoActual(actual[0] || null);
    const resTodos = await fetch(`${API_URL}/turnos/`);
    const todos = await resTodos.json();
    setTodosTurnos(todos);
    setCargando(false);
  };
  useEffect(() => {
    cargarSolicitudes();
    cargarTurnos();
  }, []);
  const verDetalleSolicitud = async (id_solicitud) => {
    const res = await fetch(`${API_URL}/solicitudes/${id_solicitud}/detalle`);
    const data = await res.json();
    setDetalle(data);
    setShowModal(true);
  };
  const handleAprobar = async (solicitud) => {
    await fetch(`${API_URL}/solicitudes/${solicitud.id_solicitud}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...solicitud, estado: "aprobado", monto_aprobado: solicitud.monto_solicitado }),
    });
    cargarSolicitudes();
    alert("Solicitud aprobada");
  };
  const handleRechazar = async (solicitud) => {
    await fetch(`${API_URL}/solicitudes/${solicitud.id_solicitud}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...solicitud, estado: "rechazado", monto_aprobado: 0 }),
    });
    cargarSolicitudes();
    alert("Solicitud rechazada");
  };
  const handleCrearTurno = async (solicitud) => {
    await fetch(`${API_URL}/turnos/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_solicitud: solicitud.id_solicitud,
        fecha_turno: new Date().toISOString().split("T")[0],
        hora_turno: new Date().toLocaleTimeString("es-CO", { hour12: false }),
        estado: "pendiente",
      }),
    });
    cargarTurnos();
    alert("Turno creado");
  };
  const handleAvanzarTurno = async () => {
    if (turnoActual) {
      await fetch(`${API_URL}/turnos/${turnoActual.id_turno}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...turnoActual, estado: "atendido" }),
      });
    }
    if (colaTurnos.length > 0) {
      const siguiente = colaTurnos[0];
      await fetch(`${API_URL}/turnos/${siguiente.id_turno}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...siguiente, estado: "en atención" }),
      });
    }
    cargarTurnos();
    alert("Turno avanzado");
  };
  const solicitudTieneTurno = (id_solicitud) => todosTurnos.some((t) => t.id_solicitud === id_solicitud);
  if (cargando) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Cargando...</p>
      </div>
    );
  }
  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <div style={styles.logoIconSmall}>C</div>
          <span style={styles.logoText}>CrediLogros</span>
        </div>
        <div style={styles.analistaBadge}>ANALISTA</div>
        
        <nav style={styles.sidebarNav}>
          <button style={activeTab === "solicitudes" ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab("solicitudes")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Solicitudes
          </button>
          <button style={activeTab === "turnos" ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab("turnos")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Gestión de Turnos
          </button>
          <button style={activeTab === "ajustes" ? styles.navItemActive : styles.navItem} onClick={() => setActiveTab("ajustes")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            Ajustes
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
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>
              {activeTab === "solicitudes" ? "Solicitudes de Crédito" : activeTab === "turnos" ? "Gestión de Turnos" : "Ajustes"}
            </h1>
            <p style={styles.headerSubtitle}>Panel de Analista - {usuario.nombre}</p>
          </div>
          <div style={styles.userAvatar}>{usuario.nombre?.charAt(0).toUpperCase()}</div>
        </header>
        <div style={styles.content}>
          {/* Stats Cards */}
          <div style={styles.statsGrid}>
            <div style={{...styles.statCard, borderLeft: "4px solid #f59e0b"}}>
              <div style={styles.statIconOrange}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div>
                <p style={styles.statLabel}>Pendientes</p>
                <p style={styles.statValue}>{pendientes}</p>
              </div>
            </div>
            <div style={{...styles.statCard, borderLeft: "4px solid #059669"}}>
              <div style={styles.statIconGreen}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <p style={styles.statLabel}>Aprobados</p>
                <p style={styles.statValue}>{aprobados}</p>
              </div>
            </div>
            <div style={{...styles.statCard, borderLeft: "4px solid #dc2626"}}>
              <div style={styles.statIconRed}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div>
                <p style={styles.statLabel}>Rechazados</p>
                <p style={styles.statValue}>{rechazados}</p>
              </div>
            </div>
          </div>
          {/* TAB: SOLICITUDES */}
          {activeTab === "solicitudes" && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Solicitudes Pendientes</h2>
              {solicitudes.filter((s) => s.estado === "pendiente").length === 0 ? (
                <p style={styles.emptyText}>No hay solicitudes pendientes</p>
              ) : (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeader}>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Monto</th>
                        <th style={styles.th}>Fecha</th>
                        <th style={styles.th}>Estado</th>
                        <th style={styles.th}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitudes
                        .filter((s) => s.estado === "pendiente")
                        .map((s) => (
                          <tr key={s.id_solicitud} style={styles.tr}>
                            <td style={styles.td}>#{s.id_solicitud}</td>
                            <td style={styles.td}>{formatearCOP(s.monto_solicitado)}</td>
                            <td style={styles.td}>{s.fecha_solicitud}</td>
                            <td style={styles.td}>
                              <span style={styles.badgePending}>{s.estado}</span>
                            </td>
                            <td style={styles.td}>
                              <div style={styles.actionButtons}>
                                <button style={styles.detailBtn} onClick={() => verDetalleSolicitud(s.id_solicitud)}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                  </svg>
                                  Ver
                                </button>
                                {!solicitudTieneTurno(s.id_solicitud) && (
                                  <button style={styles.turnoBtn} onClick={() => handleCrearTurno(s)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    Turno
                                  </button>
                                )}
                                <button style={styles.approveBtn} onClick={() => handleAprobar(s)}>Aprobar</button>
                                <button style={styles.rejectBtn} onClick={() => handleRechazar(s)}>Rechazar</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {/* TAB: TURNOS */}
          {activeTab === "turnos" && (
            <div style={styles.grid2Cols}>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Turno en Atención</h2>
                <div style={styles.turnoBox}>
                  <div style={styles.turnoNumber}>
                    {turnoActual ? `#${turnoActual.id_turno}` : "—"}
                  </div>
                  <p style={styles.turnoLabel}>
                    {turnoActual ? "Atendiendo" : "Sin turno"}
                  </p>
                  <button style={styles.avanzarBtn} onClick={handleAvanzarTurno}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Avanzar Turno
                  </button>
                </div>
              </div>
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Cola de Espera ({colaTurnos.length})</h2>
                {colaTurnos.length === 0 ? (
                  <p style={styles.emptyText}>No hay turnos en cola</p>
                ) : (
                  <div style={styles.colaList}>
                    {colaTurnos.map((t, index) => (
                      <div key={t.id_turno} style={styles.colaItem}>
                        <div style={styles.colaPosition}>{index + 1}</div>
                        <div style={styles.colaInfo}>
                          <p style={styles.colaTurno}>#{t.id_turno}</p>
                          <p style={styles.colaSolicitud}>Solicitud #{t.id_solicitud}</p>
                        </div>
                        <span style={t.estado === "en atención" ? styles.badgeActive : styles.badgePending}>
                          {t.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* TAB: AJUSTES */}
          {activeTab === "ajustes" && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>QR de Acceso Estudiantil</h2>
              <p style={styles.settingDesc}>
                Los estudiantes pueden escanear este código QR para acceder directamente a la pantalla de identificación sin necesidad de escribir su cédula.
              </p>
              <button 
                style={styles.qrButton} 
                onClick={generarQR}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                </svg>
                Mostrar QR
              </button>
            </div>
          )}
        </div>
      </main>
      {/* Modal */}
      {showModal && detalle && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Detalle Solicitud #{detalle.solicitud.id_solicitud}</h2>
              <button style={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <h3 style={styles.modalSectionTitle}>Datos del Estudiante</h3>
                <p><strong>Nombre:</strong> {detalle.estudiante?.nombre}</p>
                <p><strong>Cédula:</strong> {detalle.estudiante?.cedula}</p>
                <p><strong>Teléfono:</strong> {detalle.estudiante?.telefono}</p>
                <p><strong>Dirección:</strong> {detalle.estudiante?.direccion}</p>
              </div>
              <div style={styles.modalSection}>
                <h3 style={styles.modalSectionTitle}>Datos de la Solicitud</h3>
                <p><strong>Monto:</strong> {formatearCOP(detalle.solicitud.monto_solicitado)}</p>
                <p><strong>Estado:</strong> {detalle.solicitud.estado}</p>
                <p><strong>Fecha:</strong> {detalle.solicitud.fecha_solicitud}</p>
              </div>
              <div style={styles.modalSection}>
                <h3 style={styles.modalSectionTitle}>Documentos</h3>
                {detalle.documentos?.length === 0 ? (
                  <p style={styles.emptyText}>Sin documentos</p>
                ) : (
                  <div style={styles.docList}>
                    {detalle.documentos?.map((doc) => {
                      const baseUrl = API_URL.replace('/api', '');
                      return (
                        <a
                          key={doc.id_documento}
                          href={`${baseUrl}/${doc.ruta_archivo}`}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.docLink}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                          {doc.nombre_archivo}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.closeModalBtn} onClick={() => setShowModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
      {/* QR Modal */}
      {showQRModal && qrUrl && (
        <QRModal 
          url={qrUrl} 
          onClose={() => setShowQRModal(false)} 
        />
      )}
    </div>
  );
}
const styles = {
  container: { display: "flex", minHeight: "100vh", background: "#f3f4f6" },
  loadingContainer: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: "16px", color: "#6b7280" },
  spinner: { width: "40px", height: "40px", border: "4px solid #e5e7eb", borderTopColor: "#1e3a8a", borderRadius: "50%", animation: "spin 1s linear infinite" },
  sidebar: { width: "260px", background: "white", display: "flex", flexDirection: "column", boxShadow: "2px 0 10px rgba(0,0,0,0.05)", position: "fixed", height: "100vh" },
  sidebarLogo: { display: "flex", alignItems: "center", gap: "12px", padding: "24px 20px", borderBottom: "1px solid #e5e7eb" },
  logoIconSmall: { width: "36px", height: "36px", background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "18px" },
  logoText: { fontSize: "20px", fontWeight: "800", background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  analistaBadge: { textAlign: "center", padding: "8px", margin: "12px 20px", background: "#1e3a8a", color: "white", borderRadius: "8px", fontSize: "12px", fontWeight: "700", letterSpacing: "1px" },
  sidebarNav: { flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: "4px" },
  navItem: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: "none", background: "transparent", color: "#6b7280", fontSize: "15px", fontWeight: "500", cursor: "pointer", transition: "all 0.2s", width: "100%", textAlign: "left" },
  navItemActive: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)", color: "white", fontSize: "15px", fontWeight: "500", cursor: "pointer", width: "100%", textAlign: "left" },
  sidebarFooter: { padding: "20px", borderTop: "1px solid #e5e7eb" },
  logoutBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "12px", borderRadius: "10px", border: "2px solid #dc2626", background: "transparent", color: "#dc2626", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  mainContent: { flex: 1, marginLeft: "260px", display: "flex", flexDirection: "column" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 32px", background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  headerTitle: { fontSize: "24px", fontWeight: "700", color: "#1f2937", marginBottom: "4px" },
  headerSubtitle: { fontSize: "14px", color: "#6b7280" },
  userAvatar: { width: "44px", height: "44px", borderRadius: "12px", background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "18px" },
  content: { padding: "24px 32px", flex: 1 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "24px" },
  statCard: { background: "white", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  statIconOrange: { width: "48px", height: "48px", borderRadius: "12px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" },
  statIconGreen: { width: "48px", height: "48px", borderRadius: "12px", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" },
  statIconRed: { width: "48px", height: "48px", borderRadius: "12px", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626" },
  statLabel: { fontSize: "13px", color: "#6b7280", marginBottom: "2px" },
  statValue: { fontSize: "28px", fontWeight: "700", color: "#1f2937" },
  card: { background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "24px" },
  cardTitle: { fontSize: "18px", fontWeight: "700", color: "#1f2937", marginBottom: "20px" },
  emptyText: { textAlign: "center", color: "#9ca3af", padding: "40px" },
  tableContainer: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { background: "#f9fafb" },
  th: { padding: "14px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase" },
  tr: { borderBottom: "1px solid #e5e7eb" },
  td: { padding: "16px", fontSize: "14px", color: "#374151" },
  badgePending: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: "#fef3c7", color: "#92400e", textTransform: "capitalize" },
  badgeActive: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: "#dbeafe", color: "#1e40af", textTransform: "capitalize" },
  actionButtons: { display: "flex", gap: "8px", flexWrap: "wrap" },
  detailBtn: { display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", color: "#374151", cursor: "pointer" },
  turnoBtn: { display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: "8px", fontSize: "13px", color: "#1e40af", cursor: "pointer" },
  approveBtn: { padding: "6px 14px", background: "#059669", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", color: "white", cursor: "pointer" },
  rejectBtn: { padding: "6px 14px", background: "#dc2626", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", color: "white", cursor: "pointer" },
  grid2Cols: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  turnoBox: { textAlign: "center", padding: "30px", background: "#f0fdf4", borderRadius: "16px" },
  turnoNumber: { fontSize: "48px", fontWeight: "800", color: "#059669", marginBottom: "8px" },
  turnoLabel: { fontSize: "16px", color: "#6b7280", marginBottom: "20px" },
  avanzarBtn: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "14px 28px", background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "600", color: "white", cursor: "pointer" },
  colaList: { display: "flex", flexDirection: "column", gap: "12px" },
  colaItem: { display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "#f9fafb", borderRadius: "12px" },
  colaPosition: { width: "32px", height: "32px", borderRadius: "50%", background: "#1e3a8a", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "14px" },
  colaInfo: { flex: 1 },
  colaTurno: { fontWeight: "700", color: "#1f2937", fontSize: "16px" },
  colaSolicitud: { fontSize: "13px", color: "#6b7280" },
  modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { background: "white", borderRadius: "20px", width: "90%", maxWidth: "600px", maxHeight: "80vh", overflow: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #e5e7eb" },
  modalTitle: { fontSize: "20px", fontWeight: "700", color: "#1f2937" },
  modalClose: { width: "36px", height: "36px", borderRadius: "50%", border: "none", background: "#f3f4f6", fontSize: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  modalBody: { padding: "24px" },
  modalSection: { marginBottom: "24px" },
  modalSectionTitle: { fontSize: "16px", fontWeight: "700", color: "#1f2937", marginBottom: "12px" },
  docList: { display: "flex", flexDirection: "column", gap: "8px" },
  docLink: { display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "#f9fafb", borderRadius: "8px", textDecoration: "none", color: "#1e3a8a", fontSize: "14px" },
  modalFooter: { padding: "16px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end" },
  closeModalBtn: { padding: "10px 20px", background: "#6b7280", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", color: "white", cursor: "pointer" },
  settingDesc: { fontSize: "14px", color: "#6b7280", marginBottom: "20px", lineHeight: "1.5" },
  qrButton: { display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 24px", background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: "600", color: "white", cursor: "pointer" },
};