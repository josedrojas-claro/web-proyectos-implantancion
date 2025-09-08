import React from "react";
import { Button } from "antd";
import { SendOutlined } from "@ant-design/icons"; // Corregido: usar el ícono adecuado
import { cambiarEstadoProyecto } from "../../../services/proyectoServices";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// Opcional: si quieres cambiar el nombre del componente, renómbralo a "BotonCambioEstado".
const BottonCambioEstado = ({ proyectoSeleccionado }) => {
  const navigate = useNavigate();

  const handleAsignar = async (proyecto) => {
    if (!proyecto?.id) {
      Swal.fire({
        icon: "warning",
        title: "Proyecto no válido",
        text: "No se encontró un proyecto seleccionado.",
      });
      return;
    }

    // -------- PASO 1: Checklist de verificación obligatoria --------
    const checklist = await Swal.fire({
      title: "Validación previa a Ejecución",
      icon: "info",
      html: `
        <div style="text-align:left;">
          <p>Confirma que realizaste estas verificaciones para el proyecto.</p>
          <label style="display:flex;gap:8px;align-items:flex-start;margin:8px 0;">
            <input id="chkValidacion" type="checkbox"/>
            <span>He <strong>validado los materiales</strong> a utilizar.</span>
          </label>

          <div style="margin:10px 0;">
            <div style="font-weight:600;margin-bottom:6px;">Reserva de materiales (elige una):</div>
            <label style="display:flex;gap:8px;align-items:center;margin:6px 0;">
              <input id="reservaRetirada" name="reserva" type="radio" value="retirada"/>
              <span>Retiré la reserva de materiales.</span>
            </label>
            <label style="display:flex;gap:8px;align-items:center;margin:6px 0;">
              <input id="reservaNoAplica" name="reserva" type="radio" value="no_aplica"/>
              <span>No aplica reserva para este proyecto.</span>
            </label>
          </div>

          <p style="margin-top:10px;color:#e67e22;">
            <strong>Importante:</strong> Este cambio enviará el proyecto a <strong>Ejecución</strong>.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Continuar",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      allowOutsideClick: false,
      preConfirm: () => {
        const validado = document.getElementById("chkValidacion")?.checked;
        const reservaRetirada =
          document.getElementById("reservaRetirada")?.checked;
        const reservaNoAplica =
          document.getElementById("reservaNoAplica")?.checked;

        if (!validado) {
          Swal.showValidationMessage(
            "Debes confirmar que validaste los materiales."
          );
          return false;
        }
        if (!reservaRetirada && !reservaNoAplica) {
          Swal.showValidationMessage(
            "Selecciona si retiraste la reserva o si no aplica."
          );
          return false;
        }

        return {
          validadoMateriales: true,
          estadoReserva: reservaRetirada ? "retirada" : "no_aplica",
        };
      },
    });

    if (!checklist.isConfirmed) return;

    // -------- PASO 2: Confirmación final e irreversible --------
    const confirmacionFinal = await Swal.fire({
      title: "¿Confirmar envío a Ejecución?",
      icon: "warning",
      html: `
        <div style="text-align:left;">
          <p>Estás por enviar este proyecto a <strong>Ejecución</strong>.</p>
          <ul style="margin-left:18px;">
            <li>El cambio es <strong>irreversible desde esta pantalla</strong>.</li>
            <li>No podrás regresar a la ventana anterior.</li>
            <li>Se actualizará el estado del proyecto y continuará el flujo operativo.</li>
          </ul>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar y ejecutar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      allowOutsideClick: false,
      reverseButtons: true,
    });

    if (!confirmacionFinal.isConfirmed) return;

    // -------- PASO 3: Llamada a API con loading --------
    try {
      Swal.fire({
        title: "Enviando a Ejecución…",
        text: "Por favor, espera.",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Si tu API soporta payload adicional, puedes pasar el estado de la reserva y la validación:
      // const response = await cambiarEstadoProyecto(proyecto.id, { validadoMateriales: true, estadoReserva: checklist.value.estadoReserva });
      const response = await cambiarEstadoProyecto(proyecto.id);

      await Swal.fire({
        icon: "success",
        title: "¡Proyecto en Ejecución!",
        text:
          response?.message ||
          "El proyecto fue enviado a ejecución correctamente.",
        timer: 2500,
        showConfirmButton: false,
      });
      navigate("/lista-proyectos-gestion-reserva");
    } catch (error) {
      console.error("Error al enviar a ejecución:", error);
      Swal.fire({
        icon: "error",
        title: "No se pudo completar la acción",
        text:
          error?.response?.data?.message ||
          "Ocurrió un error al cambiar el estado. Intenta de nuevo.",
      });
    }
  };

  return (
    <Button
      type="primary"
      icon={<SendOutlined />}
      onClick={() => handleAsignar(proyectoSeleccionado)} // Corregido: pasar el proyecto
      style={{ maxWidth: 220, marginBottom: 16 }}
    >
      Enviar a ejecución
    </Button>
  );
};

export default BottonCambioEstado;
