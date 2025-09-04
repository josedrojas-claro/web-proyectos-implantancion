import React from "react";
import { Button, Space, Tooltip } from "antd";
import { FileExcelOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { obtenerExcelReservaContratisa } from "../../../services/materialesServices"; // Ajusta la ruta
import Swal from "sweetalert2";
const BottonDescargarExcelMaterialFinal = ({ proyectoId }) => {
  const handleDownload = async () => {
    // 2. Muestra la alerta de "cargando" ANTES de iniciar la petición
    Swal.fire({
      title: "Generando Excel",
      text: "Por favor, espera mientras preparamos tu archivo...",
      allowOutsideClick: false, // Evita que el usuario cierre la alerta haciendo clic fuera
      didOpen: () => {
        Swal.showLoading(); // Muestra el ícono de carga
      },
    });

    try {
      const blob = await obtenerExcelReservaContratisa(proyectoId);

      // Si todo sale bien, cerramos la alerta de carga
      Swal.close();

      const fileUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", "materiales_.xlsx");
      document.body.appendChild(link);

      link.click();
      link.parentNode.removeChild(link);

      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Error al descargar el archivo:", error?.response);

      // 3. Si ocurre un error, muestra una alerta de error
      Swal.fire({
        icon: "error",
        title: "¡Error!",
        text:
          error?.response?.data?.message ||
          "No se pudo generar el archivo. Por favor, inténtalo de nuevo.",
      });
    }
  };

  const notaDeAyuda = (
    <div>
      <p>
        Este proceso genera el Excel con los materiales a retirar y los que
        suministrará la contratista.
      </p>
      <p>
        <b>Es importante validar toda la información antes de continuar.</b>
      </p>
    </div>
  );

  return (
    <Space align="center">
      <Button
        icon={<FileExcelOutlined />}
        onClick={handleDownload}
        style={{ maxWidth: 200, marginBottom: 16, marginTop: 16 }}
      >
        Excel-Reserva-Materiales
      </Button>
      {/* 4. Añade el Tooltip que envuelve el ícono de ayuda */}
      <Tooltip title={notaDeAyuda}>
        <QuestionCircleOutlined
          style={{
            fontSize: "18px",
            color: "rgba(0, 0, 0, 0.45)",
            cursor: "help",
          }}
        />
      </Tooltip>
    </Space>
  );
};

export default BottonDescargarExcelMaterialFinal;
