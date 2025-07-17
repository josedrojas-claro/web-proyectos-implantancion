// components/MaterialSolicitudCard.jsx
import { useState } from "react";
import { Box, Typography, TextField, Button, Snackbar, Alert, CircularProgress } from "@mui/material";
import { createSolictudServMate } from "../../../services/aproServiMate";

export default function MaterialSolicitudCard({
  material,
  cantidadAsignada = 0,
  proyectoId,
  contratistaId,
  onSuccess,
}) {
  const [nuevaCantidad, setNuevaCantidad] = useState("");
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // === CAMBIO CLAVE AQUÍ ===
  // Permite solicitar si la nueva cantidad es un número válido (>= 0) y hay un comentario.
  const puedeSolicitar =
    !isNaN(parseFloat(nuevaCantidad)) && parseFloat(nuevaCantidad) >= 0 && comentario.trim().length > 0;
  // ==========================

  const handleSolicitar = async () => {
    if (!puedeSolicitar) {
      // Opcional: Dar un feedback al usuario si la validación falla
      setSnackbar({
        open: true,
        message: "Por favor, ingresa una cantidad válida y un comentario.",
        severity: "warning",
      });
      return;
    }

    setEnviando(true);
    try {
      const data = {
        proyectoId,
        tipo: "material",
        cantidad: parseFloat(nuevaCantidad), // Asegúrate de que esto siempre sea un número
        estado: "pendiente",
        contratistaId,
        comentarioUsuario: comentario,
        materialId: material.id,
      };

      await createSolictudServMate(data);
      setSnackbar({ open: true, message: "✅ Solicitud enviada con éxito", severity: "success" });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error al enviar solicitud", error);
      const mensaje = error?.response?.data?.message || "❌ Error inesperado al enviar la solicitud";
      const severidad = error?.response?.status === 409 ? "warning" : "error";

      setSnackbar({ open: true, message: mensaje, severity: severidad });
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
      <Typography fontWeight="bold">{material.codigo}</Typography>
      <Typography variant="body2" color="text.secondary">
        Descripción: {material.descripcion}
      </Typography>
      <Typography variant="body2" color="primary">
        Ya asignado: {cantidadAsignada}
      </Typography>
      {/* Cambié el label para reflejar la nueva flexibilidad */}
      <TextField
        label="Nueva cantidad"
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
