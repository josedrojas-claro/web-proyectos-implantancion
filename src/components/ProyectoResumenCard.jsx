// components/proyectos/ProyectoResumenCard.jsx
import React from "react";
import { App as AntApp, Card, Typography, Button, Flex, Space, Tag, Divider, message } from "antd";
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

export default function ProyectoResumenCard({ proyecto }) {
  const handleDescargar = async () => {
    try {
      await descargarPdfBitacora(proyecto.id);
      message.success("La bitácora se ha descargado correctamente.");
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      message.error("Hubo un problema al descargar la bitácora.");
    }
  };

  //funcion para descargar el rdo en excel
  const handleDescargarRdo = async () => {
    try {
      await descargarRdoExcel(proyecto.id);
      message.success("El RDO se ha descargado correctamente.");
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      message.error("Hubo un problema al descargar el RDO.");
    }
  };

  const estadosDescarga = [
    "En RDO",
    "En Conciliación de Materiales",
    "En planificación",
    "Finalizado",
    "Liquidacion",
    "DTA",
    "Validacion Documentos",
    "Con SOLPED",
    "Con Correlativo",
    "Con PO",
  ];

  // Función para verificar si el estado del proyecto está en la lista estadosDescarga
  const isEstadoDescarga = (project) => {
    // Opcional: Añade una verificación si project o project.estado son nulos/indefinidos
    if (!project || !project.estado || !project.estado.nombre) {
      return false;
    }
    return estadosDescarga.includes(project.estado.nombre);
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
              <Typography.Text strong>Proyecto: {proyecto.nombre}</Typography.Text>
            </Space>

            <Space align="center" size="small">
              <ToolOutlined style={{ color: "#1890ff" }} />
              <Typography.Text>
                Contratista: {proyecto.Contratistas?.nombre_contratista || "No asignado"}
              </Typography.Text>
            </Space>

            <Space align="center" size="small">
              <WifiOutlined style={{ color: "#1890ff" }} />
              <Typography.Text>Tecnología: {proyecto.tecnologia}</Typography.Text>
            </Space>
          </Flex>

          <Divider style={{ margin: "8px 0" }} />

          {/* Sección de Estado y Descripción */}
          <Flex vertical gap="small">
            <Space>
              <Typography.Text strong>Estado:</Typography.Text>
              <Tag color="blue">{proyecto.estado.nombre}</Tag>
            </Space>
            <Space align="start">
              <ReadOutlined style={{ color: "#595959", marginTop: "4px" }} />
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {proyecto.descripcion}
              </Typography.Paragraph>
            </Space>
          </Flex>

          {/* Botón condicional */}
          {aplicaDescarga && (
            <>
              <Divider style={{ margin: "8px 0" }} />
              <Flex justify="center">
                <Button type="primary" icon={<DownloadOutlined />} onClick={handleDescargar} size="middle">
                  Descargar Bitácora
                </Button>
                <Button onClick={handleDescargarRdo}>Descargar RDO</Button>
              </Flex>
            </>
          )}
        </Flex>
      </Card>
    </AntApp>
  );
}
