import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Space,
  Button,
  Row,
  Col,
  Card,
  Statistic,
  Flex,
  Divider,
} from "antd";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import ItemResumen from "../../components/CardItemResumen";

import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
import { fetchMaterialesAsignadosByProyecto } from "../../services/materialesServices";
import { useAuthUser } from "../../services/authServices";
import Swal from "sweetalert2";
import { cambioEstadoRdoDinamico } from "../../services/proyectoServices";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function RdoPage() {
  // --- Toda tu lógica de React (hooks, estados, funciones) se mantiene igual ---
  const location = useLocation();
  const proyecto = location.state?.proyecto;
  const navigate = useNavigate();
  const user = useAuthUser();
  const [loadingNuevoEstado, setLoadingNuevoEstado] = useState(false);
  const [servicios, setServicios] = useState([]);
  const [materiales, setMateriales] = useState([]);

  useEffect(() => {
    // Esta lógica de carga de datos no cambia
    const cargarDatos = async () => {
      try {
        const [serviciosData, materialesData] = await Promise.all([
          fetchServiciosAsignadosByProyecto(proyecto.id),
          fetchMaterialesAsignadosByProyecto(proyecto.id),
        ]);
        setServicios(serviciosData);
        setMateriales(materialesData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    cargarDatos();
  }, [proyecto.id]);

  //funcion para cambio de estado
  // Función para realizar el cambio de estado del proyecto
  const cambioEstado = async () => {
    let comentario;
    let textBotton;
    if (proyecto.havePo) {
      comentario =
        "Este proyecto pasará de RDO a 'Conciliacion de Materiales'. Valida la informacion antes de hacer el cambio";
      textBotton = "Si, enviar a Conciliacion";
    } else {
      comentario =
        "Este proyecto pasará de RDO a 'Pendiente planificacion'. No podrás revertir este cambio fácilmente";
      textBotton = "Si, enviar a planificación";
    }
    try {
      // Confirmación al usuario
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: comentario,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: textBotton,
        cancelButtonText: "Cancelar",
      });

      if (!result.isConfirmed) return;

      // Cambio de estado
      setLoadingNuevoEstado(true);
      const response = await cambioEstadoRdoDinamico(proyecto.id);

      // Mensaje de éxito con auto cierre y navegación al cerrar
      await Swal.fire({
        title: "¡Éxito!",
        text:
          response.message.message ||
          "El estado del proyecto ha sido actualizado.",
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
        text:
          error?.response?.data?.message ||
          "Error al cambiar el estado del proyecto.",
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
      <Layout>
        <Content style={{ padding: "24px" }}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {/* --- Encabezado de la Página --- */}
            <Title level={3} style={{ textAlign: "center" }}>
              Generador de RDO
            </Title>

            {/* --- Resumen del Proyecto --- */}
            <Flex justify="center">
              <ProyectoResumenCard proyecto={proyecto} />
            </Flex>
            {/* --- Botón de Acción --- */}
            <div style={{ textAlign: "center" }}>
              {["admin", "planificador", "lider", "supervisor"].includes(
                user.role
              ) && (
                <Button
                  type="primary"
                  danger
                  onClick={cambioEstado}
                  loading={loadingNuevoEstado} // AntD usa 'loading' para mostrar el spinner
                  style={{ minWidth: "200px", width: "200px" }}
                >
                  Cambio de estado
                </Button>
              )}
            </div>

            <Divider />

            {/* --- Listas de Servicios y Materiales --- */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card title="Servicios">
                  <ItemResumen
                    dataSource={servicios}
                    tipo="Servicio"
                    role={user.role}
                  />
                  {["admin", "planificador"].includes(user.role) && (
                    <Statistic
                      title="Total Servicios (USD)"
                      value={totalPrecioEjecutadoServicio}
                      precision={2}
                      style={{ textAlign: "right", marginTop: "16px" }}
                    />
                  )}
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Materiales">
                  <ItemResumen
                    dataSource={materiales}
                    tipo="Material"
                    role={user.role}
                  />
                  {["admin", "planificador"].includes(user.role) && (
                    <Statistic
                      title="Total Materiales (USD)"
                      value={totalPrecioEjecutadoMaterial}
                      precision={2}
                      style={{ textAlign: "right", marginTop: "16px" }}
                    />
                  )}
                </Card>
              </Col>
            </Row>

            {/* --- Total General --- */}
            {["admin", "planificador"].includes(user.role) && (
              <Card style={{ backgroundColor: "#1890ff", color: "white" }}>
                <Statistic
                  title={
                    <Text style={{ color: "white" }}>Total General (USD)</Text>
                  }
                  value={sumaTotal}
                  precision={2}
                  valueStyle={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "28px",
                  }}
                />
              </Card>
            )}
          </Space>
        </Content>
      </Layout>
    </MainLayout>
  );
}
