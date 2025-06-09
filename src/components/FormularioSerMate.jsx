import React from "react";
import { Grid, Typography } from "@mui/material";
import ListaItemSoM from "./ListaItemSoM";

export default function FormularioSerMate({ servicios, materiales, onCantidadChange, tipoFormulario }) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" fontWeight="bold" mb={1}>
          Servicios
        </Typography>
        <ListaItemSoM
          tipo="servicio"
          items={servicios}
          onCantidadChange={onCantidadChange}
          tipoFormulario={tipoFormulario}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h6" fontWeight="bold" mb={1}>
          Materiales
        </Typography>
        <ListaItemSoM
          tipo="material"
          items={materiales}
          onCantidadChange={onCantidadChange}
          tipoFormulario={tipoFormulario}
        />
      </Grid>
    </Grid>
  );
}
