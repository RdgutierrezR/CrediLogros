import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import DashboardEstudiante from "./components/DashboardEstudiante";
import DashboardAnalista from "./components/DashboardAnalista";
import IdentificacionEstudiante from "./components/IdentificacionEstudiante";
import SolicitudCredito from "./components/SolicitudCredito";
import TurnoConfirmado from "./components/TurnoConfirmado";
import { API_URL } from "./config";

console.log("App.jsx cargado");

async function buscarTurnoActivo(idEstudiante) {
  try {
    const res = await fetch(`${API_URL}/solicitudes`);
    const solicitudes = await res.json();
    
    console.log("Solicitudes:", solicitudes);
    console.log("Buscando para id_estudiante:", idEstudiante);
    
    const solActiva = solicitudes.find(s => 
      parseInt(s.id_estudiante) === parseInt(idEstudiante) && 
      (s.estado === "pendiente" || s.estado === "en estudio")
    );
    
    console.log("Solicitud activa encontrada:", solActiva);
    
    if (solActiva) {
      const resTurnos = await fetch(`${API_URL}/turnos/`);
      const turnos = await resTurnos.json();
      
      console.log("Turnos:", turnos);
      
      const turnoActivo = turnos.find(t => 
        t.id_solicitud === solActiva.id_solicitud &&
        (t.estado === "pendiente" || t.estado === "en atención")
      );
      
      console.log("Turno activo encontrado:", turnoActivo);
      
      if (turnoActivo) {
        return { solicitud: solActiva, turno: turnoActivo };
      }
    }
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

function FlujoEstudiante() {
  const [estudiante, setEstudiante] = useState(null);
  const [dataSolicitud, setDataSolicitud] = useState(null);
  const [buscandoTurno, setBuscandoTurno] = useState(false);

  const handleIdentificado = async (est) => {
    setEstudiante(est);
    setBuscandoTurno(true);
    
    const dataTurno = await buscarTurnoActivo(est.id_estudiante);
    
    if (dataTurno) {
      setDataSolicitud({
        solicitud: dataTurno.solicitud,
        turno: dataTurno.turno,
        estudiante: est
      });
    }
    setBuscandoTurno(false);
  };

  const handleSolicitudCreada = (data) => {
    setDataSolicitud({ ...data, estudiante });
  };

  if (buscandoTurno) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        background: "linear-gradient(135deg, #1e3a8a 0%, #059669 100%)"
      }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            border: "3px solid rgba(255,255,255,0.3)",
            borderTopColor: "white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }}></div>
          <p>Verificando turno activo...</p>
        </div>
      </div>
    );
  }

  if (dataSolicitud) {
    return <TurnoConfirmado data={dataSolicitud} />;
  }

  if (estudiante) {
    return <SolicitudCredito estudiante={estudiante} onSolicitudCreada={handleSolicitudCreada} />;
  }

  return <IdentificacionEstudiante onIdentificado={handleIdentificado} />;
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("usuario");
    if (stored) {
      try {
        setUsuario(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("usuario");
      }
    }
    setCargando(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  const handleLogin = (user) => {
    localStorage.setItem("usuario", JSON.stringify(user));
    setUsuario(user);
  };

  if (cargando) {
    return null;
  }

  return (
    <Routes>
      <Route path="/login" element={
        usuario ? (usuario.rol_id === 2 ? <Navigate to="/" /> : <Navigate to="/" />) : <Login onLogin={handleLogin} />
      } />
      <Route path="/estudiante" element={<FlujoEstudiante />} />
      <Route path="/" element={
        !usuario ? <Login onLogin={handleLogin} /> :
        usuario.rol_id === 2 ? <DashboardAnalista usuario={usuario} onLogout={handleLogout} /> :
        <DashboardEstudiante usuario={usuario} onLogout={handleLogout} />
      } />
    </Routes>
  );
}
