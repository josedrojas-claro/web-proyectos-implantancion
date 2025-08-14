// TopRetrasoPorEstado.js
import React from "react";
import { Row, Col, Card } from "antd";
import ProjectsTable from "./ProjectsTable";
import { getEstadoColor } from "../../../utils/colorUtils";

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
                dataKeys={[
                  "ticketCode",
                  "nombreProyecto",
                  "horasRetraso",
                  "supervisorAsignado",
                ]}
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
