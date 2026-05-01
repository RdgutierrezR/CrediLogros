import { useState } from "react";
import { API_URL } from "../config";
import { formatearCOP, parsearCOP } from "../utils/formatoMoneda";
import ChatFlotante from "./ChatFlotante";

export default function SolicitudCredito({ estudiante, onSolicitudCreada }) {
  const [tipoCredito, setTipoCredito] = useState("");
  const [monto, setMonto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleSolicitar = async (e) => {
    e.preventDefault();
    
    if (!tipoCredito) {
      setError("Selecciona el tipo de crédito");
      return;
    }
    if (!monto || parseInt(parsearCOP(monto)) <= 0) {
      setError("Ingresa un monto válido");
      return;
    }

    setError("");
    setCargando(true);

    try {
      const res = await fetch(`${API_URL}/solicitudes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_estudiante: parseInt(estudiante.id_estudiante),
          fecha_solicitud: new Date().toISOString().split("T")[0],
          estado: "pendiente",
          monto_solicitado: parseInt(parsearCOP(monto)),
          monto_aprobado: null,
          tipo_credito: tipoCredito,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        const solicitud = data.solicitud || data;
        
        const resTurno = await fetch(`${API_URL}/turnos/`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            id_solicitud: parseInt(solicitud.id_solicitud),
            fecha_turno: new Date().toISOString().split("T")[0],
            hora_turno: new Date().toTimeString().split(" ")[0].slice(0, 5) + ":00",
            estado: "pendiente",
          }),
        });
        
        let turno = null;
        if (resTurno.ok) {
          turno = await resTurno.json();
        }

        onSolicitudCreada({ solicitud, turno });
      } else {
        setError(data.error || "Error al crear solicitud");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <div style={styles.wrapper}>
      <div style={styles.card} className="fade-in">
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={styles.title}>CrediLogros</h1>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {estudiante.nombre?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={styles.userName}>{estudiante.nombre}</p>
            <p style={styles.userCedula}>Cédula: {estudiante.cedula}</p>
          </div>
        </div>

        <form onSubmit={handleSolicitar} style={styles.form}>
          <h2 style={styles.formTitle}>Nueva Solicitud</h2>
          
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tipo de Crédito</label>
            <div style={styles.selectWrapper}>
              <svg style={styles.selectIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              <select
                value={tipoCredito}
                onChange={(e) => setTipoCredito(e.target.value)}
                style={styles.select}
                required
              >
                <option value="">Selecciona tipo de crédito</option>
                <option value="nuevo">Nuevo Crédito</option>
                <option value="renovacion">Renovación de Crédito</option>
              </select>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Monto a Solicitar ($)</label>
            <div style={styles.inputWrapper}>
              <svg style={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <input
                type="text"
                inputMode="numeric"
                placeholder="$500000"
                value={monto}
                onChange={(e) => setMonto(formatearCOP(parsearCOP(e.target.value)))}
                style={styles.input}
                required
              />
            </div>
          </div>

          <button type="submit" style={cargando ? styles.buttonLoading : styles.button} disabled={cargando}>
            {cargando ? (
              <div style={styles.spinner}></div>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Confirmar Solicitud
              </>
            )}
          </button>
        </form>
      </div>
    </div>
    <ChatFlotante />
    </>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "white",
    padding: "32px 24px",
    borderRadius: "20px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "20px",
  },
  logoIcon: {
    width: "50px",
    height: "50px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 10px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    background: "#f0fdf4",
    borderRadius: "12px",
    marginBottom: "20px",
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
  userName: {
    fontWeight: "600",
    color: "#1f2937",
    fontSize: "15px",
  },
  userCedula: {
    color: "#6b7280",
    fontSize: "13px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formTitle: {
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    textAlign: "center",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontWeight: "500",
    color: "#374151",
    fontSize: "14px",
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  },
  selectWrapper: {
    position: "relative",
  },
  selectIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "14px 14px 14px 44px",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    fontSize: "16px",
    transition: "all 0.3s",
    background: "#f9fafb",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "14px 14px 14px 44px",
    borderRadius: "12px",
    border: "2px solid #e5e7eb",
    fontSize: "16px",
    transition: "all 0.3s",
    background: "#f9fafb",
    boxSizing: "border-box",
    appearance: "none",
    cursor: "pointer",
  },
  button: {
    padding: "14px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  buttonLoading: {
    padding: "14px",
    background: "#9ca3af",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    cursor: "not-allowed",
    fontWeight: "600",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};
