import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./Login.css";
import { login } from "../../services/authServices";
import logoClaro from "../../assets/logoClaro.png";
import { Alert, Snackbar } from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  // mostrar o no login
  const togglePassword = () => setShowPass(!showPass);
  // alert
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("info"); // "success" | "error" | "warning" | "info"

  // Navegar
  const navigate = useNavigate();

  // loading
  const [loading, setLoading] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") return;
    setAlertOpen(false);
  };

  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      console.log(response.data);
      setAlertType("success");
      setAlertMsg(`Bienvenido ${response.data.User?.UserData.nombre}`);
      setAlertOpen(true);
      setLoading(true); // ← activa el bloqueador

      setTimeout(() => {
        navigate("/home", { replace: true }); // ← reemplaza el historial (borra /login)
      }, 1500); // opcional, si quieres mostrar el mensaje 1.5s antes de navegar
    } catch (err) {
      console.error("Error:", err);
      setLoading(true); // ← activa el bloqueador

      if (err.response && err.response.status === 401) {
        setAlertType("warning");
        setAlertMsg(err.response.data.message || "Credenciales incorrectas");
        setTimeout(() => {
          setLoading(false); // ← desactivar el bloqueador
        }, 1500); // espera 1.5 segundos para mostar el procesnado
      } else {
        setAlertType("error");
        setAlertMsg("Error al iniciar sesión o contactar al administrador");
        setTimeout(() => {
          setLoading(false); // ← desactivar el bloqueador
        }, 1500); // espera 1.5 segundos para mostar el procesnado
      }

      setAlertOpen(true);
    }
  };

  return (
    <div className="login-background">
      <div className="login-card">
        <h2>Gerencia Implantación</h2>
        <img src={logoClaro} alt="Logo Claro" className="login-logo" />
        <h3>Ingrese sus credenciales</h3>

        {/* Input Email con ícono */}
        <div className="input-container">
          <i className="fas fa-envelope icon" />
          <input
            type="text"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Input Password con candado y toggle */}
        <div className="input-container">
          <i className="fa fa-lock icon" />
          <input
            type={showPass ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <i
            className={`fa ${showPass ? "fa-eye-slash" : "fa-eye"} toggle`}
            onClick={togglePassword}
          />
        </div>

        <button onClick={handleLogin} disabled={loading}>
          {loading ? (
            <>
              <i className="fa fa-spinner fa-spin" style={{ marginRight: 8 }} />
              Procesando...
            </>
          ) : (
            <>
              <i className="fa fa-sign-in" style={{ marginRight: 8 }} />
              Iniciar sesión
            </>
          )}
        </button>

        <p className="login-footer">
          ¿No tiene cuenta? Comuníquese con la Subgerencia de Ingeniería PX para
          gestionar su acceso.
        </p>
      </div>
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleClose}
          severity={alertType}
          sx={{ width: "100%" }}
        >
          {alertMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}
