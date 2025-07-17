import React, { useEffect, useState } from "react";
import { List, Typography, Tag, Space, Card } from "antd"; // 1. Importa Card
import { UserOutlined, ClockCircleOutlined, BranchesOutlined, CommentOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

import { fetchHistorialProyectos } from "../../../services/proyectoServices";

const getEstadoColor = (estado) => {
  const estadoColores = {
    "En planificación": "#795548",
    "Pendiente asignación": "#FF9800",
    Asignado: "#2196F3",
    Replanteo: "#adb949",
    Ejecucion: "#4CAF50",
    "En RDO": "#009688",
    Finalizado: "#9E9E9E",
    Ticket: "#0D7575",
    "Validacion Documentos": "#9C27B0",
    "Con SOLPED": "#4E342E",
    "Con PO": "#00838F",
    Liquidacion: "#BF360C",
    "Con Correlativo": "#33691E",
    DTA: "#3E2723",
  };

  return estadoColores[estado] || "#BDBDBD";
};

export default function HistorialProyecto({ proyectoId }) {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchHistorialProyectos(proyectoId);
        setHistorial(data);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      }
    };

    fetchData();
  }, [proyectoId]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
      <Typography.Title level={5} style={{ marginBottom: 0 }}>
        <BranchesOutlined style={{ marginRight: 8 }} />
        Historial de Cambios del Proyecto
      </Typography.Title>
      <List
        size="small"
        itemLayout="vertical"
        dataSource={historial}
        locale={{ emptyText: "Sin historial disponible." }}
        renderItem={(item) => (
          // 2. Envuelve el contenido en una Card
          <Card
            size="small"
            style={{
              marginBottom: 16, // Añade espacio entre cada tarjeta
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.09)", // Sombra sutil
              borderLeft: `5px solid ${getEstadoColor(item.estadoNuevo?.nombre)}`, // Barra de color distintiva
            }}
          >
            <List.Item style={{ padding: 0, borderBottom: "none" }}>
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                <Space size="small" wrap>
                  <Typography.Text strong>Estado:</Typography.Text>
                  <Tag color={getEstadoColor(item.estadoNuevo?.nombre)}>
                    {" "}
                    {/* Usa la prop 'color' */}
                    {item.estadoNuevo?.nombre}
                  </Tag>
                  <Typography.Text type="secondary" italic>
                    <BranchesOutlined style={{ marginRight: 4 }} /> Anterior: {item.estadoAnterior?.nombre || "—"}
                  </Typography.Text>
                </Space>

                <Typography.Text>
                  <CommentOutlined style={{ marginRight: 4 }} />
                  {item.comentario}
                </Typography.Text>

                <Space size="small" wrap>
                  <Typography.Text type="secondary">
                    <UserOutlined style={{ marginRight: 4 }} /> {item.user?.UserData?.nombre || "Desconocido"}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    <ClockCircleOutlined style={{ marginRight: 4 }} />{" "}
                    {dayjs(item.createdAt).format("D MMMM YYYY, hh:mm a")}
                  </Typography.Text>
                </Space>
              </Space>
            </List.Item>
          </Card>
        )}
      />
    </div>
  );
}
