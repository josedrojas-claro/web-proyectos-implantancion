import React, { useCallback, useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import { useLocation } from "react-router-dom";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import ListaServiciosGestion from "./components/ListaServiciosGestion";
import ListaMaterialesGestion from "./components/ListaMaterialGestion";
import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
import { fetchMaterialesAsignadosByProyecto } from "../../services/materialesServices";

export default function GestionReserva() {
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

  //estados para lista de materiales y carga
  const [materialesAsignados, setMaterialesAsignados] = useState([]);
  const [loadingMateriales, setLoadingMateriales] = useState(false);

  const cargarMateriales = useCallback(async () => {
    if (!proyecto.id) return;

    setLoadingMateriales(true);
    try {
      const materiales = await fetchMaterialesAsignadosByProyecto(proyecto.id);
      setMaterialesAsignados(materiales);
    } catch (error) {
      console.error("Error al cargar materiales:", error);
    } finally {
      setLoadingMateriales(false);
    }
  }, [proyecto.id]);

  useEffect(() => {
    cargarServicios();
    cargarMateriales();
  }, [cargarServicios, cargarMateriales]);

  return (
    <MainLayout>
      <h2>Gestión de Reserva</h2>
      <ProyectoResumenCard proyecto={proyecto} />
      <ListaServiciosGestion
        servicios={serviciosAsignados}
        loading={loadingServicios}
        onUpdate={cargarServicios}
      />
      <ListaMaterialesGestion
        materiales={materialesAsignados}
        loading={loadingMateriales}
        onUpdate={cargarMateriales}
        proyectoId={proyecto.id}
      />
    </MainLayout>
  );
}
