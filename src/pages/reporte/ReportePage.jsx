import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { fetchEstadisticaHorasRetraso, fetchTiempoTrancision } from "../../services/proyectoServices";
import { Row, Col, Typography, Spin, Alert, Space, Button } from "antd";

// Importa los nuevos componentes que crearemos
import StatCard from "./components/StatCard";
import ProjectsTable from "./components/ProjectsTable";
import EstadoBarChart from "./components/EstadoBarChart";
import TopRetrasoPorEstado from "./components/TopRetrasoPorEstado.";
import PromedioRetrasoChart from "./components/PromedioRetrasoChart";
import TransicionChart from "./components/TransicionesChart";
import GrafoDeEstados from "./components/GrafoDeEstados";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export default function ReportePage() {
  const navigate = useNavigate();

  const [estadisticas, setEstadisticas] = useState(null);
  const [estadisticasDeTransicion, setEstadisticasDeTransicion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStats = async () => {
      try {
        const data = await fetchEstadisticaHorasRetraso();
        const data1 = await fetchTiempoTrancision();
        setEstadisticas(data);
        setEstadisticasDeTransicion(data1);
      } catch (err) {
        setError("No se pudieron cargar las estadísticas.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    getStats();
  }, []);

  // Estado de carga con el componente Spin de AntD
  if (isLoading) {
    return (
      <MainLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  // Estado de error con el componente Alert de AntD
  if (error) {
    return (
      <MainLayout>
        <Alert message="Error" description={error} type="error" showIcon style={{ margin: "24px" }} />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: 24 }}>
        <div style={{ marginBottom: "24px" }}>
          <Space align="center" size="large">
            <Title level={2} style={{ margin: 0 }}>
              Dashboard de Proyectos
            </Title>

            <Button
              size="small" // Para que el botón sea pequeño
              color="pink"
              variant="solid"
              onClick={() => navigate("/lista-proyectos-reporte-horas-retraso")}
            >
              Ir a la lista
            </Button>
          </Space>
        </div>
        <Row gutter={[24, 24]} style={{ marginBottom: 15 }}>
          <Col xd={24} sm={24} md={6} lg={6}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <StatCard title="Promedio Retraso" value={estadisticas.promedioHorasRetraso.toFixed(2)} suffix="hrs" />
              <StatCard
                title="Promedio Ejecución"
                value={estadisticas.promedioHorasEjecucion.toFixed(2)}
                suffix="hrs"
              />
              <StatCard title="Promedio Retraso" value={estadisticas.promedioDiasRetraso.toFixed(1)} suffix="días" />
              <StatCard
                title="Promedio Ejecución"
                value={estadisticas.promedioDiasEjecucion.toFixed(1)}
                suffix="días"
              />
            </Space>
          </Col>
          <Col xs={24} sm={24} md={18} lg={18}>
            <EstadoBarChart data={estadisticas.resumenPorEstado} />
          </Col>
        </Row>
        <Col span={24}>
          <PromedioRetrasoChart data={estadisticas.promedioRetrasoPorEstado} />
        </Col>
        <Col span={24}>
          <TransicionChart data={estadisticasDeTransicion} />
        </Col>

        <Col span={16} offset={4} style={{ marginBottom: 15 }}>
          <ProjectsTable
            title="Top 10 Proyectos con Más Retraso"
            projects={estadisticas.top5ProyectosRetrasados}
            headers={["Ticket", "Nombre", "Horas Retraso", "Supervisor"]}
            dataKeys={["ticketCode", "nombreProyecto", "horasRetraso", "supervisorAsignado"]}
          />
        </Col>
        <Col span={16} offset={4} style={{ marginBottom: 15 }}>
          <ProjectsTable
            title="Top 10 Proyectos en Ejecución (Horas Transcurridas)"
            projects={estadisticas.top5HorasEjecucion}
            headers={["Ticket", "Nombre", "Horas Transcurridas", "Supervisor"]}
            dataKeys={["ticketCode", "nombreProyecto", "horasTranscurridas", "supervisorAsignado"]}
          />
        </Col>
        <Col span={24}>
          <TopRetrasoPorEstado data={estadisticas.top3RetrasoPorEstado} />
        </Col>
      </div>
    </MainLayout>
  );
}
