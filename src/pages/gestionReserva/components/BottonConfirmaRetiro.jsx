import React from "react";
import { Button } from "antd";
// 1. Cambiamos el ícono a uno más apropiado como SendOutlined
import { SendOutlined } from "@ant-design/icons";
import { confirmarEnvioARetiro } from "../../../services/materialesServices";
import Swal from "sweetalert2";

// El componente debe recibir una función 'onSuccess' para notificar al padre que debe recargar los datos
const BotonConfirmaRetiro = ({ proyectoId, onSuccess, back }) => {
  const handleConfirmarEnvio = async () => {
    // PASO 1: Muestra la alerta de confirmación y espera la respuesta del usuario
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      html: `
        <p>Deseas enviar el proyecto a la fase de <b>Retiro de Material</b>.</p>
        <p>Por favor, confirma que ya has validado toda la información.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, enviar ahora",
      cancelButtonText: "Cancelar",
    });

    // PASO 2: Si el usuario confirma, procede con la acción
    if (result.isConfirmed) {
      try {
        // Muestra una alerta de carga mientras se procesa la solicitud
        Swal.fire({
          title: "Procesando...",
          text: "Por favor, espera mientras se actualiza el estado.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Llama al servicio del backend
        const response = await confirmarEnvioARetiro(proyectoId);

        // Si todo sale bien, muestra la alerta de éxito
        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text:
            response.message ||
            "El proyecto se ha enviado a retiro correctamente.",
        });

        if (back) {
          back(); // Navega a la página anterior si se proporciona la función back
        }
        // Llama a la función onSuccess para que el componente padre refresque los datos
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        // Si ocurre un error, muestra la alerta de error
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text:
            error?.response?.data?.message ||
            "No se pudo completar la operación. Por favor, inténtalo de nuevo.",
        });
      }
    }
  };

  return (
    <Button
      type="primary"
      icon={<SendOutlined />}
      onClick={handleConfirmarEnvio}
      style={{ maxWidth: 200, marginBottom: 16 }}
    >
      Enviar a Retiro
    </Button>
  );
};

export default BotonConfirmaRetiro;
