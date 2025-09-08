import React, { useCallback, useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import { useLocation } from "react-router-dom";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import ListaServiciosGestion from "./components/ListaServiciosGestion";
import ListaMaterialesGestion from "./components/ListaMaterialGestion";
import ListaMaterialesGestionPlanificados from "./components/ListaMaterialGestionPlanificados";
import BottonDescargarExcelMaterialFinal from "./components/BottonDescargarExcelMaterialFinal";
import BotonConfirmaRetiro from "./components/BottonConfirmaRetiro";
import BottonCambioEstado from "./components/BottonCambioEstado";
import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
import {
  fetchMaterialesGestionReplanteo,
  fetchMaterialesReplanteadosVsPlanificados,
} from "../../services/materialesServices";
import { useAuthUser } from "../../services/authServices"; // Importa el hook para obtener el usuario autenticado
import { Space } from "antd";

export default function GestionReserva() {
  const user = useAuthUser(); // Obtiene la información del usuario autenticado

  // Asegúrate de que user y user.UserData existan antes de intentar acceder a user.UserData.rol
  const userRole = user?.role;

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
      const materiales = await fetchMaterialesGestionReplanteo(proyecto.id);
      setMaterialesAsignados(materiales);
    } catch (error) {
      console.error("Error al cargar materiales:", error);
    } finally {
      setLoadingMateriales(false);
    }
  }, [proyecto.id]);

  //estados para lista de materiales planificados
  const [materialesAsignadosPlanificados, setMaterialesAsignadosPlanificados] =
    useState([]);
  const [loadingMaterialesPlanificados, setLoadingMaterialesPlanificados] =
    useState(false);

  const cargarMaterialesPlanificados = useCallback(async () => {
    if (!proyecto.id) return;

    setLoadingMaterialesPlanificados(true);
    try {
      const materiales = await fetchMaterialesReplanteadosVsPlanificados(
        proyecto.id
      );
      setMaterialesAsignadosPlanificados(materiales);
    } catch (error) {
      console.error("Error al cargar materiales planificados:", error);
    } finally {
      setLoadingMaterialesPlanificados(false);
    }
  }, [proyecto.id]);

  useEffect(() => {
    cargarServicios();
    cargarMateriales();
    cargarMaterialesPlanificados();
  }, [cargarServicios, cargarMateriales, cargarMaterialesPlanificados]);

  const cargaAll = () => {
    cargarServicios();
    cargarMateriales();
    cargarMaterialesPlanificados();
  };
  return (
    <MainLayout>
      <h2>Gestión de Reserva</h2>
      <ProyectoResumenCard proyecto={proyecto} />
      <ListaServiciosGestion
        servicios={serviciosAsignados}
        loading={loadingServicios}
        onUpdate={cargarServicios}
        userRole={userRole}
      />
      <ListaMaterialesGestion
        materiales={materialesAsignados}
        loading={loadingMateriales}
        onUpdate={cargarMateriales}
        proyectoId={proyecto.id}
        userRole={userRole}
      />
      <ListaMaterialesGestionPlanificados
        materiales={materialesAsignadosPlanificados}
        loading={loadingMaterialesPlanificados}
        onUpdate={cargarMaterialesPlanificados}
        userRole={userRole}
      />
      <Space
        direction="vertical"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {["admin", "coordinador-ing", "planificador"].includes(userRole) && (
          <BotonConfirmaRetiro proyectoId={proyecto.id} onSuccess={cargaAll} />
        )}

        {proyecto.estado?.nombre === "Gestion Reserva-Retiro" && (
          <BottonDescargarExcelMaterialFinal proyectoId={proyecto.id} />
        )}
        {["admin", "coordinador-sup", "lider", "supervisor"].includes(
          userRole
        ) &&
          proyecto.estado?.nombre === "Gestion Reserva-Retiro" && (
            <BottonCambioEstado proyectoSeleccionado={proyecto} />
          )}
      </Space>
    </MainLayout>
  );
}
