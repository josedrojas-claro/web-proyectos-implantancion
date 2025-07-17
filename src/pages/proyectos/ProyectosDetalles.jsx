import React, { useState, useEffect, useCallback } from "react"; // Asegúrate de importar useCallback
import MainLayout from "../../layout/MainLayout";
import { useParams, useLocation } from "react-router-dom";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import InfoProyecto from "./components/InfoProyecto";
import HistorialProyecto from "./components/HistorialProyecto";
import ListaDocumentos from "../ejecucionDiaria/components/ListaDocumentos";
import { Typography, Space, Row, Col, Divider, Spin, Empty } from "antd";
import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
import { fetchMaterialesAsignadosByProyecto } from "../../services/materialesServices";
import CardServicioResumen from "../../components/CardServicioResumen";
import CardMaterialResumen from "../../components/CardMaterialResumen";
import { useAuthUser } from "../../services/authServices";
// se usa el mismo enpoint para actualizar la aprobacion de servicio y material el update
import { fetchServiciosSolicutudAproRecha } from "../../services/serviciosServices";
import { fetchMaterialesSolicutudAproRecha } from "../../services/materialesServices";
import SolicitudAprobarCard from "./components/SolicitudAprobarCard";

const { Title } = Typography;

export default function ProyectoDetalles() {
  const { ticketCode } = useParams();
  const location = useLocation();
  const proyecto = location.state?.proyecto;
  const user = useAuthUser();

  const [servicios, setServicios] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [serviciosApro, setServiciosApro] = useState([]);
  const [materialesApro, setMaterialesApro] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carga inicial de todos los datos
  const cargarTodo = useCallback(async () => {
    setLoading(true);
    try {
      const [dataServicios, dataMateriales, dataServiciosApro, dataMaterialesApro] = await Promise.all([
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

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  const rolesConPermiso = ["admin", "lider", "planificador"];
  const rolesParaAprobar = ["admin", "planificador"];

  return (
    <MainLayout>
      <Title level={3} strong={true}>
        Detalles de proyecto para ticket: {ticketCode}
      </Title>
      <ProyectoResumenCard proyecto={proyecto} />
      <InfoProyecto proyecto={proyecto} />
      <Space direction="horizontal" size={25}>
        <ListaDocumentos proyectoId={proyecto.id} ventana={true} />
        <ListaDocumentos proyectoId={proyecto.id} ventana={true} docFirmados={true} />
      </Space>
      <Divider />
      <HistorialProyecto proyectoId={proyecto.id} />
      <Row gutter={[16, 16]} wrap>
        {/* Servicios */}
        <Col xs={24} md={12}>
          <Typography.Title level={5}>Servicios</Typography.Title>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {servicios.map((item, index) => (
              <CardServicioResumen key={item.id || index} item={item} index={index} role={user.role} />
            ))}
            {/* Condición para mostrar el total de servicios */}
            {rolesConPermiso.includes(user.role) && (
              <Typography.Text strong style={{ textAlign: "center", display: "block" }}>
                Total Servicios: {proyecto.totalServiciosUsd.toFixed(2)} USD
              </Typography.Text>
            )}
          </Space>
        </Col>

        {/* Materiales */}
        <Col xs={24} md={12}>
          <Typography.Title level={5}>Materiales</Typography.Title>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {materiales.map((item, index) => (
              <CardMaterialResumen key={item.id || index} item={item} index={index} role={user.role} />
            ))}
            {/* Condición para mostrar el total de materiales */}
            {rolesConPermiso.includes(user.role) && (
              <Typography.Text strong style={{ textAlign: "center", display: "block" }}>
                Total Materiales: {proyecto.totalMaterialesUsd.toFixed(2)} USD
              </Typography.Text>
            )}
          </Space>
        </Col>
      </Row>

      <Divider />

      {/* Condición para mostrar el total general */}
      {rolesConPermiso.includes(user.role) && (
        <Typography.Title level={5} style={{ textAlign: "center" }}>
          Total General: {proyecto.totalProyectoUsd.toFixed(2)} USD
        </Typography.Title>
      )}
      {rolesParaAprobar.includes(user.role) && (
        <>
          <Typography.Title level={4} style={{ textAlign: "center", margin: 0 }}>
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
        </>
      )}
    </MainLayout>
  );
}
