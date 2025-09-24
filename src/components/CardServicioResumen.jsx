import React from "react";
import {
  List,
  Typography,
  Avatar,
  Row,
  Col,
  Button,
  Tooltip,
  Flex,
} from "antd";
import { EditOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

// Componente auxiliar para mostrar cada métrica de forma compacta y consistente
const Metric = ({ title, value, color }) => (
  <div>
    <Text type="secondary" style={{ fontSize: "12px" }}>
      {title}
    </Text>
    <br />
    <Text
      strong
      style={{ color: color || "inherit", fontSize: "14px", lineHeight: 1.2 }}
    >
      {value}
    </Text>
  </div>
);

// Componente principal para la lista de servicios
export default function CardServicioResumen({ dataSource, onEdit }) {
  // Función para determinar el color del texto de la diferencia
  const getDiferenciaColor = (diferencia) => {
    if (diferencia > 0) return "#faad14"; // Naranja de AntD
    if (diferencia < 0) return "#f5222d"; // Rojo de AntD
    return "#52c41a"; // Verde de AntD
  };

  return (
    <List
      itemLayout="vertical"
      dataSource={dataSource}
      renderItem={(item, index) => (
        <List.Item
          key={item.id}
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #f0f0f0", // Un borde sutil
            borderRadius: "8px",
            padding: "16px 20px",
            marginBottom: "12px",
          }}
        >
          <List.Item.Meta
            avatar={
              <Avatar style={{ backgroundColor: "#1890ff" }}>
                {index + 1}
              </Avatar>
            }
            title={
              <Flex justify="space-between" align="center">
                {/* 1. El texto del servicio se mantiene a la izquierda */}
                <Text strong>Servicio: {item.Servicios.servicio}</Text>

                {/* 2. El botón de editar se mueve aquí, a la derecha */}
                <Tooltip title="Editar Servicio">
                  <Button
                    type="text"
                    shape="circle"
                    icon={<EditOutlined />}
                    onClick={() => onEdit && onEdit(item.id)}
                  />
                </Tooltip>
              </Flex>
            }
            description={
              <Paragraph
                type="secondary"
                ellipsis={{ rows: 1 }}
                style={{ marginBottom: 0 }}
              >
                {item.Servicios.descripcionServicio}
              </Paragraph>
            }
          />

          <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
            <Col xs={12} md={8} lg={4}>
              <Metric title="Planificado" value={item.cantidadPlanificada} />
            </Col>
            <Col xs={12} md={8} lg={4}>
              <Metric title="Replanteado" value={item.cantidadReplanteo} />
            </Col>
            <Col xs={12} md={8} lg={4}>
              <Metric title="Asignada" value={item.cantidadAsignada} />
            </Col>
            <Col xs={12} md={8} lg={4}>
              <Metric title="Ejecutada" value={item.cantidadEjecutada} />
            </Col>
            <Col xs={12} md={8} lg={4}>
              <Metric title="Adicional" value={item.cantidadAdicional} />
            </Col>
            <Col xs={12} md={8} lg={4}>
              <Metric
                title="Diferencia"
                value={item.diferencia.toFixed(2)}
                color={getDiferenciaColor(item.diferencia)}
              />
            </Col>
          </Row>
        </List.Item>
      )}
    />
  );
}
