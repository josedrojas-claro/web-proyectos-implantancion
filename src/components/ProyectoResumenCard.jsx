// components/proyectos/ProyectoResumenCard.jsx
import React, { useState } from "react";
import {
  App as AntApp,
  Card,
  Typography,
  Button,
  Flex,
  Space,
  Tag,
  Divider,
} from "antd";
import {
  FileTextOutlined,
  FolderOutlined,
  ToolOutlined,
  WifiOutlined,
  ReadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { descargarPdfBitacora } from "../services/bitacoraFinalServices";
import { descargarRdoExcel } from "../services/bitacoraFinalServices";
import { getEstadoColor } from "../utils/colorUtils";
import Swal from "sweetalert2";

export default function ProyectoResumenCard({ proyecto }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDescargar = async () => {
    Swal.fire({
      title: "Generando Bitácora",
      text: "Por favor, espera mientras preparamos tu archivo...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setIsDownloading(true);
    try {
      await descargarPdfBitacora(proyecto.id);
      Swal.fire({
        icon: "success",
        title: "¡Descarga Exitosa!",
        text: "Tu archivo se ha descargado correctamente.",
        timer: 2000, // Close automatically after 2 seconds
        showConfirmButton: false,
      });
    } catch (error) {
      // 5. Show an error message if anything fails
      console.error("Error al descargar el archivo:", error);
      Swal.fire({
        icon: "error",
        title: "Error en la Descarga",
        text: "No se pudo generar el archivo. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  //funcion para descargar el rdo en excel
  const handleDescargarRdo = async () => {
    Swal.fire({
      title: "Generando RDO",
      text: "Por favor, espera mientras preparamos tu archivo...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setIsDownloading(true);
    try {
      await descargarRdoExcel(proyecto.id);
      Swal.fire({
        icon: "success",
        title: "¡Descarga Exitosa!",
        text: "Tu archivo se ha descargado correctamente.",
        timer: 2000, // Close automatically after 2 seconds
        showConfirmButton: false,
      });
    } catch (error) {
      // 5. Show an error message if anything fails
      console.error("Error al descargar el archivo:", error);
      Swal.fire({
        icon: "error",
        title: "Error en la Descarga",
        text: "No se pudo generar el archivo. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const estadosDescargaConPo = [
    "En RDO",
    "En Conciliación de Materiales",
    "Finalizado",
    "Liquidacion",
    "DTA",
    "Validacion Documentos",
  ];

  const estadosDescargaSinPo = [
    "En RDO",
    "En Conciliación de Materiales",
    "En planificación",
    "Finalizado",
    "Liquidacion",
    "DTA",
    "Validacion Documentos",
    "Con SOLPED",
    "Con Correlativo",
  ];

  // Función para verificar si el estado del proyecto está en la lista estadosDescarga
  const isEstadoDescarga = (project) => {
    // Opcional: Añade una verificación si project o project.estado son nulos/indefinidos
    if (!project || !project.estado || !project.estado.nombre) {
      return false;
    }
    return proyecto.havePo
      ? estadosDescargaConPo.includes(project.estado.nombre)
      : estadosDescargaSinPo.includes(project.estado.nombre);
  };
  // Ahora puedes usar isEstadoDescarga(proyecto) donde necesites el valor booleano
  const aplicaDescarga = isEstadoDescarga(proyecto);
  return (
    <AntApp>
      <Card
        title="🎯 Datos Generales del Proyecto"
        bordered={false}
        style={{
          width: "100%",
          maxWidth: "800px", // Ancho máximo para mantener la legibilidad en pantallas grandes
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        }}
      >
        <Flex vertical gap="middle">
          {/* Contenedor principal de datos con diseño flexible y responsivo */}
          <Flex wrap="wrap" gap="large" justify="start">
            <Space align="center" size="small">
              <FileTextOutlined style={{ color: "#1890ff" }} />
              <Typography.Text>Ticket: {proyecto.ticketCode}</Typography.Text>
            </Space>

            <Space align="center" size="small">
              <FolderOutlined style={{ color: "#1890ff" }} />
              <Typography.Text strong>
                Proyecto: {proyecto.nombre}
              </Typography.Text>
            </Space>

            <Space align="center" size="small">
              <ToolOutlined style={{ color: "#1890ff" }} />
              <Typography.Text>
                Contratista:{" "}
                {proyecto.Contratistas?.nombre_contratista || "No asignado"}
              </Typography.Text>
            </Space>

            <Space align="center" size="small">
              <WifiOutlined style={{ color: "#1890ff" }} />
              <Typography.Text>
                Tecnología: {proyecto.tecnologia}
              </Typography.Text>
            </Space>
          </Flex>

          <Divider style={{ margin: "8px 0" }} />

          {/* Sección de Estado y Descripción */}
          <Flex vertical gap="small">
            <Space>
              <Typography.Text strong>Estado:</Typography.Text>
              <Tag color={getEstadoColor(proyecto.estado?.nombre)}>
                {proyecto.estado?.nombre}
              </Tag>{" "}
            </Space>
            <Space align="start">
              <ReadOutlined style={{ color: "#595959", marginTop: "4px" }} />
              <Typography.Paragraph
                type="secondary"
                style={{ marginBottom: 0 }}
              >
                {proyecto.descripcion}
              </Typography.Paragraph>
            </Space>
          </Flex>

          {/* Botón condicional */}
          {aplicaDescarga && (
            <>
              <Divider style={{ margin: "8px 0" }} />
              <Flex justify="center">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDescargar}
                  size="middle"
                  loading={isDownloading}
                >
                  Descargar Bitácora
                </Button>
                <Button onClick={handleDescargarRdo} loading={isDownloading}>
                  Descargar RDO
                </Button>
              </Flex>
            </>
          )}
        </Flex>
      </Card>
    </AntApp>
  );
}
