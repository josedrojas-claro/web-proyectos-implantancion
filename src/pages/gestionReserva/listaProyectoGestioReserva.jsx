import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";
import MainLayout from "../../layout/MainLayout";
import { fetchListaProyectosGestionReserva } from "../../services/proyectoServices";
import { getEstadoColor } from "../../utils/colorUtils";
import { useNavigate } from "react-router-dom";
import { Table, Input, Typography, Alert, Tag, Space, Button } from "antd";

const { Title } = Typography;
const { Search } = Input;

// Definimos cuántos resultados queremos por página
const ITEMS_PER_PAGE = 10;

export default function ListaProyectoGestionReserva() {
  // --- El estado del componente y la lógica de carga de datos se mantienen igual ---
  const [proyectos, setProyectos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const loadProyectos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const data = await fetchListaProyectosGestionReserva(
        ITEMS_PER_PAGE,
        offset,
        debouncedSearch
      );
      setProyectos(data.proyectos);
      setTotalItems(data.totalItems);
    } catch (err) {
      setError(
        err.message ||
          "No se pudieron cargar los proyectos. Inténtalo de nuevo más tarde."
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  useEffect(() => {
    loadProyectos();
  }, [loadProyectos]);

  const columns = [
    {
      title: "Ticket",
      dataIndex: "ticketCode",
      key: "ticketCode",
    },
    {
      title: "Nombre Proyecto",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Supervisor Contratista",
      key: "supervisor",
      // Usamos la función 'render' para mostrar datos anidados o formateados
      render: (_, record) =>
        record.SupervisorContratista?.UserData?.nombre ?? "No asignado",
    },
    {
      title: "Estado",
      key: "estado",
      dataIndex: "estado",
      render: (text, record) => (
        // El componente <Tag> es perfecto para mostrar estados
        <Tag color={getEstadoColor(record.estado?.nombre)}>
          {record.estado?.nombre}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleReserva(record)}>
            {record.estado?.nombre === "Gestion Reserva"
              ? "Agregar Reserva"
              : "Ver Reserva"}
          </Button>
        </Space>
      ),
    },
  ];

  const navigate = useNavigate();

  const handleReserva = (proyectoSeleccionado) => {
    navigate(
      `/lista-proyectos-gestion-reserva/gestion-reserva/${proyectoSeleccionado.ticketCode}`,
      {
        state: { proyectoSeleccionado },
      }
    );
  };

  return (
    <MainLayout>
      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%", padding: "24px" }}
      >
        <Title level={2}>Lista de Proyectos - Gestión de Reserva</Title>
        <Search
          placeholder="Buscar por nombre o ticket..."
          onSearch={(value) => setSearchTerm(value)} // onSearch se activa con Enter o clic
          onChange={(e) => setSearchTerm(e.target.value)} // onChange para búsqueda en tiempo real
          loading={isLoading}
          enterButton
          style={{ maxWidth: 400 }}
        />

        {/* Mostramos una alerta si hay un error */}
        {error && <Alert message={error} type="error" showIcon />}

        <Table
          columns={columns}
          dataSource={proyectos}
          rowKey="id" // Clave única para cada fila
          loading={isLoading} // El componente Table tiene su propio indicador de carga
          pagination={{
            current: currentPage,
            pageSize: ITEMS_PER_PAGE,
            total: totalItems,
            // El 'onChange' de la paginación nos da la nueva página directamente
            onChange: (page) => setCurrentPage(page),
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} items`,
          }}
        />
      </Space>
    </MainLayout>
  );
}
