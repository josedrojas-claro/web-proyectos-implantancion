// src/routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const PrivateRoute = ({ children }) => {
  const token = Cookies.get("token");
  return token ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
