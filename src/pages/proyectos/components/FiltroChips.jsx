// FiltroChips.js
import React from "react";
import { Box, Chip, Typography } from "@mui/material";

export default function FiltroChips({ options, value, onChange, getEstadoColor, label = "Estados" }) {
  // Esta función maneja el clic en un chip
  const handleChipClick = (chipValue) => {
    // Verificamos si el chip ya está en la lista de valores seleccionados
    const currentIndex = value.indexOf(chipValue);
    const newSelected = [...value];

    if (currentIndex === -1) {
      // Si no está, lo añadimos
      newSelected.push(chipValue);
    } else {
      // Si ya está, lo quitamos
      newSelected.splice(currentIndex, 1);
    }

    // Llamamos a la función onChange del padre con la nueva lista de seleccionados
    onChange(newSelected);
  };

  return (
    <Box>
      <Typography variant="h6" display="block" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {options.map((opt) => {
          const isSelected = value.includes(opt.value);
          const color = getEstadoColor(opt.label);

          return (
            <Chip
              key={opt.value}
              label={`${opt.label} (${typeof opt.cantidad === "number" ? opt.cantidad : 0})`}
              onClick={() => handleChipClick(opt.value)}
              // Cambiamos el estilo si está seleccionado o no
              variant={isSelected ? "filled" : "outlined"}
              style={{
                backgroundColor: isSelected ? color : "transparent",
                color: isSelected ? "#fff" : color,
                borderColor: color,
                fontWeight: isSelected ? "bold" : "normal",
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
