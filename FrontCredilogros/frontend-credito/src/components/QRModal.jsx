import QRCode from "react-qr-code";

export default function QRModal({ url, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>QR de Acceso Estudiantil</h2>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={styles.body}>
          <p style={styles.description}>
            Los estudiantes pueden escanear este código QR para acceder directamente a la pantalla de identificación.
          </p>
          <div style={styles.qrContainer}>
            <QRCode value={url} size={200} level={"H"} />
          </div>
          <p style={styles.urlText}>{url}</p>
        </div>
        <div style={styles.footer}>
          <button style={styles.closeModalBtn} onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "420px",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
  },
  closeBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "none",
    background: "#f3f4f6",
    fontSize: "24px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
  },
  body: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  description: {
    fontSize: "14px",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "20px",
  },
  qrContainer: {
    padding: "20px",
    background: "white",
    borderRadius: "16px",
    border: "2px solid #e5e7eb",
    marginBottom: "16px",
  },
  urlText: {
    fontSize: "12px",
    color: "#9ca3af",
    wordBreak: "break-all",
    textAlign: "center",
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
  },
  closeModalBtn: {
    padding: "10px 20px",
    background: "#6b7280",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
    cursor: "pointer",
  },
};