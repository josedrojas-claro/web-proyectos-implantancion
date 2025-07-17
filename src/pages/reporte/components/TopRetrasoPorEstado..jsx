// TopRetrasoPorEstado.js
import React from "react";
import { Row, Col, Card } from "antd";
import ProjectsTable from "./ProjectsTable";

// 1. Añadimos tu función de colores aquí
const getEstadoColor = (estado) => {
  const estadoColores = {
    "En planificación": "#795548",
    "Pendiente asignación": "#FF9800",
    Asignado: "#2196F3",
    Replanteo: "#FFEB3B",
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
  return estadoColores[estado] || "#a82323ff";
};

export default function TopRetrasoPorEstado({ data }) {
  return (
    <Card
      title="Top 10 Proyectos Retrasados por Estado"
      // ... tus estilos de Card ...
    >
      <Row gutter={[24, 24]}>
        {Object.keys(data).map((estado) => {
          // 2. Obtenemos el color para el estado actual
          const color = getEstadoColor(estado);

          return (
            <Col xs={24} md={12} lg={12} key={estado}>
              <ProjectsTable
                title={estado}
                projects={data[estado]}
                headers={["Ticket", "Nombre", "Horas Retraso", "Supervisor"]}
                dataKeys={["ticketCode", "nombreProyecto", "horasRetraso", "supervisorAsignado"]}
                // 3. Pasamos el color como prop
                cardColor={color}
              />
            </Col>
          );
        })}
      </Row>
    </Card>
  );
}
