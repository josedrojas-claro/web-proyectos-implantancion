import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Stack, Button } from "@mui/material";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import CardServicioResumen from "../../components/CardServicioResumen";
import CardMaterialResumen from "../../components/CardMaterialResumen";
import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
import { fetchMaterialesAsignadosByProyecto } from "../../services/materialesServices";
import { useAuthUser } from "../../services/authServices";
import Swal from "sweetalert2";
import { cambioEstadoLiquidacion } from "../../services/bitacoraFinalServices";

export default function RdoPage() {
  const location = useLocation();
  const proyecto = location.state?.proyecto;
  const navigate = useNavigate();

  const user = useAuthUser();

  //variable para manejar el cambio de estado del proyecto
  const [loadingNuevoEstado, setLoadingNuevoEstado] = useState(false);

  //funciones para traer data de servicios asigandos
  const [servicios, setServicios] = useState([]);
  //funciones para traer data de materiales asignados
  const [materiales, setMateriales] = useState([]);
  useEffect(() => {
    const cargarServicios = async () => {
      try {
        const data = await fetchServiciosAsignadosByProyecto(proyecto.id);
        setServicios(data);
      } catch (error) {
        console.error("Error al cargar los servicios: ", error);
      }
    };
    const cargarMateriales = async () => {
      try {
        const data = await fetchMaterialesAsignadosByProyecto(proyecto.id);
        setMateriales(data);
      } catch (error) {
        console.error("Error al cargar los materiales: ", error);
      }
    };
    cargarServicios();
    cargarMateriales();
  }, [proyecto.id]);

  //funcion para cambio de estado
  // Función para realizar el cambio de estado del proyecto
  const cambioEstado = async () => {
    try {
      // Confirmación al usuario
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "Este proyecto pasará de RDO a 'En planificación'. No podrás revertir este cambio fácilmente.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, enviar a planificación",
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;

      // Cambio de estado
      setLoadingNuevoEstado(true);
      const response = await cambioEstadoLiquidacion(proyecto.id);

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
      navigate("/lista-proyectos-rdo-conciliacion-materiales");
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

  const totalPrecioEjecutadoServicio = servicios.reduce((acc, item) => {
    const precio = item.precioTotal || 0;
    const moneda = item.Servicios?.moneda || "USD";

    // Si es NIO, multiplicamos por 36.62
    const precioConvertido = moneda === "NIO" ? precio / 36.62 : precio;

    return acc + precioConvertido;
  }, 0);

  const totalPrecioEjecutadoMaterial = materiales.reduce((acc, item) => {
    const precio = item.precioTotal || 0;
    const moneda = item.material?.moneda || "USD";

    // Si es NIO, multiplicamos por 36.62
    const precioConvertido = moneda === "NIO" ? precio / 36.62 : precio;

    return acc + precioConvertido;
  }, 0);

  const sumaTotal = totalPrecioEjecutadoServicio + totalPrecioEjecutadoMaterial;
  return (
    <MainLayout>
      <Stack alignItems={"center"}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Generador de RDO
        </Typography>
      </Stack>
      <Stack direction="column" spacing={2} alignItems={"center"}>
        {/* Box 1 datos generales del proyecto */}
        <ProyectoResumenCard proyecto={proyecto} />
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap flexWrap="wrap">
          {["admin", "planificador"].includes(user.role) && (
            <Button variant="contained" color="warning" size="small" sx={{ width: 200 }} onClick={cambioEstado}>
              {loadingNuevoEstado ? "Cargando..." : "Cambio de estado"}
            </Button>
          )}
        </Stack>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} useFlexGap flexWrap="wrap">
          {/* Lista de Servicios Asignados */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Servicios
            </Typography>
            <Stack spacing={2}>
              {servicios.map((item, index) => (
                <CardServicioResumen key={item.id || index} item={item} index={index} role={user.role} />
              ))}
              {/* Mostrar el total ejecutado al final */}
              {["admin", "planificador"].includes(user.role) && (
                <Typography variant="h7" align="center" sx={{ mt: 2, textAlign: "center" }}>
                  Total Servicios: {totalPrecioEjecutadoServicio.toFixed(2)} USD
                </Typography>
              )}
            </Stack>
          </Box>

          {/* espacio para los materiales */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Materiales
            </Typography>
            <Stack spacing={2}>
              {materiales.map((item, index) => (
                <CardMaterialResumen key={item.id || index} item={item} index={index} role={user.role} />
              ))}
              {["admin", "planificador"].includes(user.role) && (
                <Typography variant="h7" align="center" sx={{ mt: 2, textAlign: "center" }}>
                  Total Materiales: {totalPrecioEjecutadoMaterial.toFixed(2)} USD
                </Typography>
              )}
            </Stack>
          </Box>
          {["admin", "planificador"].includes(user.role) && (
            <Typography variant="h5" align="center" sx={{ width: "100%", textAlign: "center", mt: 2 }}>
              Total General: {sumaTotal.toFixed(2)} USD
            </Typography>
          )}
        </Stack>
      </Stack>
    </MainLayout>
  );
}
