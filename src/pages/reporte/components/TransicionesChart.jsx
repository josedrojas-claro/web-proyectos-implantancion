// TransicionChart.js
import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Card } from "antd";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function TransicionChart({ data }) {
  // Ordenamos los datos para mostrar las transiciones más largas primero
  const sortedData = [...data].sort((a, b) => b.tiempoPromedioHoras - a.tiempoPromedioHoras);

  const chartData = {
    // Creamos las etiquetas para cada barra
    labels: sortedData.map((item) => `${item.desdeEstado} → ${item.haciaEstado}`),
    datasets: [
      {
        label: "Tiempo Promedio (Horas)",
        data: sortedData.map((item) => item.tiempoPromedioHoras),
        backgroundColor: "rgba(243, 21, 69, 1)",
        borderColor: "rgba(219, 2, 49, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    // Hacemos que el gráfico sea horizontal
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Horas Hábiles Promedio",
        },
      },
    },
  };

  return (
    <Card title="Tiempo Promedio por Transición de Estado">
      {/* Damos una altura fija al contenedor del gráfico para que se vea bien */}
      <div style={{ position: "relative", height: "600px" }}>
        <Bar options={options} data={chartData} />
      </div>
    </Card>
  );
}
