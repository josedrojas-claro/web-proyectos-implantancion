// components/ServicioSolicitudCard.jsx
import { useState } from "react";
import { Box, Typography, TextField, Button, Snackbar, Alert, CircularProgress } from "@mui/material";
import { createSolictudServMate } from "../../../services/aproServiMate";

export default function ServicioSolicitudCard({
  servicio,
  cantidadAsignada = 0,
  proyectoId,
  contratistaId,
  onSuccess, // notifica al Dialog padre
}) {
  const [nuevaCantidad, setNuevaCantidad] = useState("");
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const puedeSolicitar = parseFloat(nuevaCantidad) > cantidadAsignada && comentario.trim().length > 0;

  const handleSolicitar = async () => {
    if (!puedeSolicitar) return;

    setEnviando(true);
    try {
      const data = {
        proyectoId,
        tipo: "servicio",
        cantidad: parseFloat(nuevaCantidad),
        estado: "pendiente",
        contratistaId,
        comentarioUsuario: comentario,
        servicioId: servicio.id,
      };

      await createSolictudServMate(data);
      setSnackbar({ open: true, message: "✅ Solicitud enviada con éxito", severity: "success" });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al enviar solicitud", error);

      const mensaje = error?.response?.data?.message || "❌ Error inesperado al enviar la solicitud";

      const severidad = error?.response?.status === 409 ? "warning" : "error";

      setSnackbar({
        open: true,
        message: mensaje,
        severity: severidad,
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        border: "1px solid #ddd",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        "&:hover": { backgroundColor: "#f9f9f9" },
      }}
    >
      <Typography fontWeight="bold">{servicio.servicio}</Typography>
      <Typography variant="body2" color="text.secondary">
        Descripción: {servicio.descripcionServicio}
      </Typography>
      <Typography variant="body2" color="primary">
        Ya asignado: {cantidadAsignada}
      </Typography>

      <TextField
        label="Cantidad Adicional"
        type="number"
        fullWidth
        size="small"
        value={nuevaCantidad}
        onChange={(e) => setNuevaCantidad(e.target.value)}
      />

      <TextField
        label="Motivo de la solicitud"
        multiline
        fullWidth
        minRows={2}
        size="small"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />

      <Button variant="contained" color="primary" disabled={!puedeSolicitar || enviando} onClick={handleSolicitar}>
        {enviando ? <CircularProgress size={24} color="inherit" /> : "Solicitar"}
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
