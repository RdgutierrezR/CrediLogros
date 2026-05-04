import { useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";
export default function Login({ onLogin }) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.mensaje || "Credenciales incorrectas");
        setCargando(false);
        return;
      }
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      onLogin(data.usuario);
    } catch (err) {
      console.error(err);
      setError("Error de conexión");
      setCargando(false);
    }
  };
  return (
    <div style={styles.wrapper}>
      <div style={styles.backgroundPattern}></div>
      <div style={styles.card} className="fade-in">
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 style={styles.title}>CrediLogros</h1>
          <p style={styles.subtitle}>Sistema de Gestión de Créditos</p>
        </div>
        <h2 style={styles.formTitle}>Ingreso Analistas</h2>
        {error && (
          <div style={styles.errorBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo electrónico</label>
            <div style={styles.inputWrapper}>
              <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputWrapper}>
              <svg style={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type="password"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
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
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Iniciar Sesión
              </>
            )}
          </button>
        </form>
        <Link to="/estudiante" style={styles.qrBtnLink}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
          </svg>
          Acceder como Estudiante (QR)
        </Link>
      </div>
    </div>
  );
}
const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
  },
  backgroundPattern: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    background: "white",
    padding: "40px 32px",
    borderRadius: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    position: "relative",
    zIndex: 1, 
    background: "white",
    padding: "40px 32px",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logoIcon: {
    width: "72px",
    height: "72px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    boxShadow: "0 10px 20px rgba(30, 58, 138, 0.3)",
  },
  title: {
    fontSize: "28px",
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
  formTitle: {
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "24px",
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  inputGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
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
    transition: "all 0.3s ease",
    background: "#f9fafb",
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
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s ease",
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
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  qrBtn: {
    marginTop: "24px",
    padding: "14px",
    background: "#f0fdf4",
    color: "#059669",
    border: "2px solid #059669",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  qrBtnLink: {
    marginTop: "24px",
    padding: "14px",
    background: "#f0fdf4",
    color: "#059669",
    border: "2px solid #059669",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "15px",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    textDecoration: "none",
  },
};