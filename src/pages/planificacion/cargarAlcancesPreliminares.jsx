import React, { useEffect, useState, useCallback } from "react";
import MainLayout from "../../layout/MainLayout";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import { useLocation } from "react-router-dom";
import CargaMasivaServicios from "./components/CargaMasivaServicios";
import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
import ListaServiciosPlanificados from "./components/ListaServiciosPlanifcados";

export default function CargarAlcancesPreliminares() {
  const location = useLocation();
  const proyecto = location.state?.proyectoSeleccionado;

  //estados para lista y carga
  const [serviciosAsignados, setServiciosAsignados] = useState([]);
  const [loadingServicios, setLoadingServicios] = useState(false);

  //funcion para cargar o refrescar los servicios
  const cargarServicios = useCallback(async () => {
    if (!proyecto.id) return;

    setLoadingServicios(true);
    try {
      const servicios = await fetchServiciosAsignadosByProyecto(proyecto.id);
      setServiciosAsignados(servicios);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    } finally {
      setLoadingServicios(false);
    }
  }, [proyecto.id]);

  useEffect(() => {
    cargarServicios();
  }, [cargarServicios]);

  return (
    <MainLayout>
      <ProyectoResumenCard proyecto={proyecto} />
      <CargaMasivaServicios
        contratistaId={proyecto.contratistaId}
        proyectoId={proyecto.id}
        onPlanificacionGuardada={cargarServicios}
      />
      <ListaServiciosPlanificados
        servicios={serviciosAsignados}
        loading={loadingServicios}
        onUpdate={cargarServicios}
      />
    </MainLayout>
  );
}
