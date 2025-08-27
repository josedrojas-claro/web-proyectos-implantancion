import React, { useState, useCallback, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";
import CargaMasivaServiciosReplanteo from "./components/CargaMasivaServiciosReplanteo";
import CargaMasivaMaterialesReplanteo from "./components/CragaMasivaMaterialesReplanteo";
import ListaServiciosReplanteo from "./components/ListaServiciosReplanteo";
import ListaMaterialesReplanteo from "./components/ListaMaterialesReplanteo";
import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
import { fetchMaterialesAsignadosByProyecto } from "../../services/materialesServices";
import { fetchSupervisoresContratista } from "../../services/userServices";
import { updateEstadoPostReplanteo } from "../../services/proyectoServices";
import DialogAsignarSupervisor from "./components/DialogAsignarSupervisor";
import { Button, Typography, Space, Row, Divider } from "antd";
import { UserOutlined, CheckCircleOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";

const { Text } = Typography;

export default function ReplanteoPageV2() {
  const location = useLocation();
  const proyecto = location.state?.proyecto;
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

  const cargarSupervisoresContratista = useCallback(async () => {
    if (!proyecto.id) return;

    setLoadingSupervisoresContratista(true);
    try {
      const supervisores = await fetchSupervisoresContratista(proyecto.id);
      setSupervisoresContratista(supervisores);
    } catch (error) {
      console.error("Error al cargar supervisores:", error);
    } finally {
      setLoadingSupervisoresContratista(false);
    }
  }, [proyecto.id]);

  useEffect(() => {
    cargarServicios();
    cargarMateriales();
    cargarSupervisoresContratista();
  }, [cargarServicios, cargarMateriales, cargarSupervisoresContratista]);

  //funciones para el dialog del supervisor
  const [openDialogSupervisor, setOpenDialogSupervisor] = useState(false);
  const [supervisorSeleccionado, setSupervisorSeleccionado] = useState(null);
  const [filtroSupervisoresContratista, setFiltroSupervisoresContratista] =
    useState("");
  const [loadingSupervisoresContratista, setLoadingSupervisoresContratista] =
    useState(false);
  const [supervisoresContratista, setSupervisoresContratista] = useState([]);

  const handleConfirmarCambio = () => {
    if (!supervisorSeleccionado) {
      Swal.fire("Error", "Debe seleccionar un supervisor.", "error");
      return;
    }

    Swal.fire({
      title: "Confirmar Cambio de Estado",
      html: `
        <div>
          <p>¿Está seguro de asignar al supervisor <b>${supervisorSeleccionado.UserData.nombre}</b> al proyecto?</p>
          <p>Por favor, confirme que ha validado todos los datos del replanteo antes de continuar. Al confirmar, se procederá a realizar el cambio de estado.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const data = {
            id: proyecto.id,
            supervisorContrataId: supervisorSeleccionado.id,
          };
          const response = await updateEstadoPostReplanteo(data);

          await Swal.fire({
            title: "¡Éxito!",
            text:
              response.message || "El estado del proyecto ha sido actualizado.",
            icon: "success",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          setOpenDialogSupervisor(false);
          setSupervisorSeleccionado(null);
          navigate("/lista-proyectos-replanteo");
        } catch (error) {
          console.error("Error al asignar supervisor:", error);
          Swal.fire("Error", "No se pudo asignar el supervisor.", "error");
        }
      }
    });
  };

  return (
    <MainLayout>
      <h2>Replanteo</h2>
      <ListaServiciosReplanteo
        servicios={serviciosAsignados}
        loading={loadingServicios}
        onUpdate={cargarServicios}
      />
      <CargaMasivaServiciosReplanteo
        contratistaId={proyecto?.contratistaId}
        proyectoId={proyecto?.id}
        onPlanificacionGuardada={cargarServicios}
      />
      <ListaMaterialesReplanteo
        materiales={materialesAsignados}
        loading={loadingMateriales}
        onUpdate={cargarMateriales}
      />
      <CargaMasivaMaterialesReplanteo
        proyectoId={proyecto?.id}
        onPlanificacionGuardada={cargarMateriales}
      />
      <Divider size="large" variant="solid" />
      <Row justify="center" align="middle" style={{ marginTop: 20 }}>
        <Space direction="vertical" align="center">
          <Button
            type="primary"
            onClick={() => setOpenDialogSupervisor(true)}
            size="middle" // ✨ Botón más pequeño
            icon={<UserOutlined />}
          >
            Seleccione un Supervisor
          </Button>

          {/* Muestra el supervisor seleccionado y el botón de confirmar */}
          {supervisorSeleccionado ? (
            <>
              {/* ✨ Nombre del supervisor en rojo y negrita */}
              <Text strong type="danger">
                Supervisor: {supervisorSeleccionado.UserData.nombre}
              </Text>

              {/* ✨ Botón de confirmar que solo aparece si hay una selección */}
              <Button
                type="primary"
                success // O usa un estilo para hacerlo verde
                onClick={handleConfirmarCambio} // Debes crear esta función
                icon={<CheckCircleOutlined />}
              >
                Confirmar Cambio de Estado
              </Button>
            </>
          ) : (
            <Text type="secondary">
              Aún no se ha seleccionado un supervisor.
            </Text>
          )}
        </Space>
      </Row>
      <DialogAsignarSupervisor
        open={openDialogSupervisor}
        onClose={() => setOpenDialogSupervisor(false)}
        supervisores={supervisoresContratista}
        filtro={filtroSupervisoresContratista}
        setFiltro={setFiltroSupervisoresContratista}
        loading={loadingSupervisoresContratista}
        proyecto={proyecto}
        onAsignar={(supervisor) => {
          setSupervisorSeleccionado(supervisor);
          setOpenDialogSupervisor(false);
        }}
      />
    </MainLayout>
  );
}
