import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Card } from "antd";
import { getEstadoColor } from "../../../utils/colorUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function EstadoBarChart({ data }) {
  const labels = Object.keys(data);

  // Generamos dinámicamente los colores para las barras
  // mapeando cada estado (label) a su color correspondiente.
  const backgroundColors = labels.map((estado) => getEstadoColor(estado));

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "# de Proyectos",
        data: Object.values(data),
        // Usamos el array de colores que acabamos de generar
        backgroundColor: backgroundColors,
        borderRadius: 5,
      },
    ],
  };

  const options = {
    //... tus opciones se mantienen igual
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <Card
      title="Resumen de Proyectos por Estado"
      headStyle={{ borderBottom: "1px solid #d9d9d9" }}
      style={{
        border: "1px solid #d9d9d9",
        boxShadow: "0 0 12px rgba(0, 0, 0, 0.08)",
        transition: "0.3s",
      }}
    >
      <Bar options={options} data={chartData} />
    </Card>
  );
}
