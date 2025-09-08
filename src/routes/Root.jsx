// src/routes/Root.jsx
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const Root = () => {
  const token = Cookies.get("token");

  // Si hay un token, redirige a la página principal de la app (ej. /home)
  // Si no hay token, redirige al login
  return token ? (
    <Navigate to="/home" replace />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default Root;
