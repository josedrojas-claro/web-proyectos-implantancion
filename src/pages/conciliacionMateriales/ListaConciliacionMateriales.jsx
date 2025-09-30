import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Typography,
  Input,
  Space,
  Tag,
  Button,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import { listaProyectosConciliacion } from "../../services/proyectoServices";
import { getEstadoColor } from "../../utils/colorUtils";

const { Title } = Typography;
const { Search } = Input;

export default function ListaConciliacionMateriales() {
  const navigate = useNavigate();

  // --- Estados del Componente ---
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // --- Lógica de Carga de Datos ---
  const fetchProyectos = useCallback(async (page, size, search) => {
    setLoading(true);
    try {
      // Calcula el offset para la API
      const offset = (page - 1) * size;
      const response = await listaProyectosConciliacion(size, offset, search);

      setProyectos(response.proyectos);
      setPagination((prev) => ({
        ...prev,
        total: response.totalItems,
        current: response.currentPage,
      }));
    } catch (error) {
      console.error("Error al cargar los proyectos:", error);
      message.error("No se pudieron cargar los proyectos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Efecto para Cargar Datos al Montar o al Cambiar ---
  useEffect(() => {
    fetchProyectos(pagination.current, pagination.pageSize, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, searchTerm, fetchProyectos]);

  // --- Manejadores de Eventos ---
  const handleSearch = (value) => {
    setSearchTerm(value);
    // Vuelve a la primera página al realizar una nueva búsqueda
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  // --- Definición de las Columnas de la Tabla ---
  const columns = [
    {
      title: "Ticket",
      dataIndex: "ticketCode",
      key: "ticketCode",
    },
    {
      title: "Nombre del Proyecto",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Contratista",
      dataIndex: ["Contratistas", "nombre_contratista"], // Acceso a datos anidados
      key: "contratista",
    },
    {
      title: "Sitio",
      dataIndex: ["Sitios", "nombre_sitio"],
      key: "sitio",
    },
    {
      title: "Estado",
      dataIndex: ["estado", "nombre"],
      key: "estado",
      render: (text, record) => (
        <Tag color={getEstadoColor(record.estado?.nombre)}>
          {record.estado?.nombre}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() =>
            navigate(
              `/lista-conciliacion-materiales/detalles/${record.ticketCode}`,
              {
                state: { record },
              }
            )
          }
        >
          Ver Detalles
        </Button>
      ),
    },
  ];

  return (
    <MainLayout>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Title level={3}>Proyectos en Conciliación de Materiales</Title>
        <Search
          placeholder="Buscar por nombre, correlativo, sitio..."
          onSearch={handleSearch}
          enterButton
          style={{ maxWidth: "400px" }}
        />
        <Table
          columns={columns}
          dataSource={proyectos}
          loading={loading}
          rowKey="id"
          pagination={pagination}
          onChange={handleTableChange}
          bordered
        />
      </Space>
    </MainLayout>
  );
}
