import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Typography, Stack, Button, Snackbar } from "@mui/material";
import { Assignment, Folder, Build, Wifi } from "@mui/icons-material";
import AlertaValidacionDocumentos from "./components/AlertaValidacionDocumentos";
import SubirArchivoValidDocumentos from "./components/SubirArchivoValidDocumentos";
import ListaDocumentos from "./components/ListaDocumentos";
import MainLayout from "../../layout/MainLayout";
import { descargarPdfBitacora, cambioEstadoGeneral } from "../../services/bitacoraFinalServices";
import Swal from "sweetalert2";
import { subirDocumentos } from "../../services/DocumentosServices";
export default function ValidacionDocumentos() {
  const location = useLocation();
  const proyecto = location.state?.proyecto;
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  const handleDescargar = async () => {
    try {
      await descargarPdfBitacora(proyecto.id);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
    }
  };
  //variable para manejar el cambio de estado del proyecto
  const [loadingNuevoEstado, setLoadingNuevoEstado] = useState(false);

  //funcion para realizar el cambio de estado del proyecto

  // Función para realizar el cambio de estado del proyecto
  const cargarBitacoraFinal = async () => {
    try {
      // Confirmación al usuario
      const confirmacion = await Swal.fire({
        title: "¿Estás seguro?",
        html: `
        <p style="text-align:left;">
          Este proyecto será marcado como <b>(RDO)</b>. 📄<br><br>
          Asegúrate de haber <b>subido toda la documentación necesaria</b>, ya que <b>no podrás editar ni agregar archivos después</b>.<br><br>
          ✅ Si para este proyecto <b>no aplica subir documentos</b>, puedes continuar con el cambio de estado.
        </p>
      `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar estado",
        cancelButtonText: "Cancelar",
      });

      if (!confirmacion.isConfirmed) return;

      // Cambio de estado
      setLoadingNuevoEstado(true);
      const response = await cambioEstadoGeneral(proyecto.id, { nuevoEstadoNombre: "En RDO" });

      // Mensaje de éxito con auto cierre y navegación al cerrar
      await Swal.fire({
        title: "¡Éxito!",
        text: response.message || "El estado del proyecto ha sido actualizado.",
        icon: "success",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Redirigir al cerrar el mensaje
      navigate("/lista-proyectos-ejecucion");
    } catch (error) {
      console.error("Error al cambiar estado del proyecto:", error);
      await Swal.fire({
        title: "Error",
        text: error?.response?.data?.message || "Error al cambiar el estado del proyecto.",
        icon: "error",
      });
    } finally {
      setLoadingNuevoEstado(false);
    }
  };

  return (
    <MainLayout>
      <Stack alignItems={"center"}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Validacion de documentos
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" justifyContent="center" alignItems="center">
        {/* Box 1 datos generales del proyecto */}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "#fff",
            boxShadow: 2,
            minWidth: 300,
          }}
        >
          <Typography variant="h6" gutterBottom>
            🎯 Datos Generales del proyecto
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "column", md: "row" }} // 👈 clave aquí
            spacing={2}
            alignItems="flex-start"
            flexWrap="wrap"
            sx={{ mb: 2, gap: 1 }} // Espacio entre elementos
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Assignment fontSize="small" />
              <Typography variant="body2">Ticket: {proyecto.ticketCode}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Folder fontSize="small" />
              <Typography variant="body2">Proyecto: {proyecto.nombre}</Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Build fontSize="small" />
              <Typography variant="body2">Contratista: {proyecto.Contratistas.nombre_contratista}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Wifi fontSize="small" />
              <Typography variant="body2">Tecnología: {proyecto.tecnologia}</Typography>
            </Stack>
          </Stack>
          <Button variant="contained" size="small" sx={{ width: 200 }} onClick={handleDescargar}>
            Descargar PDF
          </Button>
        </Box>
        {/* Box 2 datos de alerta y abvertencia */}
        <AlertaValidacionDocumentos />
        {/* Box 3 subir archivos */}
        <SubirArchivoValidDocumentos
          onSubmit={async ({ files, comentario }) => {
            try {
              if (!files.length) {
                return Swal.fire("Advertencia", "Debes seleccionar al menos un archivo.", "warning");
              }

              if (!comentario.trim()) {
                return Swal.fire("Advertencia", "El comentario no puede estar vacío.", "warning");
              }

              const response = await subirDocumentos({
                proyectoId: proyecto.id,
                comentario,
                estado: "Validacion Documentos", // ⚠️ cámbialo si usas otro tipo en backend
                archivos: files,
              });

              Swal.fire("¡Éxito!", response.message, "success");
              // 👇 fuerza la recarga de ListaDocumentos
              setReloadKey((prev) => prev + 1);
            } catch (error) {
              console.error(error);
              Swal.fire("Error", error.message, "error");
            }
          }}
        />
        <ListaDocumentos proyectoId={proyecto.id} reloadTrigger={reloadKey} />
      </Stack>
      <Stack sx={{ mt: 4 }} alignItems="center">
        <Button variant="contained" color="warning" size="small" sx={{ width: 200 }} onClick={cargarBitacoraFinal}>
          {loadingNuevoEstado ? "Cargando..." : "Documentos Completos"}
        </Button>
      </Stack>
    </MainLayout>
  );
}
