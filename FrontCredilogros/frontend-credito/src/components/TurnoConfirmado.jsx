import { useState, useEffect } from "react";
import { API_URL } from "../config";
import { formatearCOP } from "../utils/formatoMoneda";

export default function TurnoConfirmado({ data }) {
  const { solicitud, turno, estudiante } = data;
  const [posicionCola, setPosicionCola] = useState(null);
  const [turnoActual, setTurnoActual] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const fetchPosicion = async () => {
    try {
      const resCola = await fetch(`${API_URL}/turnos/cola`);
      const cola = await resCola.json();
      
      const pendientes = cola.filter(t => t.estado === "pendiente");
      const index = pendientes.findIndex(t => t.id_turno === turno?.id_turno);
      setPosicionCola(index !== -1 ? index + 1 : null);

      const resActual = await fetch(`${API_URL}/turnos/?estado=en atención`);
      const turnoActualData = await resActual.json();
      setTurnoActual(turnoActualData[0] || null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosicion();
    const intervalo = setInterval(fetchPosicion, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const handleArchivo = (e) => {
    setArchivo(e.target.files[0]);
    setMensaje("");
  };

  const handleSubir = async () => {
    if (!archivo) {
      setMensaje("Selecciona un archivo primero");
      return;
    }

    setSubiendo(true);
    setMensaje("");

    const formData = new FormData();
    formData.append("file", archivo);
    formData.append("id_solicitud", solicitud?.id_solicitud);

    try {
      const res = await fetch(`${API_URL}/documentos/`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMensaje("Archivo subido correctamente");
        setArchivo(null);
      } else {
        setMensaje("Error al subir archivo");
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error de conexión");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card} className="fade-in">
        <div style={styles.successIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <h1 style={styles.title}>¡Solicitud Enviada!</h1>
        <p style={styles.subtitle}>Tu crédito ha sido registrado correctamente</p>

        <div style={styles.turnoBox}>
          <div style={styles.turnoMain}>
            <p style={styles.turnoLabel}>Tu Turno</p>
            <p style={styles.turnoNumber}>#{turno?.id_turno || "—"}</p>
          </div>
          
          {posicionCola && (
            <div style={styles.posicionBox}>
              <p style={styles.posicionLabel}>Posición en cola</p>
              <p style={styles.posicionNumber}>#{posicionCola}</p>
            </div>
          )}
        </div>

        <div style={styles.infoCard}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Nombre:</span>
            <span style={styles.infoValue}>{estudiante?.nombre}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Cédula:</span>
            <span style={styles.infoValue}>{estudiante?.cedula}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Tipo:</span>
            <span style={styles.infoValue}>Nuevo Crédito</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Monto:</span>
            <span style={styles.infoValue}>{formatearCOP(solicitud?.monto_solicitado)}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Fecha:</span>
            <span style={styles.infoValue}>{solicitud?.fecha_solicitud}</span>
          </div>
        </div>

        <div style={styles.atencionBox}>
          <p style={styles.atencionLabel}>Turno en Atención</p>
          <p style={styles.atencionActual}>
            {turnoActual ? `#${turnoActual.id_turno}` : "—"}
          </p>
        </div>

        <p style={styles.atencionMsg}>
          Por favor espera tu turno. Cuando sea tu turno, el analista te atenderá.
        </p>

        <div style={styles.uploadSection}>
          <p style={styles.uploadTitle}>Subir Documentos</p>
          <p style={styles.uploadDesc}>Sube tus documentos de identificación</p>
          
          <input
            type="file"
            id="archivo"
            onChange={handleArchivo}
            style={styles.fileInput}
          />
          
          {archivo && (
            <p style={styles.fileName}>Seleccionado: {archivo.name}</p>
          )}

          <button 
            style={subiendo ? styles.uploadBtnLoading : styles.uploadBtn} 
            onClick={handleSubir}
            disabled={subiendo}
          >
            {subiendo ? "Subiendo..." : "Subir Archivo"}
          </button>

          {mensaje && (
            <p style={mensaje.includes("correctamente") ? styles.msgSuccess : styles.msgError}>
              {mensaje}
            </p>
          )}
        </div>
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
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "white",
    padding: "32px 24px",
    borderRadius: "20px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    textAlign: "center",
  },
  successIcon: {
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "24px",
  },
  turnoBox: {
    display: "flex",
    gap: "16px",
    marginBottom: "20px",
  },
  turnoMain: {
    flex: 1,
    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
    borderRadius: "16px",
    padding: "20px",
    color: "white",
  },
  turnoLabel: {
    fontSize: "13px",
    opacity: 0.9,
    marginBottom: "4px",
  },
  turnoNumber: {
    fontSize: "36px",
    fontWeight: "800",
  },
  posicionBox: {
    flex: 1,
    background: "#fef3c7",
    borderRadius: "16px",
    padding: "20px",
    color: "#92400e",
  },
  posicionLabel: {
    fontSize: "13px",
    marginBottom: "4px",
  },
  posicionNumber: {
    fontSize: "36px",
    fontWeight: "800",
  },
  infoCard: {
    background: "#f9fafb",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "20px",
    textAlign: "left",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  infoLabel: {
    color: "#6b7280",
    fontSize: "14px",
  },
  infoValue: {
    color: "#1f2937",
    fontWeight: "500",
    fontSize: "14px",
  },
  atencionBox: {
    background: "#f0fdf4",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "16px",
  },
  atencionLabel: {
    color: "#059669",
    fontSize: "13px",
    marginBottom: "4px",
  },
  atencionActual: {
    color: "#059669",
    fontSize: "28px",
    fontWeight: "700",
  },
  atencionMsg: {
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "24px",
  },
  msgSuccess: {
    color: "#059669",
    fontSize: "14px",
    marginTop: "12px",
  },
  msgError: {
    color: "#991b1b",
    fontSize: "14px",
    marginTop: "12px",
  },
  uploadSection: {
    background: "#f9fafb",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    textAlign: "center",
  },
  uploadTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "4px",
  },
  uploadDesc: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "16px",
  },
  fileInput: {
    display: "block",
    margin: "0 auto 12px",
  },
  fileName: {
    fontSize: "13px",
    color: "#059669",
    marginBottom: "12px",
  },
  uploadBtn: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  uploadBtnLoading: {
    padding: "12px 24px",
    background: "#9ca3af",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "not-allowed",
    fontWeight: "600",
    fontSize: "14px",
  },
};
