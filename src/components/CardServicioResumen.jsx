import React from "react";
import { Box, Typography, Stack, Grid, Divider } from "@mui/material";

export default function CardServicioResumen({ item, index, role }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        bgcolor: "#f8f6fc",
        borderRadius: 2,
        p: 2,
        boxShadow: 1,
        width: "100%",
        maxWidth: 600,
      }}
    >
      {/* Encabezado con número e ID */}
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: "#d8d8d8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: "bold",
          }}
        >
          {index + 1}
        </Box>
        <Typography variant="subtitle1" fontWeight="bold">
          Servicio: {item.Servicios.servicio}
        </Typography>
      </Stack>

      {/* Descripción */}
      <Typography variant="body2" color="text.secondary">
        Descripción: {item.Servicios.descripcionServicio}
      </Typography>

      {/* Métricas */}
      <Grid container spacing={2} mt={1}>
        <Grid item xs={3}>
          <Typography variant="caption" color="text.secondary">
            Replanteado
          </Typography>
          <Typography variant="body2">{item.cantidadReplanteo}</Typography>
        </Grid>
        <Divider orientation="vertical" variant="middle" flexItem />

        <Grid item xs={3}>
          <Typography variant="caption" color="text.secondary">
            Asignada
          </Typography>
          <Typography variant="body2">{item.cantidadAsignada}</Typography>
        </Grid>
        <Divider orientation="vertical" variant="middle" flexItem />

        <Grid item xs={3}>
          <Typography variant="caption" color="text.secondary">
            Ejecutada
          </Typography>
          <Typography variant="body2">{item.cantidadEjecutada}</Typography>
        </Grid>
        <Divider orientation="vertical" variant="middle" flexItem />

        <Grid item xs={3}>
          <Typography variant="caption" color="text.secondary">
            Adicional
          </Typography>
          <Typography variant="body2">
            {" "}
            {item.cantidadAdicional > 0 ? Math.max(0, item.cantidadAdicional - item.cantidadReplanteo) : 0}
          </Typography>
        </Grid>
        <Divider orientation="vertical" variant="middle" flexItem />

        <Grid item xs={3}>
          <Typography variant="caption" color="text.secondary">
            Diferencia
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: item.diferencia > 0 ? "orange" : item.diferencia < 0 ? "red" : "green" }}
          >
            {item.diferencia.toFixed(2)}
          </Typography>
        </Grid>
        <Divider orientation="vertical" variant="middle" flexItem />

        {!["contratista", "contratista-lider", "supervisor"].includes(role) && (
          <Grid item xs={3}>
            <Typography variant="caption" color="text.secondary">
              Costo Ejecutado
            </Typography>
            <Typography variant="body2">
              {item.precioTotal.toFixed(2)} {item.Servicios.moneda}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
