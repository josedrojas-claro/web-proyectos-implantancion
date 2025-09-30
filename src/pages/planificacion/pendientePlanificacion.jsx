import React, { useState, useEffect, useCallback } from "react";
import MainLayout from "../../layout/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import { Row, Typography, Space, Col, Spin, Button, Flex } from "antd";
import ItemResumen from "../../components/CardItemResumen";
import { fetchServiciosAsignadosByProyecto } from "../../services/serviciosServices";
import { fetchMaterialesAsignadosByProyecto } from "../../services/materialesServices";
import { descargarExcelFormatoPlanificacion } from "../../services/bitacoraFinalServices";
import { cambiarEstadoProyecto } from "../../services/proyectoServices";
import { useAuthUser } from "../../services/authServices";
import Swal from "sweetalert2";

export default function PendientePlanifacion() {
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleCambiarEstado = async (id) => {
    const confirmacion = await Swal.fire({
      title: "Confirmación de Envío",
      html: `
      <p>Antes de continuar, confirma que ya enviaste o tienes listo el formato requerido para <strong>Soporte</strong> y <strong>Gestión</strong>.</p>
      <p><strong>Solo cambia el estado cuando estés seguro de que el envío se realizó correctamente.</strong></p>
    `,
      icon: "info",
      input: "checkbox",
      inputValue: 0,
      inputPlaceholder:
        "Confirmo que ya envié o tengo listo el formato para Soporte y Gestión.",
      confirmButtonText: "Sí, cambiar estado",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      inputValidator: (result) => {
        return !result && "Debes marcar la casilla para confirmar.";
      },
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const response = await cambiarEstadoProyecto(id);
      await Swal.fire({
        title: "¡Estado actualizado!",
        text:
          response.message || "El estado del proyecto se cambió correctamente.",
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
      <h2>Enviar a planificar adicionales</h2>

      <Flex justify="center">
        <ProyectoResumenCard proyecto={proyecto} />
      </Flex>
      <Flex
        justify="center"
        style={{ marginTop: "10px", marginBottom: "10px" }}
      >
        <Button
          onClick={handleDescargarFormatoPlanificacion}
          type="primary"
          loading={isDownloading}
          style={{ minWidth: "200px", width: "200px" }}
        >
          Formato Planificacion
        </Button>
      </Flex>

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
