import { useState } from "react";
import { API_URL } from "../config";
import ChatFlotante from "./ChatFlotante";

export default function IdentificacionEstudiante({ onIdentificado }) {
  const [cedula, setCedula] = useState("");
  const [mostrarRegistro, setMostrarRegistro] = useState(false);
  const [, setEstudiante] = useState(null);
  const [formRegistro, setFormRegistro] = useState({
    nombre: "",
    telefono: "",
    direccion: "",
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!cedula.trim()) {
      setError("Ingresa tu número de cédula");
      return;
    }
    setError("");
    setCargando(true);

    try {
      const res = await fetch(`${API_URL}/estudiantes/`);
      const data = await res.json();
      
      const estudiante = data.find(e => e.cedula === cedula.trim());
      
      if (estudiante) {
        setEstudiante(estudiante);
        onIdentificado(estudiante);
      } else if (res.ok) {
        setMostrarRegistro(true);
      } else {
        setError(data.error || "Error al buscar estudiante");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
    } finally {
      setCargando(false);
    }
  };

  const handleRegistrar = async (e) => {
    e.preventDefault();
    if (!formRegistro.nombre || !formRegistro.telefono || !formRegistro.direccion) {
      setError("Completa todos los campos");
      return;
    }
    setError("");
    setCargando(true);

    try {
      const res = await fetch(`${API_URL}/estudiantes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: cedula.trim(),
          nombre: formRegistro.nombre,
          telefono: formRegistro.telefono,
          direccion: formRegistro.direccion,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setEstudiante(data);
        onIdentificado(data);
      } else {
        setError(data.error || "Error al registrar");
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
          <p style={styles.subtitle}>Identificación Estudiantil</p>
        </div>

        {!mostrarRegistro ? (
          <form onSubmit={handleBuscar} style={styles.form}>
            <h2 style={styles.formTitle}>Ingresa tu Cédula</h2>
            <p style={styles.formDesc}>Para identificar tu crédito en el sistema</p>
            
            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.inputGroup}>
              <div style={styles.inputWrapper}>
                <svg style={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2"/>
                  <line x1="7" y1="8" x2="17" y2="8"/>
                  <line x1="7" y1="12" x2="17" y2="12"/>
                  <line x1="7" y1="16" x2="13" y2="16"/>
                </svg>
                <input
                  type="text"
                  placeholder="Número de cédula"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
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
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Buscar
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegistrar} style={styles.form}>
            <h2 style={styles.formTitle}>Registro Rápido</h2>
            <p style={styles.formDesc}>No encontramos tu registro. Completa tus datos</p>
            
            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Nombre completo</label>
              <input
                type="text"
                placeholder="Tu nombre completo"
                value={formRegistro.nombre}
                onChange={(e) => setFormRegistro({ ...formRegistro, nombre: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Teléfono</label>
              <input
                type="tel"
                placeholder="Tu número de teléfono"
                value={formRegistro.telefono}
                onChange={(e) => setFormRegistro({ ...formRegistro, telefono: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Dirección</label>
              <input
                type="text"
                placeholder="Tu dirección"
                value={formRegistro.direccion}
                onChange={(e) => setFormRegistro({ ...formRegistro, direccion: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <button type="submit" style={cargando ? styles.buttonLoading : styles.button} disabled={cargando}>
              {cargando ? (
                <div style={styles.spinner}></div>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="8.5" cy="7" r="4"/>
                    <line x1="20" y1="8" x2="20" y2="14"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                  </svg>
                  Registrame y Continuar
                </>
              )}
            </button>

            <button type="button" style={styles.backBtn} onClick={() => { setMostrarRegistro(false); setError(""); }}>
              ← Volver a buscar
            </button>
          </form>
        )}
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
    marginBottom: "24px",
  },
  logoIcon: {
    width: "60px",
    height: "60px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "4px",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
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
    marginBottom: "4px",
  },
  formDesc: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "8px",
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
  backBtn: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "14px",
    cursor: "pointer",
    padding: "8px",
  },
};
