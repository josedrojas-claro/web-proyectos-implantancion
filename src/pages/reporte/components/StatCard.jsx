import React from "react";
import { Card, Statistic } from "antd";

// Añadimos "suffix" a las props
export default function StatCard({ title, value, suffix }) {
  return (
    <Card
      style={{
        border: "1px solid #d9d9d9",
        boxShadow: "0 0 12px rgba(0, 0, 0, 0.08)",
        transition: "0.3s",
      }}
    >
      {/* Usamos la nueva prop "suffix" */}
      <Statistic title={title} value={value} suffix={suffix} />
    </Card>
  );
}
