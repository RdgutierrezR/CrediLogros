import { useEffect } from "react";

export default function ConfirmDialog({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, type }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const iconMap = {
    approve: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    reject: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    advance: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
  };

  const colorMap = {
    approve: "#059669",
    reject: "#dc2626",
    advance: "#1e3a8a",
  };

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={styles.iconWrapper}>{iconMap[type] || iconMap.approve}</div>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.message}>{message}</p>
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onCancel}>
            {cancelText || "Cancelar"}
          </button>
          <button
            style={{ ...styles.confirmBtn, background: colorMap[type] || "#1e3a8a" }}
            onClick={onConfirm}
          >
            {confirmText || "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0, 0, 0, 0.5)", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 2000,
    backdropFilter: "blur(4px)",
    animation: "fadeIn 0.2s ease",
  },
  dialog: {
    background: "white", borderRadius: "20px", width: "90%", maxWidth: "420px",
    padding: "40px 32px", textAlign: "center",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    animation: "fadeInScale 0.2s ease",
  },
  iconWrapper: {
    width: "72px", height: "72px", borderRadius: "50%",
    background: "#f9fafb", display: "flex", alignItems: "center",
    justifyContent: "center", margin: "0 auto 20px",
  },
  title: {
    fontSize: "20px", fontWeight: "700", color: "#1f2937", marginBottom: "12px",
  },
  message: {
    fontSize: "15px", color: "#6b7280", lineHeight: "1.6", marginBottom: "28px",
  },
  actions: {
    display: "flex", gap: "12px", justifyContent: "center",
  },
  cancelBtn: {
    flex: 1, padding: "12px 20px", borderRadius: "12px",
    border: "2px solid #e5e7eb", background: "transparent",
    color: "#6b7280", fontSize: "14px", fontWeight: "600",
    cursor: "pointer", transition: "all 0.2s",
  },
  confirmBtn: {
    flex: 1, padding: "12px 20px", borderRadius: "12px",
    border: "none", color: "white", fontSize: "14px",
    fontWeight: "600", cursor: "pointer", transition: "all 0.2s",
  },
};