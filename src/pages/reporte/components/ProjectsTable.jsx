// ProjectsTable.js
import React from "react";
import { Table, Card } from "antd";

// 1. Aceptamos la nueva prop "cardColor"
export default function ProjectsTable({ title, projects, headers, dataKeys, cardColor = "#642323ff" }) {
  const columnsConfig = headers.map((header, index) => ({
    title: <b>{header}</b>,
    dataIndex: dataKeys[index],
    key: dataKeys[index],
  }));

  return (
    <Card
      title={title}
      // 2. Usamos la prop para estilizar el encabezado
      headStyle={{
        backgroundColor: cardColor, // Aplicamos el color de fondo
        borderBottom: "1px solid #d9d9d9",
        color: "#fff", // Cambiamos el color del texto a blanco para que sea legible
      }}
      style={{
        border: "1px solid #d9d9d9",
        boxShadow: "0 0 12px rgba(0, 0, 0, 0.08)",
      }}
    >
      <Table
        columns={columnsConfig}
        dataSource={projects}
        size="small"
        pagination={false}
        rowKey={(record) => record.ticketCode || record.id}
      />
    </Card>
  );
}
