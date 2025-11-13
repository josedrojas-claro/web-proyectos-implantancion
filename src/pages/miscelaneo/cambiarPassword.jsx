import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { logout, cambiarContraseña } from "../../services/authServices"; // Ajusta la ruta según tu proyecto
import MainLayout from "../../layout/MainLayout";
const CambiarPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { currentPassword, newPassword } = values;

      // Llamada al backend
      const response = await cambiarContraseña({
        currentPassword,
        newPassword,
      });

      Swal.fire({
        icon: "success",
        title: "¡Contraseña cambiada!",
        text: response.message,
        confirmButtonText: "Aceptar",
      }).then(() => {
        logout().then(() => navigate("/login", { replace: true }));
      });
    } catch (error) {
      console.log("respuesta error", error.response);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message || "No se pudo cambiar la contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: 400, margin: "auto", padding: "2rem" }}>
        <h2>Cambiar Contraseña</h2>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Contraseña Actual"
            name="currentPassword"
            rules={[
              { required: true, message: "Ingrese su contraseña actual" },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Nueva Contraseña"
            name="newPassword"
            rules={[
              { required: true, message: "Ingrese la nueva contraseña" },
              {
                pattern:
                  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                message:
                  "Debe tener mínimo 6 caracteres, una mayúscula, un número y un símbolo permitido (@ $ ! % * ? &)",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Cambiar Contraseña
          </Button>
        </Form>
      </div>
    </MainLayout>
  );
};

export default CambiarPassword;
