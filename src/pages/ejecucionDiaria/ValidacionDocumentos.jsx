import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthUser } from "../../services/authServices";
import { Box, Typography, Stack, Button, Snackbar } from "@mui/material";
import { Assignment, Folder, Build, Wifi } from "@mui/icons-material";
import AlertaValidacionDocumentos from "./components/AlertaValidacionDocumentos";
import SubirArchivoValidDocumentos from "./components/SubirArchivoValidDocumentos";
import ListaDocumentos from "./components/ListaDocumentos";
import MainLayout from "../../layout/MainLayout";
import { cambioEstadoGeneral } from "../../services/bitacoraFinalServices";
import Swal from "sweetalert2";
import { subirDocumentos } from "../../services/DocumentosServices";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";

export default function ValidacionDocumentos() {
  const location = useLocation();
  const proyecto = location.state?.proyecto;
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  const user = useAuthUser();

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
      const response = await cambioEstadoGeneral(proyecto.id, {
        nuevoEstadoNombre: "En RDO",
      });

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
        text:
          error?.response?.data?.message ||
          "Error al cambiar el estado del proyecto.",
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
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        flexWrap="wrap"
        justifyContent="center"
        alignItems="center"
      >
        {/* Box 1 datos generales del proyecto */}
        <ProyectoResumenCard proyecto={proyecto} />

        {/* Box 2 datos de alerta y abvertencia */}
        <AlertaValidacionDocumentos />
        {/* Box 3 subir archivos */}
        <SubirArchivoValidDocumentos
          onSubmit={async ({ files, comentario }) => {
            try {
              if (!files.length) {
                return Swal.fire(
                  "Advertencia",
                  "Debes seleccionar al menos un archivo.",
                  "warning"
                );
              }

              if (!comentario.trim()) {
                return Swal.fire(
                  "Advertencia",
                  "El comentario no puede estar vacío.",
                  "warning"
                );
              }

              const response = await subirDocumentos({
                proyectoId: proyecto.id,
                comentario,
                estado: "Validacion Documentos", // ⚠️ cámbialo si usas otro tipo en backend
                archivos: files,
              });
              console.log(response);

              Swal.fire("¡Éxito!", response.message, "success");
              // 👇 fuerza la recarga de ListaDocumentos
              setReloadKey((prev) => prev + 1);
            } catch (error) {
              console.error("respuesta: ", error);
              Swal.fire("Error", error.message, "error");
            }
          }}
        />
        <ListaDocumentos proyectoId={proyecto.id} reloadTrigger={reloadKey} />
      </Stack>
      {user.role !== "contratista" && user.role !== "contratista-lider" && (
        <Stack sx={{ mt: 4 }} alignItems="center">
          <Button
            variant="contained"
            color="warning"
            size="small"
            sx={{ width: 200 }}
            onClick={cargarBitacoraFinal}
          >
            {loadingNuevoEstado ? "Cargando..." : "Documentos Completos"}
          </Button>
        </Stack>
      )}
    </MainLayout>
  );
}
