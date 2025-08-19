import React, { useEffect, useState, useCallback } from "react";
import MainLayout from "../../layout/MainLayout";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import { useLocation, useNavigate } from "react-router-dom";
import CargaMasivaServicios from "./components/CargaMasivaServicios";
import CargaMasivaMateriales from "./components/CargaMasivaMateriales";
import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
import { fetchMaterialesAsignadosByProyecto } from "../../services/materialesServices";
import ListaServiciosPlanificados from "./components/ListaServiciosPlanifcados";
import ListaMaterialesPlanificados from "./components/ListaMaterialesPlanificados";
import { cambiarEstadoProyecto } from "../../services/proyectoServices";
import { Button, Space, Row } from "antd";
import Swal from "sweetalert2";

export default function CargarAlcancesPreliminares() {
  const location = useLocation();
  const proyecto = location.state?.proyectoSeleccionado;
  const navigate = useNavigate();

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

  const handleCambiarEstado = async (id) => {
    const confirmacion = await Swal.fire({
      title: "Validación de Datos",
      html: `
      <p>Por favor, confirma que has revisado y validado que todos los datos son correctos antes de cambiar el estado.</p>
      <p><strong>Esta acción no se puede deshacer fácilmente.</strong></p>
    `, // Usamos 'html' para mejor formato
      icon: "info",
      input: "checkbox", // ✨ Añade un checkbox de confirmación
      inputValue: 0, // Valor inicial del checkbox (desmarcado)
      inputPlaceholder:
        "He validado que los datos están seguros y son correctos.",
      confirmButtonText: "Confirmar y Cambiar Estado",
      showCancelButton: true,
      cancelButtonText: "Volver",
      // ✨ Validador para asegurar que el checkbox fue marcado
      inputValidator: (result) => {
        return !result && "Debes marcar la casilla para confirmar.";
      },
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const response = await cambiarEstadoProyecto(id);
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

      navigate("/lista-proyectos-planificacion");
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      Swal.fire("Error", "No se pudo cambiar el estado del proyecto.", "error");
    }
  };

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
      <CargaMasivaMateriales
        proyectoId={proyecto.id}
        onPlanificacionGuardada={cargarMateriales}
      />
      <ListaMaterialesPlanificados
        materiales={materialesAsignados}
        loading={loadingMateriales}
        onUpdate={cargarMateriales}
      />
      <Row justify="center" style={{ marginTop: "20px" }}>
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => handleCambiarEstado(proyecto.id)}
          >
            Cambiar Estado
          </Button>
        </Space>
      </Row>
    </MainLayout>
  );
}
