import { useState } from "react";
import Login from "./components/Login";
import DashboardEstudiante from "./components/DashboardEstudiante";
import DashboardAnalista from "./components/DashboardAnalista";

export default function App() {
  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario")) || null
  );

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  if (!usuario) return <Login onLogin={setUsuario} />;

  if (usuario.rol_id === 1)
    return <DashboardEstudiante usuario={usuario} onLogout={handleLogout} />;
  if (usuario.rol_id === 2)
    return <DashboardAnalista usuario={usuario} onLogout={handleLogout} />;

  return <div>Rol no reconocido</div>;
}
