import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Card } from "antd";

// Tu función para obtener el color de cada estado
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
  return estadoColores[estado] || "#BDBDBD"; // Color por defecto
};

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
