import React, { useState, useRef } from "react";
import { Box, Stack, Typography, Button, TextField, IconButton } from "@mui/material";
import { UploadFile, CheckCircle } from "@mui/icons-material";

export default function SubirArchivoValidDocumentos({ onSubmit }) {
  const [files, setFiles] = useState([]);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await onSubmit?.({ files, comentario });
      setFiles([]);
      setComentario("");
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // 👈 reinicia el input para que pueda volver a seleccionar el mismo archivo
      }
    } catch (error) {
      console.error("Error al subir documentos:", error);
      setFiles([]);
      setComentario("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: 2,
        width: { xs: "100%", md: "50%" }, // ½ de pantalla en ≥ md
        maxWidth: 600, // no crece demasiado en pantallas muy grandes
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Encabezado */}
      <Stack direction="row" spacing={1} alignItems="center">
        <UploadFile color="action" />
        <Typography variant="subtitle1" fontWeight="bold">
          Subir Documentos Finales
        </Typography>
      </Stack>

      {/* Selector de archivos */}
      <Button variant="outlined" component="label" startIcon={<UploadFile />} sx={{ alignSelf: "flex-start" }}>
        Seleccionar archivos
        <input
          type="file"
          hidden
          multiple
          ref={fileInputRef} // 👈 aquí
          onChange={handleFileChange}
        />
      </Button>

      {/* Muestra rápida de archivos seleccionados (opcional) */}
      {files.length > 0 && (
        <Typography variant="caption" color="text.secondary">
          {files.length} archivo(s) seleccionado(s)
        </Typography>
      )}

      {/* Comentario */}
      <TextField
        placeholder="Comentario"
        multiline
        minRows={3}
        fullWidth
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />

      {/* Botón de envío */}
      <Button
        variant="contained"
        color="success"
        startIcon={<CheckCircle />}
        sx={{ alignSelf: { xs: "stretch", md: "flex-end" } }} // ocupa todo en móvil, se alinea a la derecha en ≥ md
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Subiendo..." : "Subir información"}
      </Button>
    </Box>
  );
}
