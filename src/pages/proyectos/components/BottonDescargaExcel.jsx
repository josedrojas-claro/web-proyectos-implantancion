import React from "react";
import { Button } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import { fetchProyectosGeneralesExcel } from "../../../services/proyectoServices"; // Ajusta la ruta
import Swal from "sweetalert2";
const BotonDescargarExcel = ({ filtros }) => {
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
      const blob = await fetchProyectosGeneralesExcel(filtros);

      // Si todo sale bien, cerramos la alerta de carga
      Swal.close();

      const fileUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = fileUrl;
      link.setAttribute("download", "reporte_proyectos.xlsx");
      document.body.appendChild(link);

      link.click();
      link.parentNode.removeChild(link);

      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error("Error al descargar el archivo:", error);

      // 3. Si ocurre un error, muestra una alerta de error
      Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: "No se pudo generar el archivo. Por favor, inténtalo de nuevo.",
      });
    }
  };
  return (
    <Button
      icon={<FileExcelOutlined />}
      onClick={handleDownload}
      style={{ maxWidth: 200 }}
    >
      Exportar a Excel
    </Button>
  );
};

export default BotonDescargarExcel;
