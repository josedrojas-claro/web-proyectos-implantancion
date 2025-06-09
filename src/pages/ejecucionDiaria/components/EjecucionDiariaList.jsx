import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DoneIcon from "@mui/icons-material/Done";
import ListaServiciosUsados from "./ListaServiciosUsados";
import ListaMaterialesUsados from "./ListaMaterialesUsados";
import { aprobarRechazarEjecucionDiaria } from "../../../services/ejecucionDiariaServices"; // Asegúrate de importar correctamente
export default function EjecucionDiariaList({ ejecuciones, user, refetch }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // valores posibles: "success", "warning", "error"
  });

  //funcion para el cambio de estado de ejecucion diaria aprobada o rechazada
  const handleCambioEstado = async (id, estado) => {
    try {
      await aprobarRechazarEjecucionDiaria(id, estado);

      setSnackbar({
        open: true,
        message: `Ejecución ${estado === "aprobada" ? "aprobada" : "rechazada"} correctamente`,
        severity: "success", // verde
      });
      if (refetch) refetch(); // recarga ejecuciones si se proporciona
    } catch (error) {
      console.error("Error al cambiar estado:", error);

      const mensaje = error?.response?.data?.message || "Ocurrió un error al cambiar el estado.";
      setSnackbar({
        open: true,
        message: mensaje,
        severity: error?.response?.status === 409 ? "warning" : "error", // naranja si es 409, rojo si otro error
      });
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Ejecución diaria del proyecto
      </Typography>

      {ejecuciones.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay ejecuciones registradas aún.
        </Typography>
      ) : (
        ejecuciones.map((item) => (
          <Accordion key={item.id} defaultExpanded={false}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography fontWeight="bold">
                  {new Date(item.createdAt).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                  <Chip
                    label={`Estado: ${item.estado}`}
                    color={item.estado === "aprobada" ? "success" : "default"}
                    size="small"
                    icon={<DoneIcon />}
                  />
                  <Chip label={`Ejecución: ${item.porcenEjecucion * 100}%`} color="primary" size="small" />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                {item.comentario}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <ListaServiciosUsados ejecucionId={item.id} />
              <Divider sx={{ my: 2 }} />
              <ListaMaterialesUsados ejecucionId={item.id} />

              {["admin", "supervisor", "lider"].includes(user.role) && (
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button variant="contained" color="success" onClick={() => handleCambioEstado(item.id, "aprobada")}>
                    Aprobar
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => handleCambioEstado(item.id, "rechazada")}>
                    Rechazar
                  </Button>
                </Stack>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
