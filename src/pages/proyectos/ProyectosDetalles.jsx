import React, { useState, useEffect, useCallback } from "react"; // Asegúrate de importar useCallback
import MainLayout from "../../layout/MainLayout";
import { useParams, useLocation } from "react-router-dom";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import InfoProyecto from "./components/InfoProyecto";
import HistorialProyecto from "./components/HistorialProyecto";
import ListaPoComponent from "./components/listaPoGeneral";
import ListaDocumentos from "../ejecucionDiaria/components/ListaDocumentos";
import SubirArchivoValidDocumentos from "../ejecucionDiaria/components/SubirArchivoValidDocumentos";
import {
  Typography,
  Space,
  Row,
  Col,
  Divider,
  Spin,
  Empty,
  Button,
  Modal,
  Form,
  Input,
  Collapse,
} from "antd";
import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
import { fetchMaterialesAsignadosByProyecto } from "../../services/materialesServices";

import ItemResumen from "../../components/CardItemResumen";
import FormularioCorrelativo from "../planificacion/components/FromularioCorrelativo";
import VerSolpedsByProyecto from "../planificacion/components/verSolpedsByProyecto";
import { useAuthUser } from "../../services/authServices";
// se usa el mismo enpoint para actualizar la aprobacion de servicio y material el update
import { fetchServiciosSolicutudAproRecha } from "../../services/serviciosServices";
import { fetchMaterialesSolicutudAproRecha } from "../../services/materialesServices";
import { subirDocumentos } from "../../services/DocumentosServices";

import SolicitudAprobarCard from "./components/SolicitudAprobarCard";
import {
  cancelarProyecto,
  pausarProyecto,
  deleteProyecto,
} from "../../services/proyectoServices";
import {
  PauseCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";

const { Title } = Typography;

export default function ProyectoDetalles() {
  const { ticketCode } = useParams();
  const location = useLocation();
  const [proyecto, setProyecto] = useState(location.state?.proyecto);
  const user = useAuthUser();

  const [servicios, setServicios] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [serviciosApro, setServiciosApro] = useState([]);
  const [materialesApro, setMaterialesApro] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Carga inicial de todos los datos
  const cargarTodo = useCallback(async () => {
    setLoading(true);
    try {
      const [
        dataServicios,
        dataMateriales,
        dataServiciosApro,
        dataMaterialesApro,
      ] = await Promise.all([
        fetchServiciosAsignadosByProyecto(proyecto.id),
        fetchMaterialesAsignadosByProyecto(proyecto.id),
        fetchServiciosSolicutudAproRecha(proyecto.id),
        fetchMaterialesSolicutudAproRecha(proyecto.id),
      ]);
      setServicios(dataServicios);
      setMateriales(dataMateriales);
      setServiciosApro(dataServiciosApro);
      setMaterialesApro(dataMaterialesApro);
    } catch (error) {
      console.error("Error al cargar datos: ", error);
    } finally {
      setLoading(false);
    }
  }, [proyecto.id]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]); // Dependencia actualizada a cargarTodo

  const handleSolicitudUpdate = useCallback(() => {
    cargarTodo();
  }, [cargarTodo]);

  // ✨ --- Estados para el Modal de Acciones ---
  const [isPauseModalVisible, setIsPauseModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  // ✨ Un form para cada modal
  const [pauseForm] = Form.useForm();
  const [cancelForm] = Form.useForm();

  const [historialKey, setHistorialKey] = useState(0); // ✨ Añade este estado

  const handlePauseSubmit = async () => {
    try {
      const values = await pauseForm.validateFields();
      const isPausado = proyecto.estado.nombre === "En pausa";
      const actionText = isPausado ? "reanudar" : "pausar";

      Swal.fire({
        title: `¿Estás seguro de ${actionText} el proyecto?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: `Sí, ${actionText}`,
        cancelButtonText: "No",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const { message, nuevoEstado } = await pausarProyecto({
              proyectoId: proyecto.id,
              comentario: values.comentario,
            });

            await Swal.fire("¡Éxito!", message, "success");

            // Actualizamos el estado
            setProyecto((prev) => ({
              ...prev,
              estado: { ...prev.estado, nombre: nuevoEstado.nombre }, // Reemplazamos el objeto de estado anterior
            }));
            setHistorialKey((prevKey) => prevKey + 1);

            setIsPauseModalVisible(false);
            pauseForm.resetFields();
          } catch (error) {
            console.log(error);
            Swal.fire(
              "Error",
              error.message || "No se pudo completar la acción.",
              "error"
            );
          }
        }
      });
    } catch (e) {
      console.log(e.message);
      console.log("Error de validación", e.message);
    }
  };

  // ✨ Función para CANCELAR y REACTIVAR
  const handleCancelSubmit = async () => {
    try {
      const values = await cancelForm.validateFields();
      const isCancelado = proyecto.estado.nombre === "Cancelado";
      const actionText = isCancelado ? "reactivar" : "cancelar";

      Swal.fire({
        title: `¿Estás seguro de ${actionText} el proyecto?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: `Sí, ${actionText}`,
        cancelButtonText: "No",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            // El backend usa el mismo servicio como un "toggle"
            const { message, nuevoEstado } = await cancelarProyecto({
              proyectoId: proyecto.id,
              comentario: values.comentario,
            });
            await Swal.fire("¡Éxito!", message, "success");

            setProyecto((prev) => ({
              ...prev,
              estado: { ...prev.estado, nombre: nuevoEstado.nombre },
            }));

            setHistorialKey((prevKey) => prevKey + 1);

            setIsCancelModalVisible(false);
            cancelForm.resetFields();
          } catch (error) {
            Swal.fire(
              "Error",
              error || "No se pudo completar la acción.",
              "error"
            );
          }
        }
      });
    } catch (e) {
      console.log("Error de validación", e);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  const borradoProyecto = async () => {
    // We'll use the project name for confirmation
    const nombreProyecto = proyecto.nombre;

    Swal.fire({
      title: "¿Estás absolutamente seguro?",
      icon: "warning",
      // Use `html` to add more formatting and emphasis
      html: `
      <p>Esta acción es irreversible. Estás a punto de eliminar <strong>permanentemente</strong> el proyecto:</p>
      <p><strong>${nombreProyecto}</strong></p>
      <p>Todos los datos asociados se perderán para siempre. Para confirmar, por favor escribe el nombre del proyecto en el campo de abajo.</p>
    `,
      // Adds an input field
      input: "text",
      inputPlaceholder: `Escribe "${nombreProyecto}" aquí`,
      showCancelButton: true,
      confirmButtonText: "Sí, entiendo las consecuencias, borrar",
      cancelButtonText: "Cancelar",
      // Makes the confirm button red for danger
      confirmButtonColor: "#d33",

      // Validates the input before enabling the confirm button
      inputValidator: (value) => {
        if (value !== nombreProyecto) {
          return "¡El nombre del proyecto no coincide!";
        }
      },
    }).then(async (result) => {
      // This code only runs if the user typed the name correctly and clicked "borrar"
      if (result.isConfirmed) {
        try {
          const response = await deleteProyecto(proyecto.id);
          await Swal.fire(
            "¡Borrado!",
            response.message || "El proyecto ha sido eliminado.",
            "success"
          );
          window.location.href = "/lista-proyectos-generales";
        } catch (error) {
          Swal.fire(
            "Error",
            error.message || "No se pudo borrar el proyecto.",
            "error"
          );
        }
      }
    });
  };

  const rolesConPermiso = [
    "admin",
    "lider",
    "planificador",
    "coordinador-sup",
    "coordinador-ing",
  ];
  const rolesParaAprobar = ["admin", "planificador"];
  const roleCancelarProyecto = ["admin", "coordinador-ing"];
  const rolesPausarProyecto = ["admin", "coordinador-sup"];
  const rolesBorrado = ["admin"];

  const { TextArea } = Input;

  return (
    <MainLayout>
      <Title level={3} strong={true}>
        Detalles de proyecto para ticket: {ticketCode}
      </Title>
      <ProyectoResumenCard proyecto={proyecto} />
      {/* //botones para activar, cancelar o pausar proyectos */}
      <Space style={{ marginTop: "20px" }}>
        {(() => {
          const estado = proyecto.estado.nombre;

          // --- Lógica para el estado "Cancelado" ---
          if (estado === "Cancelado") {
            // ✨ Muestra el botón "Reactivar" solo si el rol del usuario está permitido
            return (
              roleCancelarProyecto.includes(user.role) && (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => setIsCancelModalVisible(true)}
                >
                  Reactivar
                </Button>
              )
            );
          }
          // --- Lógica para el estado "En pausa" ---
          else if (estado === "En pausa") {
            // ✨ Muestra el botón "Reanudar" solo si el rol del usuario está permitido
            return (
              rolesPausarProyecto.includes(user.role) && (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => setIsPauseModalVisible(true)}
                >
                  Reanudar
                </Button>
              )
            );
          }
          // --- Lógica para otros estados ---
          else {
            // ✨ Muestra los botones de Pausar y Cancelar, cada uno con su propia validación de rol
            return (
              <>
                {rolesPausarProyecto.includes(user.role) && (
                  <Button
                    icon={<PauseCircleOutlined />}
                    onClick={() => setIsPauseModalVisible(true)}
                  >
                    Pausar
                  </Button>
                )}
                {roleCancelarProyecto.includes(user.role) && (
                  <Button
                    color="cyan"
                    variant="solid"
                    icon={<CloseCircleOutlined />}
                    onClick={() => setIsCancelModalVisible(true)}
                  >
                    Cancelar
                  </Button>
                )}
              </>
            );
          }
        })()}
      </Space>
      {/* infor general del prroyecto */}
      <Collapse defaultActiveKey={["0"]} style={{ marginTop: 16 }}>
        <Collapse.Panel header="Información General del Proyecto" key="1">
          <InfoProyecto proyecto={proyecto} />
          <Space direction="horizontal" size={25}>
            <ListaDocumentos
              proyectoId={proyecto.id}
              ventana={true}
              reloadTrigger={reloadKey}
            />
            <ListaDocumentos
              proyectoId={proyecto.id}
              ventana={true}
              docFirmados={true}
            />
            {rolesConPermiso.includes(user.role) && (
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

                    Swal.fire("¡Éxito!", response.message, "success");
                    // 👇 fuerza la recarga de ListaDocumentos
                    setReloadKey((prev) => prev + 1);
                  } catch (error) {
                    console.error(error);
                    Swal.fire("Error", error.message, "error");
                  }
                }}
              />
            )}
          </Space>
        </Collapse.Panel>
        <Collapse.Panel header="Correlativo, Solpeds y Lista PO" key="2">
          <FormularioCorrelativo proyecto={proyecto} viewBotton={false} />
          <VerSolpedsByProyecto proyectoId={proyecto.id} viewBotton={false} />
          <ListaPoComponent proyectoId={proyecto.id} />
        </Collapse.Panel>
        <Collapse.Panel header="Historial del Proyecto" key="3">
          <HistorialProyecto proyectoId={proyecto.id} key={historialKey} />
        </Collapse.Panel>
        <Collapse.Panel header="Servicios y Materiales" key="4">
          <Row gutter={[16, 16]} wrap>
            {/* Servicios */}
            <Col xs={24} md={12}>
              <Typography.Title level={5}>Servicios</Typography.Title>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <ItemResumen dataSource={servicios} tipo="Servicio" />
                {/* Condición para mostrar el total de servicios */}
                {rolesConPermiso.includes(user.role) && (
                  <Typography.Text
                    strong
                    style={{ textAlign: "center", display: "block" }}
                  >
                    Total Servicios: {proyecto.totalServiciosUsd.toFixed(2)} USD
                  </Typography.Text>
                )}
              </Space>
            </Col>

            {/* Materiales */}
            <Col xs={24} md={12}>
              <Typography.Title level={5}>Materiales</Typography.Title>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <ItemResumen dataSource={materiales} tipo="Material" />
                {/* Condición para mostrar el total de materiales */}
                {rolesConPermiso.includes(user.role) && (
                  <Typography.Text
                    strong
                    style={{ textAlign: "center", display: "block" }}
                  >
                    Total Materiales: {proyecto.totalMaterialesUsd.toFixed(2)}{" "}
                    USD
                  </Typography.Text>
                )}
              </Space>
            </Col>
          </Row>
          {/* Condición para mostrar el total general */}
          {rolesConPermiso.includes(user.role) && (
            <Typography.Title level={5} style={{ textAlign: "center" }}>
              Total General: {proyecto.totalProyectoUsd.toFixed(2)} USD
            </Typography.Title>
          )}
        </Collapse.Panel>
        {rolesParaAprobar.includes(user.role) && (
          <Collapse.Panel
            header="Solicitudes de adicionales (Servicios y Materiales)"
            key="5"
          >
            <Typography.Title
              level={4}
              style={{ textAlign: "center", margin: 0 }}
            >
              Solicitud de servicios y materiales a aprobar
            </Typography.Title>
            <Row gutter={24} style={{ marginTop: 16 }}>
              {/* Columna de servicios a aprobar */}
              <Col xs={24} md={12}>
                <Typography.Title level={5} style={{ textAlign: "center" }}>
                  Servicios a aprobar
                </Typography.Title>
                {loading ? (
                  <Spin />
                ) : serviciosApro.length === 0 ? (
                  <Empty description="Sin solicitudes de servicios" />
                ) : (
                  serviciosApro.map((item) => (
                    <SolicitudAprobarCard
                      key={item.id}
                      data={item}
                      tipo="servicio"
                      onActionSuccess={handleSolicitudUpdate}
                    />
                  ))
                )}
              </Col>
              {/* Columna de materiales a aprobar */}
              <Col xs={24} md={12}>
                <Typography.Title level={5} style={{ textAlign: "center" }}>
                  Material a aprobar
                </Typography.Title>
                {loading ? (
                  <Spin />
                ) : materialesApro.length === 0 ? (
                  <Empty description="Sin solicitudes de materiales" />
                ) : (
                  materialesApro.map((item) => (
                    <SolicitudAprobarCard
                      key={item.id}
                      data={item}
                      tipo="material"
                      onActionSuccess={handleSolicitudUpdate}
                    />
                  ))
                )}
              </Col>
            </Row>
          </Collapse.Panel>
        )}
      </Collapse>
      {rolesBorrado.includes(user.role) && (
        <Button
          danger
          type="primary"
          icon={<DeleteOutlined />}
          onClick={() => borradoProyecto()}
          style={{
            width: 100,
            marginTop: 16,
            alignContent: "center",
            alignItems: "center",
          }}
        >
          Borrado
        </Button>
      )}
      <Modal
        title={
          proyecto.estado.nombre === "En pausa"
            ? "Reanudar Proyecto"
            : "Pausar Proyecto"
        }
        open={isPauseModalVisible}
        onOk={handlePauseSubmit}
        onCancel={() => {
          setIsPauseModalVisible(false);
          pauseForm.resetFields();
        }}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <Form form={pauseForm} layout="vertical">
          <Form.Item
            name="comentario"
            label="Motivo"
            rules={[{ required: true, message: "El motivo es obligatorio." }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal para Cancelar y Reactivar */}
      <Modal
        title={
          proyecto.estado.nombre === "Cancelado"
            ? "Reactivar Proyecto"
            : "Cancelar Proyecto"
        }
        open={isCancelModalVisible}
        onOk={handleCancelSubmit}
        onCancel={() => {
          setIsCancelModalVisible(false);
          cancelForm.resetFields();
        }}
        okText="Confirmar"
        cancelText="Cancelar"
      >
        <Form form={cancelForm} layout="vertical">
          <Form.Item
            name="comentario"
            label="Motivo"
            rules={[{ required: true, message: "El motivo es obligatorio." }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
}
