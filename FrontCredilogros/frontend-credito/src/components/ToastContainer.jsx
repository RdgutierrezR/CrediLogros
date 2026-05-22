import { useEffect, useState } from "react";

let toastInstance = null;

export function showToast(message, type = "success", duration = 4000) {
  if (toastInstance) {
    toastInstance({ message, type, duration });
  }
}

export default function ToastContainer({ onMount }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastInstance = ({ message, type, duration }) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };
    if (onMount) onMount(toastInstance);
  }, [onMount]);

  const iconMap = {
    success: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    error: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    warning: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    info: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  };

  const bgMap = {
    success: { bg: "#d1fae5", border: "#059669" },
    error: { bg: "#fee2e2", border: "#dc2626" },
    warning: { bg: "#fef3c7", border: "#f59e0b" },
    info: { bg: "#dbeafe", border: "#1e3a8a" },
  };

  return (
    <div style={styles.container}>
      {toasts.map((toast, i) => (
        <div
          key={toast.id}
          style={{
            ...styles.toast,
            background: bgMap[toast.type]?.bg || bgMap.info.bg,
            borderLeft: `4px solid ${bgMap[toast.type]?.border || bgMap.info.border}`,
          }}
        >
          <span style={styles.icon}>{iconMap[toast.type] || iconMap.info}</span>
          <span style={styles.message}>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed", bottom: "24px", right: "24px", zIndex: 3000,
    display: "flex", flexDirection: "column", gap: "10px",
    pointerEvents: "none",
  },
  toast: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "14px 20px", borderRadius: "12px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    animation: "slideUp 0.3s ease",
    minWidth: "280px", maxWidth: "380px",
    pointerEvents: "auto",
  },
  icon: {
    flexShrink: 0, display: "flex", alignItems: "center",
  },
  message: {
    fontSize: "14px", fontWeight: "500", color: "#1f2937",
  },
};