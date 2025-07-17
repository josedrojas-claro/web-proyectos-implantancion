// FlujoDeEstadosChart.js
import React from "react";
import { Chart } from "react-google-charts";
import { Card, Spin, Typography } from "antd";

const { Text } = Typography;

export default function FlujoDeEstadosChart({ data }) {
  // 1. Añadimos una validación para cuando no hay datos
  if (!data || data.length === 0) {
    return (
      <Card title="Flujo de Transiciones entre Estados">
        <Text type="secondary">No hay datos de transiciones para mostrar.</Text>
      </Card>
    );
  }

  // 2. Transformamos tus datos asegurándonos de que sean válidos
  const chartData = [
    // 3. (Por seguridad) Usamos los encabezados estándar en inglés
    ["From", "To", "Weight"],
    ...data
      // Nos aseguramos de que no haya transiciones con nombres de estado nulos
      .filter((item) => item.desdeEstado && item.haciaEstado)
      .map((item) => [
        item.desdeEstado,
        item.haciaEstado,
        // Aseguramos que la cantidad sea un número
        Number(item.cantidadTransiciones),
      ]),
  ];

  const options = {
    sankey: {
      node: {
        label: {
          fontName: "Arial",
          fontSize: 14,
        },
      },
      link: {
        colorMode: "gradient",
      },
    },
  };

  return (
    <Card title="Flujo de Transiciones entre Estados">
      <Chart
        chartType="Sankey"
        width="100%"
        height="600px"
        data={chartData}
        options={options}
        loader={
          <div style={{ textAlign: "center", width: "100%" }}>
            <Spin />
          </div>
        }
      />
    </Card>
  );
}
