import { useState, useRef, useEffect } from "react";
import { API_URL } from "../config";

export default function ChatFlotante() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (abierto && mensajes.length === 0) {
      setMensajes([
        { remitente: "bot", texto: "Hola 👋 soy el asistente de Credilogros. Puedo ayudarte con:\n- Tipos de crédito\n- Requisitos\n- Tasas de interés\n- Plazos\n- Montos" }
      ]);
    }
  }, [abierto]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  const agregarMensaje = (remitente, texto) => {
    setMensajes((prev) => [...prev, { remitente, texto }]);
  };

  const enviarMensaje = async () => {
    if (!input.trim()) return;
    if (loading) return;

    const mensajeUsuario = input.trim();
    setInput("");
    agregarMensaje("usuario", mensajeUsuario);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: mensajeUsuario })
      });
      const data = await res.json();
      agregarMensaje("bot", data.respuesta || "No entendí tu mensaje");
    } catch {
      agregarMensaje("bot", "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      enviarMensaje();
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.botonFlotante} onClick={() => setAbierto(!abierto)}>
        {abierto ? "✕" : "💬"}
      </button>

      {abierto && (
        <div style={styles.panelChat}>
          <div style={styles.headerChat}>
            <span>Asistente Credilogros</span>
            <button style={styles.btnCerrar} onClick={() => setAbierto(false)}>✕</button>
          </div>

          <div style={styles.mensajes} ref={chatRef}>
            {mensajes.map((msg, index) => (
              <div
                key={index}
                style={msg.remitente === "usuario" ? styles.mensajeUsuario : styles.mensajeBot}
              >
                <span style={msg.remitente === "usuario" ? styles.textoUsuario : styles.textoBot}>
                  {msg.texto}
                </span>
              </div>
            ))}
            {loading && (
              <div style={styles.mensajeBot}>
                <span style={styles.textoBot}>Escribiendo...</span>
              </div>
            )}
          </div>

          <div style={styles.inputContainer}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              style={styles.input}
              disabled={loading}
            />
            <button style={styles.btnEnviar} onClick={enviarMensaje} disabled={loading || !input.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
  },
  botonFlotante: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s",
  },
  panelChat: {
    position: "absolute",
    bottom: "70px",
    right: "0",
    width: "350px",
    height: "450px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  headerChat: {
    padding: "16px",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "600",
  },
  btnCerrar: {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
  },
  mensajes: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    background: "#f9fafb",
  },
  mensajeUsuario: {
    display: "flex",
    justifyContent: "flex-end",
  },
  mensajeBot: {
    display: "flex",
    justifyContent: "flex-start",
  },
  textoUsuario: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    color: "white",
    padding: "10px 14px",
    borderRadius: "16px 16px 4px 16px",
    maxWidth: "80%",
    fontSize: "14px",
    wordBreak: "break-word",
  },
  textoBot: {
    background: "#e5e7eb",
    color: "#1f2937",
    padding: "10px 14px",
    borderRadius: "16px 16px 16px 4px",
    maxWidth: "80%",
    fontSize: "14px",
    wordBreak: "break-word",
  },
  inputContainer: {
    padding: "12px",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: "8px",
    background: "white",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "24px",
    border: "2px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
  },
  btnEnviar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};