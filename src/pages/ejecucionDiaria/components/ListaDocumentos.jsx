import React, { useEffect, useState } from "react";
import { Box, Typography, Stack, Button, CircularProgress, Divider } from "@mui/material";
import { Download, Delete, InsertDriveFile } from "@mui/icons-material";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

import {
  fetchDocumentosByProyect,
  descargarArchivoDesdeUrl,
  deleteDocumentoById,
} from "../../../services/DocumentosServices";

export default function ListaDocumentos({ proyectoId, reloadTrigger }) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDocumentos = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchDocumentosByProyect(proyectoId);
      setDocumentos(data);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    } finally {
      setLoading(false);
    }
  }, [proyectoId]);

  useEffect(() => {
    cargarDocumentos();
  }, [cargarDocumentos, reloadTrigger]);

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este archivo será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteDocumentoById(id);
      await cargarDocumentos();
      Swal.fire("Eliminado", "El archivo ha sido eliminado.", "success");
    } catch (e) {
      Swal.fire("Error", "No se pudo eliminar el archivo.", "error", e);
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: "#fff",
        boxShadow: 2,
        width: { xs: "100%", md: "50%" },
        maxWidth: 600,
        overflow: "hidden", // 👈 evita que hijos sobresalgan
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <InsertDriveFile />
        <Typography variant="subtitle1" fontWeight="bold">
          Documentos Subidos
        </Typography>
      </Stack>

      {loading ? (
        <CircularProgress size={24} />
      ) : (
        documentos.map((doc) => (
          <Box key={doc.id} sx={{ mb: 3 }}>
            <Divider sx={{ my: 2 }} />

            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                wordBreak: "break-word",
              }}
            >
              📄 {doc.nombreArchivo}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Comentario: {doc.descripcion || "Sin comentario"}
              <br />
              Subido el: {dayjs(doc.createdAt).format("D [de] MMMM [de] YYYY, hh:mm a")}
              <br />
              Subido por: {doc.SubidoPor?.UserData?.nombre || "Desconocido"}
            </Typography>

            <Stack direction="row" spacing={2} mt={1}>
              <Button
                variant="contained"
                size="small"
                color="success"
                onClick={() => descargarArchivoDesdeUrl(doc.nombreArchivo, doc.id)}
              >
                Descargar
              </Button>
              <Button variant="contained" size="small" color="error" onClick={() => handleEliminar(doc.id)}>
                Borrar
              </Button>
            </Stack>
          </Box>
        ))
      )}
    </Box>
  );
}
