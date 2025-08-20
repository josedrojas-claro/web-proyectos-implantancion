import React, { useCallback, useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import { useLocation } from "react-router-dom";

import ListaServiciosPlanificados from "./components/ListaServiciosPlanifcados";
import ListaMaterialesPlanificados from "./components/ListaMaterialesPlanificados";
import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
import { fetchMaterialesAsignadosByProyecto } from "../../services/materialesServices";
import FormularioCorrelativo from "./components/FromularioCorrelativo";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import VerSolpedsByProyecto from "./components/verSolpedsByProyecto";

import { Collapse } from "antd";

export default function VerSolpedsCorrelativo() {
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
      <h2>Carga de Solicitudes de Pedido</h2>
      <ProyectoResumenCard proyecto={proyecto} />
      <Collapse style={{ marginTop: "10px" }}>
        <Collapse.Panel header="Servicios Cargados" key="1">
          <ListaServiciosPlanificados
            servicios={serviciosAsignados}
            loading={loadingServicios}
            onUpdate={cargarServicios}
            rowSeleccionActivate={false}
          />
        </Collapse.Panel>
        <Collapse.Panel header="Materiales Cargados" key="2">
          <ListaMaterialesPlanificados
            materiales={materialesAsignados}
            loading={loadingMateriales}
            onUpdate={cargarMateriales}
            rowSeleccionActivate={false}
          />
        </Collapse.Panel>
      </Collapse>
      <FormularioCorrelativo
        proyecto={proyecto}
        // onSuccess={refrescarProyecto}
      />
      <VerSolpedsByProyecto proyectoId={proyecto.id} />
    </MainLayout>
  );
}
