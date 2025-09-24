import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../../layout/MainLayout";
import { useLocation } from "react-router-dom";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import { Row, Typography, Space, Col, Spin, Button } from "antd";
import ItemResumen from "../../components/CardItemResumen";
import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
import { fetchMaterialesAsignadosByProyecto } from "../../services/materialesServices";
import { descargarExcelFormatoPlanificacion } from "../../services/bitacoraFinalServices";
import { useAuthUser } from "../../services/authServices";
import Swal from "sweetalert2";

export default function PendientePlanifacion() {
  const location = useLocation();

  const proyecto = location.state?.proyectoSeleccionado;
  const user = useAuthUser();
  const userRole = user?.role;

  const [servicios, setServicios] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    try {
      const [dataServicios, dataMateriales] = await Promise.all([
        fetchServiciosAsignadosByProyecto(proyecto.id),
        fetchMaterialesAsignadosByProyecto(proyecto.id),
      ]);
      setServicios(dataServicios);
      setMateriales(dataMateriales);
    } catch (error) {
      console.error("Error al cargar datos: ", error);
    } finally {
      setLoading(false);
    }
  }, [proyecto.id]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]); // Dependencia actualizada a cargarTodo

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  const handleDescargarFormatoPlanificacion = async () => {
    Swal.fire({
      title: "Generando archivo previo planificar",
      text: "Por favor, espera mientras preparamos tu archivo...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setIsDownloading(true);
    try {
      await descargarExcelFormatoPlanificacion(proyecto.id);
      Swal.fire({
        icon: "success",
        title: "¡Descarga Exitosa!",
        text: "Tu archivo se ha descargado correctamente.",
        timer: 2000, // Close automatically after 2 seconds
        showConfirmButton: false,
      });
    } catch (error) {
      // 5. Show an error message if anything fails
      console.error("Error al descargar el archivo:", error);
      Swal.fire({
        icon: "error",
        title: "Error en la Descarga",
        text: "No se pudo generar el archivo. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsDownloading(false);
    }
  };
  return (
    <MainLayout>
      <h2>Enviar a planificar adicionales</h2>

      <ProyectoResumenCard proyecto={proyecto} />
      <Button
        onClick={handleDescargarFormatoPlanificacion}
        type="primary"
        loading={isDownloading}
      >
        Primary Button
      </Button>

      <Row gutter={[16, 16]} wrap>
        {/* Servicios */}
        <Col xs={24} md={12}>
          <Typography.Title level={5}>Servicios</Typography.Title>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <ItemResumen
              dataSource={servicios}
              tipo="Servicio"
              role={userRole}
              contratistaId={proyecto.contratistaId}
            />
          </Space>
        </Col>

        {/* Materiales */}
        <Col xs={24} md={12}>
          <Typography.Title level={5}>Materiales</Typography.Title>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <ItemResumen
              dataSource={materiales}
              tipo="Material"
              role={userRole}
            />
          </Space>
        </Col>
      </Row>
    </MainLayout>
  );
}
