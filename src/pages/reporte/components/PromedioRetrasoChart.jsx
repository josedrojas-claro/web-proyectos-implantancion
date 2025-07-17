import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Card } from "antd";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PromedioRetrasoChart({ data }) {
  // Verificamos que los datos no estén vacíos
  if (!data || data.length === 0) {
    return <Card title="Comparativa de Retraso">No hay datos para mostrar.</Card>;
  }

  const chartData = {
    labels: data.map((item) => item.estado),
    datasets: [
      {
        label: "Horas Permitidas",
        data: data.map((item) => item.horasPermitidas),
        backgroundColor: "#36A2EB",
        borderRadius: 5,
        // Agregamos un ID al eje Y para agrupar
        yAxisID: "y",
      },
      {
        label: "Promedio Horas Retraso",
        data: data.map((item) => item.promedioHorasRetraso),
        backgroundColor: "rgba(243, 21, 69, 1)",
        borderRadius: 5,
        yAxisID: "y",
      },
    ],
  };

  const options = {
    responsive: true,
    // Aseguramos que la altura del gráfico sea suficiente
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      // Configuramos el eje Y principal
      y: {
        type: "linear",
        display: true,
        position: "left",
        beginAtZero: true,
        title: {
          display: true,
          text: "Horas",
        },
      },
    },
  };

  return (
    <Card title="Comparativa de Retraso Promedio vs. Horas Permitidas">
      {/* Envolvemos el gráfico en un div con altura definida para que maintainAspectRatio funcione */}
      <div style={{ position: "relative", height: "400px" }}>
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
