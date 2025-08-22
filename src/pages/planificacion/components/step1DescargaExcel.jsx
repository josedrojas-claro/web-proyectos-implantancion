import React, { useState } from "react";
import { Button, Space, Typography } from "antd";
import Swal from "sweetalert2";
import { FileExcelOutlined } from "@ant-design/icons";
import { exportarSolpedsExcel } from "../../../services/liquidacionServices";

const { Title, Text } = Typography;

// ✨ 1. Recibe una nueva prop 'onDownloadComplete' para notificar al padre
export default function Step1DescargaExcel({ onDownloadComplete }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    Swal.fire({
      title: "Generando Reporte de SOLPEDs",
      text: "Por favor, espera mientras preparamos tu archivo...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await exportarSolpedsExcel();

      Swal.fire({
        icon: "success",
        title: "¡Descarga Exitosa!",
        text: "Tu archivo se ha descargado. Ya puedes pasar al siguiente paso.",
        timer: 3000,
        showConfirmButton: false,
      });

      // ✨ 2. Llama a la función del padre para indicar que la descarga terminó
      if (onDownloadComplete) {
        onDownloadComplete(true);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error en la Exportación",
        text: error.message || "No se pudo generar el archivo de Excel.",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    // ✨ 3. Usamos Space para centrar y organizar el contenido
    <Space
      direction="vertical"
      align="center"
      style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
    >
      <Title level={5}>Paso 1: Descargar SOLPEDs Pendientes</Title>
      <Text type="secondary" style={{ textAlign: "center" }}>
        Este es el primer paso para la carga masiva de POs. Presiona el botón
        para descargar un archivo Excel con todas las SOLPEDs que están en
        estado "Con SOLPED" y listas para que se les asigne una PO.
      </Text>
      <Button
        type="primary"
        icon={<FileExcelOutlined />}
        onClick={handleExport}
        loading={exporting}
      >
        Descargar Excel de SOLPEDs
      </Button>
    </Space>
  );
}
