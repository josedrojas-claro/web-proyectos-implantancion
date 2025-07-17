import React from "react";
import { Typography, Tag, Space } from "antd";

const { CheckableTag } = Tag;

export default function FiltroBotones({ options, value, onChange, label = "Tecnologías" }) {
  const handleChange = (tagValue, shouldBeSelected) => {
    const newSelected = shouldBeSelected
      ? [...value, tagValue] // Si se debe seleccionar, lo añadimos
      : value.filter((t) => t !== tagValue); // Si no, lo quitamos

    onChange(newSelected);
  };

  return (
    <div>
      <Typography.Title level={5}>{label}</Typography.Title>
      <Space size={[8, 16]} wrap>
        {options.map((opt) => {
          // Verificamos si el tag está seleccionado actualmente
          const isSelected = value.includes(opt.value);

          return (
            <Tag
              key={opt.value}
              // 1. Aplicamos estilos condicionales
              style={{
                cursor: "pointer", // Para que parezca un botón
                // Si está seleccionado, azul; si no, gris claro.
                backgroundColor: isSelected ? "#1677ff" : "#f5f5f5",
                // Si está seleccionado, blanco; si no, texto oscuro.
                color: isSelected ? "white" : "rgba(0, 0, 0, 0.88)",
                border: "1px solid #d9d9d9",
              }}
              // 2. Manejamos el clic para alternar la selección
              onClick={() => handleChange(opt.value, !isSelected)}
            >
              {`${opt.label} (${opt.cantidad || 0})`}
            </Tag>
          );
        })}
      </Space>
    </div>
  );
}
