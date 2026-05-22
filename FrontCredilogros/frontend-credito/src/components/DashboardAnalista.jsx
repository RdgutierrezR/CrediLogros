import { useState, useEffect, useCallback, useRef } from "react";
import { API_URL, FRONTEND_URL } from "../config";
import { formatearCOP } from "../utils/formatoMoneda";
import ConfirmDialog from "./ConfirmDialog";
import ToastContainer, { showToast } from "./ToastContainer";
import QRModal from "./QRModal";
import "../styles/theme.css";
import "./dashboard.css";

export default function DashboardAnalista({ usuario, onLogout }) {
  const [activeView, setActiveView] = useState("atencion");
  const [solicitudes, setSolicitudes] = useState([]);
  const [colaTurnos, setColaTurnos] = useState([]);
  const [turnoActual, setTurnoActual] = useState(null);
  const [solicitudActual, setSolicitudActual] = useState(null);
  const [estudianteActual, setEstudianteActual] = useState(null);
  const [detalleActual, setDetalleActual] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoAccion, setCargandoAccion] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toastMounted = useRef(false);
  const prevTurnoRef = useRef(null);

  const statsEnCola = colaTurnos.length;
  const statsAtendidosHoy = historial.filter((h) => h.accion === "atendido").length;
  const statsEsperaLarga = colaTurnos.length;
  const tiempoPromedio = statsAtendidosHoy > 0 ? Math.round(Math.random() * 8 + 5) : 0;

  const calcularTiempoEspera = useCallback((fechaStr, horaStr) => {
    if (!fechaStr || !horaStr) return "0m";
    const turnoDate = new Date(`${fechaStr}T${horaStr}`);
    const ahora = new Date();
    const diffMs = ahora - turnoDate;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}m`;
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return `${h}h ${m}m`;
  }, []);

  const cargarTodo = useCallback(async () => {
    try {
      const [resCola, resEnAtencion, resHistorial] = await Promise.all([
        fetch(`${API_URL}/turnos/cola`),
        fetch(`${API_URL}/turnos/?estado=en%20atenci%C3%B3n&paginated=false`),
        fetch(`${API_URL}/turnos/?estado=completado&paginated=false`),
      ]);
      const cola = await resCola.json();
      setColaTurnos(Array.isArray(cola) ? cola : []);

      const enAten = await resEnAtencion.json();
      const enAtenData = Array.isArray(enAten) ? enAten : (enAten.items || []);
      const nuevoTurno = enAtenData[0] || null;

      if (nuevoTurno && (!prevTurnoRef.current || prevTurnoRef.current.id_turno !== nuevoTurno.id_turno)) {
        prevTurnoRef.current = nuevoTurno;
        setTurnoActual(nuevoTurno);
        if (nuevoTurno.id_solicitud) {
          const resDet = await fetch(`${API_URL}/solicitudes/${nuevoTurno.id_solicitud}/detalle`);
          if (resDet.ok) {
            const det = await resDet.json();
            setDetalleActual(det);
            setSolicitudActual(det.solicitud);
            setEstudianteActual(det.estudiante);
          }
        }
      }

      const todosCompletados = await resHistorial.json();
      const completados = Array.isArray(todosCompletados) ? todosCompletados : (todosCompletados.items || []);
      const hoy = new Date().toISOString().split("T")[0];
      const deHoy = completados.filter((t) => t.fecha_turno === hoy);

      const historialConSolicitud = await Promise.all(
        deHoy.slice(0, 10).reverse().map(async (t) => {
          try {
            const res = await fetch(`${API_URL}/solicitudes/${t.id_solicitud}`);
            if (res.ok) {
              const sol = await res.json();
              return { ...t, solicitudEstado: sol.estado };
            }
          } catch {}
          return { ...t, solicitudEstado: "completado" };
        })
      );
      setHistorial(historialConSolicitud);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTodo();
    const interval = setInterval(cargarTodo, 10000);
    return () => clearInterval(interval);
  }, [cargarTodo]);

  const avanzarYAtencion = async () => {
    setCargandoAccion(true);
    try {
      await fetch(`${API_URL}/turnos/avanzar`, { method: "PUT" });
      setTurnoActual(null);
      setSolicitudActual(null);
      setEstudianteActual(null);
      setDetalleActual(null);
      prevTurnoRef.current = null;
      await cargarTodo();
    } catch (err) {
      showToast("Error al avanzar turno", "error");
    } finally {
      setCargandoAccion(false);
    }
  };

  const handleAprobar = () => {
    if (!solicitudActual || !turnoActual) return;
    setConfirmDialog({
      type: "approve",
      title: "Aprobar Solicitud",
      message: `¿Aprobar la solicitud #${solicitudActual.id_solicitud} de ${estudianteActual?.nombre} por ${formatearCOP(solicitudActual.monto_solicitado)}?`,
      confirmText: "Aprobar",
      onConfirm: async () => {
        setConfirmDialog(null);
        setCargandoAccion(true);
        try {
          await fetch(`${API_URL}/solicitudes/${solicitudActual.id_solicitud}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "aprobado", monto_aprobado: solicitudActual.monto_solicitado }),
          });
          showToast(`Solicitud #${solicitudActual.id_solicitud} aprobada`, "success");
          await avanzarYAtencion();
        } catch {
          showToast("Error al aprobar", "error");
        } finally {
          setCargandoAccion(false);
        }
      },
    });
  };

  const handleRechazar = () => {
    if (!solicitudActual || !turnoActual) return;
    setConfirmDialog({
      type: "reject",
      title: "Rechazar Solicitud",
      message: `¿Rechazar la solicitud #${solicitudActual.id_solicitud} de ${estudianteActual?.nombre}?`,
      confirmText: "Rechazar",
      onConfirm: async () => {
        setConfirmDialog(null);
        setCargandoAccion(true);
        try {
          await fetch(`${API_URL}/solicitudes/${solicitudActual.id_solicitud}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "rechazado", monto_aprobado: 0 }),
          });
          showToast(`Solicitud #${solicitudActual.id_solicitud} rechazada`, "error");
          await avanzarYAtencion();
        } catch {
          showToast("Error al rechazar", "error");
        } finally {
          setCargandoAccion(false);
        }
      },
    });
  };

  const handleIniciarAtencion = async () => {
    if (colaTurnos.length === 0) return;
    setCargandoAccion(true);
    try {
      await fetch(`${API_URL}/turnos/avanzar`, { method: "PUT" });
      await cargarTodo();
      showToast("Atención iniciada", "success");
    } catch {
      showToast("Error al iniciar atención", "error");
    } finally {
      setCargandoAccion(false);
    }
  };

  const getBadgeClass = (estado) => {
    const map = {
      "pendiente": "badge-pending",
      "en atención": "badge-active",
      "completado": "badge-success",
      "aprobado": "badge-success",
      "rechazado": "badge-danger",
      "en estudio": "badge-attention",
    };
    return map[estado] || "badge-neutral";
  };

  if (cargando) {
    return (
      <div style={styles.loadingContainer}>
        <div className="spinner" />
        <p style={{ color: "#6b7280", fontSize: "15px" }}>Cargando centro de atención...</p>
      </div>
    );
  }

  return (
    <div style={styles.root} className="analista-root">
      <ToastContainer onMount={(fn) => { toastMounted.current = fn; }} />

      <aside style={{
        ...styles.sidebar,
        transform: sidebarOpen ? "translateX(0)" : undefined,
      }} className="analista-sidebar">
        <div style={styles.sidebarLogo}>
          <div style={styles.logoIcon}>C</div>
          <span style={styles.logoText}>CrediLogros</span>
        </div>
        <div style={styles.analistaBadge}>ANALISTA</div>

        <nav style={styles.sidebarNav}>
          <button
            style={activeView === "atencion" ? styles.navActive : styles.navItem}
            onClick={() => { setActiveView("atencion"); setSidebarOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Centro de Atención
          </button>
          <button
            style={activeView === "ajustes" ? styles.navActive : styles.navItem}
            onClick={() => { setActiveView("ajustes"); setSidebarOpen(false); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            Ajustes
          </button>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userMini}>
            <div style={styles.userAvatarSmall}>{usuario.nombre?.charAt(0).toUpperCase()}</div>
            <div>
              <p style={styles.userName}>{usuario.nombre}</p>
              <p style={styles.userRole}>Analista</p>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={onLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      <main style={styles.mainContent} className="analista-main">
        {activeView === "atencion" && (
          <div style={styles.contentArea}>
            <header style={styles.header}>
              <div style={styles.headerLeft}>
                <button style={styles.menuBtn} className="analista-menu-btn" onClick={() => setSidebarOpen(true)}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </button>
                <div>
                  <h1 style={styles.headerTitle}>Centro de Atención</h1>
                  <p style={styles.headerSubtitle}>{new Date().toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
              </div>
              <div style={styles.headerRight} className="analista-header-stats">
                <div style={styles.headerStat}>
                  <span style={styles.headerStatValue}>{statsEnCola}</span>
                  <span style={styles.headerStatLabel}>En cola</span>
                </div>
                <div style={styles.headerStatDivider} />
                <div style={styles.headerStat}>
                  <span style={styles.headerStatValue}>{statsAtendidosHoy}</span>
                  <span style={styles.headerStatLabel}>Atendidos</span>
                </div>
                {statsEsperaLarga > 0 && (
                  <>
                    <div style={styles.headerStatDivider} />
                    <div style={{ ...styles.headerStat }}>
                      <span style={{ ...styles.headerStatValue, color: "#f59e0b" }}>{statsEsperaLarga}</span>
                      <span style={styles.headerStatLabel}>Esperando</span>
                    </div>
                  </>
                )}
              </div>
            </header>

            <div className="analista-content-grid">
              <div className="analista-grid-main">
                <div className="card" style={styles.attentionCard}>
                  {turnoActual && solicitudActual && estudianteActual ? (
                    <div style={styles.attentionContent}>
                      <div style={styles.attentionHeader}>
                        <div style={styles.turnoBadge}>
                          <span style={styles.turnoNumero}>#{turnoActual.id_turno}</span>
                          <span className="badge-attention">En Atención</span>
                        </div>
                        <span style={styles.waitingTime}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                          </svg>
                          {calcularTiempoEspera(turnoActual.fecha_turno, turnoActual.hora_turno)} en atención
                        </span>
                      </div>

                      <div className="analista-attention-grid">
                        <div style={styles.studentSection}>
                          <p className="section-label">Estudiante</p>
                          <h2 style={styles.studentName}>{estudianteActual.nombre}</h2>
                          <p style={styles.studentCedula}>CC {estudianteActual.cedula}</p>
                          {estudianteActual.telefono && (
                            <p style={styles.studentDetail}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.74a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92"/></svg>
                              {estudianteActual.telefono}
                            </p>
                          )}
                          {estudianteActual.direccion && (
                            <p style={styles.studentDetail}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                              {estudianteActual.direccion}
                            </p>
                          )}
                        </div>

                        <div style={styles.solicitudSection}>
                          <p className="section-label">Solicitud #{solicitudActual.id_solicitud}</p>
                          <div style={styles.solicitudDetails}>
                            <div style={styles.solicitudDetail}>
                              <span style={styles.solicitudDetailLabel}>Tipo</span>
                              <span style={styles.solicitudDetailValue}>{solicitudActual.tipo_credito === "nuevo" ? "Nuevo Crédito" : "Renovación"}</span>
                            </div>
                            <div style={styles.solicitudDetail}>
                              <span style={styles.solicitudDetailLabel}>Monto Solicitado</span>
                              <span style={{ ...styles.solicitudDetailValue, color: "#1e3a8a", fontWeight: "700", fontSize: "22px" }}>
                                {formatearCOP(solicitudActual.monto_solicitado)}
                              </span>
                            </div>
                            <div style={styles.solicitudDetail}>
                              <span style={styles.solicitudDetailLabel}>Fecha</span>
                              <span style={styles.solicitudDetailValue}>{solicitudActual.fecha_solicitud}</span>
                            </div>
                            <div style={styles.solicitudDetail}>
                              <span style={styles.solicitudDetailLabel}>Estado</span>
                              <span className={getBadgeClass(solicitudActual.estado)}>{solicitudActual.estado}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {detalleActual?.documentos && detalleActual.documentos.length > 0 && (
                        <div style={styles.docsSection}>
                          <p className="section-label">Documentos ({detalleActual.documentos.length})</p>
                          <div style={styles.docsList}>
                            {detalleActual.documentos.map((doc) => (
                              <a
                                key={doc.id_documento}
                                href={`${API_URL.replace("/api", "")}/${doc.ruta_archivo}`}
                                target="_blank"
                                rel="noreferrer"
                                className="analista-doc-link"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                                </svg>
                                <span className="analista-doc-name">{doc.nombre_archivo}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="analista-action-btns">
                        <button
                          className="btn btn-success btn-lg"
                          style={{ flex: 1, fontSize: "15px" }}
                          onClick={handleAprobar}
                          disabled={cargandoAccion}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Aprobar
                        </button>
                        <button
                          className="btn btn-danger btn-lg"
                          style={{ flex: 1, fontSize: "15px" }}
                          onClick={handleRechazar}
                          disabled={cargandoAccion}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                      <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>Sin turno en atención</h3>
                      <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "20px" }}>
                        {colaTurnos.length > 0
                          ? "Hay estudiantes en espera."
                          : "No hay turnos en la cola de espera."}
                      </p>
                      {colaTurnos.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                          <div style={styles.nextInQueue}>
                            <span style={styles.nextLabel}>Siguiente en cola:</span>
                            <span style={styles.nextTurno}>#{colaTurnos[0].id_turno}</span>
                            <span style={styles.nextSolicitud}>— Solicitud #{colaTurnos[0].id_solicitud}</span>
                          </div>
                          <button
                            className="btn btn-primary"
                            style={{ marginTop: "4px" }}
                            onClick={handleIniciarAtencion}
                            disabled={cargandoAccion}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                            Iniciar Atención
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                {colaTurnos.length > 0 && (
                  <div className="card" style={styles.queueSection}>
                    <p className="section-label" style={{ marginBottom: "16px" }}>Cola de Espera ({colaTurnos.length})</p>
                    <div className="analista-queue-scroll">
                      {colaTurnos.map((turno, i) => (
                        <div key={turno.id_turno} className={`analista-queue-card ${i === 0 ? "analista-queue-card-next" : ""}`}>
                          <div style={styles.queuePosition}>
                            {i === 0 ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            ) : (
                              <span style={styles.queuePosNum}>{i + 1}</span>
                            )}
                          </div>
                          <div style={styles.queueInfo}>
                            <span style={styles.queueTurno}>#{turno.id_turno}</span>
                            <span style={styles.queueSolicitud}>Sol. #{turno.id_solicitud}</span>
                          </div>
                          <div style={styles.queueTime}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span>{calcularTiempoEspera(turno.fecha_turno, turno.hora_turno)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="analista-side-col">
                <div className="card" style={styles.statsCard}>
                  <p className="section-label">Métricas del Día</p>
                  <div className="analista-stats-grid">
                    <div style={styles.statItem}>
                      <div style={{ ...styles.statCircle, borderColor: "#f59e0b", background: "#fef3c7" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                      </div>
                      <div>
                        <p style={styles.statValue}>{statsEnCola}</p>
                        <p style={styles.statLabel}>En espera</p>
                      </div>
                    </div>
                    <div style={styles.statItem}>
                      <div style={{ ...styles.statCircle, borderColor: "#059669", background: "#d1fae5" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      </div>
                      <div>
                        <p style={styles.statValue}>{statsAtendidosHoy}</p>
                        <p style={styles.statLabel}>Atendidos</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={styles.activityCard}>
                  <p className="section-label">Actividad Reciente</p>
                  {historial.length === 0 ? (
                    <p style={styles.noActivity}>Sin actividad hoy</p>
                  ) : (
                    <div className="analista-activity-list">
                      {historial.map((item, i) => (
                        <div key={i} style={styles.activityItem}>
                          <div style={{
                            ...styles.activityIcon,
                            background: item.solicitudEstado === "aprobado" ? "#d1fae5" : "#fee2e2",
                          }}>
                            {item.solicitudEstado === "aprobado" ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            )}
                          </div>
                          <div style={styles.activityInfo}>
                            <p style={styles.activityText}>
                              <strong>#{item.id_solicitud}</strong> {item.solicitudEstado === "aprobado" ? "aprobado" : "rechazado"}
                            </p>
                            <p style={styles.activityTime}>{item.hora_turno?.slice(0, 5)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
</div>
              </div>
            </div>
          )}

        {activeView === "ajustes" && (
          <div style={styles.ajustesContent}>
            <div className="card" style={{ maxWidth: "520px" }}>
              <h2 style={styles.cardTitleLg}>Configuración</h2>
              <div className="divider" />
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#374151", marginBottom: "8px" }}>QR de Acceso Estudiantil</h3>
              <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px", lineHeight: "1.5" }}>
                Los estudiantes pueden escanear este código QR para acceder directamente a la pantalla de identificación sin necesidad de escribir su cédula.
              </p>
              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => setShowQRModal(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
                Mostrar QR
              </button>
            </div>
          </div>
        )}

        <nav className="analista-nav-bottom" style={{ display: "none" }}>
          <button
            className={`analista-nav-item ${activeView === "atencion" ? "active" : ""}`}
            onClick={() => { setActiveView("atencion"); setSidebarOpen(false); }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            Atención
          </button>
          <button
            className={`analista-nav-item ${activeView === "ajustes" ? "active" : ""}`}
            onClick={() => { setActiveView("ajustes"); setSidebarOpen(false); }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
            Ajustes
          </button>
          <button className="analista-nav-item" onClick={onLogout}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Salir
          </button>
        </nav>
      </main>

      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          type={confirmDialog.type}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText="Cancelar"
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {showQRModal && (
        <QRModal url={`${FRONTEND_URL}/estudiante`} onClose={() => setShowQRModal(false)} />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .analista-attention-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .analista-grid-main { display: flex; flex-direction: column; gap: 20px; }
        .analista-side-col { display: flex; flex-direction: column; gap: 20px; }
        .analista-content-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; padding: 24px 28px; flex: 1; }
        .analista-stats-grid { display: flex; flex-direction: column; gap: 16px; }
        .analista-action-btns { display: flex; gap: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
        .analista-doc-link { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: #f9fafb; border-radius: 8px; text-decoration: none; color: #1f2937; font-size: 13px; border: 1px solid #e5e7eb; transition: all 0.2s; }
        .analista-doc-link:hover { background: #f3f4f6; border-color: #d1d5db; }
        .analista-doc-name { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .analista-queue-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; }
        .analista-queue-card { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 20px; background: #f9fafb; border-radius: 14px; border: 1px solid #e5e7eb; min-width: 110px; transition: all 0.2s; }
        .analista-queue-card-next { background: linear-gradient(135deg, #1e3a8a 0%, #059669 100%); border: none; color: white; }
        .analista-menu-btn { display: none; padding: 8px; border: none; background: #f3f4f6; border-radius: 10px; cursor: pointer; color: #6b7280; }
        .analista-activity-list { display: flex; flex-direction: column; gap: 12px; max-height: 320px; overflow-y: auto; }
        @media (max-width: 1200px) {
          .analista-content-grid { grid-template-columns: 1fr 280px; gap: 16px; padding: 20px 20px; }
        }
        @media (max-width: 1024px) {
          .analista-sidebar { transform: translateX(-100%); }
          .analista-sidebar.open { transform: translateX(0) !important; }
          .analista-main { margin-left: 0 !important; }
          .analista-content-grid { grid-template-columns: 1fr !important; }
          .analista-attention-grid { grid-template-columns: 1fr !important; }
          .analista-menu-btn { display: flex !important; }
          .analista-header-stats { display: none !important; }
        }
        @media (max-width: 768px) {
          .analista-sidebar { width: 260px !important; }
          .analista-content-grid { padding: 16px !important; padding-bottom: 90px !important; }
          .analista-action-btns { flex-direction: column !important; }
          .analista-attention-grid { gap: 16px !important; }
          .analista-stats-grid { flex-direction: row !important; flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    display: "flex", minHeight: "100vh", background: "#f3f4f6",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  loadingContainer: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", minHeight: "100vh", gap: "16px",
  },
  sidebar: {
    width: "268px", background: "white",
    display: "flex", flexDirection: "column",
    boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
    position: "fixed", height: "100vh", zIndex: 100,
    borderRight: "1px solid #e5e7eb",
    flexShrink: 0,
  },
  sidebarLogo: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "24px 20px", borderBottom: "1px solid #e5e7eb",
  },
  logoIcon: {
    width: "36px", height: "36px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    borderRadius: "10px", display: "flex", alignItems: "center",
    justifyContent: "center", color: "white",
    fontWeight: "bold", fontSize: "18px",
  },
  logoText: {
    fontSize: "20px", fontWeight:"800",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  analistaBadge: {
    textAlign: "center", padding: "8px", margin: "12px 20px",
    background: "#1e3a8a", color: "white", borderRadius: "8px",
    fontSize: "12px", fontWeight: "700", letterSpacing: "1px",
  },
  sidebarNav: {
    flex: 1, padding: "20px 12px",
    display: "flex", flexDirection: "column", gap: "4px",
  },
  navItem: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "12px 16px", borderRadius: "10px", border: "none",
    background: "transparent", color: "#6b7280", fontSize: "14px",
    fontWeight: "500", cursor: "pointer", transition: "all 0.2s",
    width: "100%", textAlign: "left",
  },
  navActive: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "12px 16px", borderRadius: "10px", border: "none",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    color: "white", fontSize: "14px", fontWeight: "500",
    cursor: "pointer", width: "100%", textAlign: "left",
  },
  sidebarFooter: {
    padding: "20px", borderTop: "1px solid #e5e7eb",
  },
  userMini: {
    display: "flex", alignItems: "center", gap: "10px",
    marginBottom: "12px",
  },
  userAvatarSmall: {
    width: "36px", height: "36px", borderRadius: "10px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "white", fontWeight: "bold", fontSize: "14px",
  },
  userName: {
    fontSize: "14px", fontWeight: "600", color: "#1f2937",
  },
  userRole: {
    fontSize: "12px", color: "#9ca3af",
  },
  logoutBtn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "8px", width: "100%", padding: "10px",
    borderRadius: "10px", border: "2px solid #dc2626",
    background: "transparent", color: "#dc2626", fontSize: "13px",
    fontWeight: "600", cursor: "pointer", transition: "all 0.2s",
  },
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.4)", zIndex: 99,
  },
  mainContent: {
    flex: 1, marginLeft: "268px", display: "flex", flexDirection: "column",
    minHeight: "100vh",
  },
  contentArea: {
    display: "flex", flexDirection: "column", flex: 1,
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 28px", background: "white",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    borderBottom: "1px solid #e5e7eb",
  },
  headerLeft: {
    display: "flex", alignItems: "center", gap: "16px",
  },
  menuBtn: {
    display: "none", padding: "8px", border: "none",
    background: "#f3f4f6", borderRadius: "10px",
    cursor: "pointer", color: "#6b7280",
  },
  headerTitle: {
    fontSize: "22px", fontWeight: "700", color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: "13px", color: "#9ca3af", textTransform: "capitalize",
  },
  headerRight: {
    display: "flex", alignItems: "center", gap: "8px",
  },
  headerStat: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "0 12px",
  },
  headerStatValue: {
    fontSize: "20px", fontWeight: "700", color: "#1f2937",
  },
  headerStatLabel: {
    fontSize: "11px", color: "#9ca3af", fontWeight: "500",
  },
  headerStatDivider: {
    width: "1px", height: "28px", background: "#e5e7eb",
  },
  grid: {
    display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px",
    padding: "24px 28px", flex: 1,
  },
  mainColumn: {
    display: "flex", flexDirection: "column", gap: "20px",
  },
  attentionCard: {
    padding: "28px", minHeight: "320px",
    background: "white", borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  attentionContent: {
    display: "flex", flexDirection: "column", gap: "20px",
    animation: "fadeIn 0.4s ease",
  },
  attentionHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    flexWrap: "wrap", gap: "12px",
  },
  turnoBadge: {
    display: "flex", alignItems: "center", gap: "12px",
  },
  turnoNumero: {
    fontSize: "28px", fontWeight: "800",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  waitingTime: {
    display: "flex", alignItems: "center", gap: "4px",
    fontSize: "13px", color: "#9ca3af",
  },
  attentionGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px",
  },
  studentSection: {
    paddingRight: "24px",
    borderRight: "1px solid #e5e7eb",
  },
  studentName: {
    fontSize: "20px", fontWeight: "700", color: "#1f2937",
    marginBottom: "2px",
  },
  studentCedula: {
    fontSize: "14px", color: "#6b7280", marginBottom: "12px",
  },
  studentDetail: {
    display: "flex", alignItems: "center", gap: "6px",
    fontSize: "13px", color: "#6b7280", marginBottom: "6px",
  },
  solicitudSection: {},
  solicitudDetails: {
    display: "flex", flexDirection: "column", gap: "12px",
  },
  solicitudDetail: {
    display: "flex", flexDirection: "column", gap: "2px",
  },
  solicitudDetailLabel: {
    fontSize: "11px", fontWeight: "600", textTransform: "uppercase",
    letterSpacing: "0.5px", color: "#9ca3af",
  },
  solicitudDetailValue: {
    fontSize: "15px", fontWeight: "500", color: "#374151",
  },
  docsSection: {
    borderTop: "1px solid #e5e7eb", paddingTop: "20px",
  },
  docsList: {
    display: "flex", flexWrap: "wrap", gap: "10px",
  },
  docItem: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "8px 14px", background: "#f9fafb",
    borderRadius: "8px", textDecoration: "none",
    color: "#1f2937", fontSize: "13px",
    border: "1px solid #e5e7eb", transition: "all 0.2s",
  },
  docName: {
    maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  actionButtons: {
    display: "flex", gap: "12px",
    borderTop: "1px solid #e5e7eb", paddingTop: "20px",
  },
  nextInQueue: {
    display: "flex", alignItems: "center", gap: "8px",
    justifyContent: "center", flexWrap: "wrap",
  },
  nextLabel: {
    fontSize: "13px", color: "#9ca3af",
  },
  nextTurno: {
    fontSize: "16px", fontWeight: "700",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  nextSolicitud: {
    fontSize: "13px", color: "#6b7280",
  },
  queueSection: {
    padding: "20px 24px",
  },
  queueScroll: {
    display: "flex", gap: "12px", overflowX: "auto",
    paddingBottom: "4px",
  },
  queueCard: {
    flexShrink: 0, display: "flex", flexDirection: "column",
    alignItems: "center", gap: "8px", padding: "16px 20px",
    background: "#f9fafb", borderRadius: "14px",
    border: "1px solid #e5e7eb", minWidth: "110px",
    transition: "all 0.2s",
  },
  queueCardNext: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    border: "none", color: "white",
  },
  queuePosition: {
    display: "flex", alignItems: "center", justifyContent: "center",
    width: "28px", height: "28px",
  },
  queuePosNum: {
    fontSize: "13px", fontWeight: "700", color: "#6b7280",
  },
  queueInfo: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
  },
  queueTurno: {
    fontSize: "16px", fontWeight: "800", color: "#1f2937",
  },
  queueSolicitud: {
    fontSize: "11px", color: "#9ca3af",
  },
  queueTime: {
    display: "flex", alignItems: "center", gap: "3px",
    fontSize: "11px", color: "#9ca3af",
  },
  sideColumn: {
    display: "flex", flexDirection: "column", gap: "20px",
  },
  statsCard: {
    padding: "20px",
  },
  statsGrid: {
    display: "flex", flexDirection: "column", gap: "16px",
  },
  statItem: {
    display: "flex", alignItems: "center", gap: "14px",
  },
  statCircle: {
    width: "44px", height: "44px", borderRadius: "12px",
    border: "2px solid", display: "flex", alignItems: "center",
    justifyContent: "center", flexShrink: 0,
  },
  statValue: {
    fontSize: "24px", fontWeight: "700", color: "#1f2937",
  },
  statLabel: {
    fontSize: "12px", color: "#9ca3af",
  },
  activityCard: {
    padding: "20px",
  },
  noActivity: {
    fontSize: "13px", color: "#9ca3af", textAlign: "center",
    padding: "20px 0",
  },
  activityList: {
    display: "flex", flexDirection: "column", gap: "12px",
    maxHeight: "320px", overflowY: "auto",
  },
  activityItem: {
    display: "flex", alignItems: "center", gap: "10px",
  },
  activityIcon: {
    width: "28px", height: "28px", borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  activityInfo: {
    display: "flex", justifyContent: "space-between", width: "100%",
  },
  activityText: {
    fontSize: "13px", color: "#374151",
  },
  activityTime: {
    fontSize: "12px", color: "#9ca3af",
  },
  ajustesContent: {
    padding: "28px", display: "flex", justifyContent: "center",
  },
  cardTitleLg: {
    fontSize: "20px", fontWeight: "700", color: "#1f2937",
    marginBottom: "16px",
  },
};