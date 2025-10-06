import React, { useCallback, useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout"; // Asegúrate de que la ruta sea correcta
import {
  Table,
  Input,
  Select,
  Button,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Modal,
  Descriptions,
} from "antd";
import { useNavigate } from "react-router-dom";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";
import { listaProyectosLiquidacion } from "../../services/proyectoServices";
import { getEstadoColor } from "../../utils/colorUtils";

const { Title } = Typography;

const initialFilters = {
  search: "",
  estados: [],
  page: 1,
  limit: 10,
};
export default function ListaProyectosLiquidar() {
  const navigate = useNavigate();

  const columns = [
    {
      title: "Ticket",
      dataIndex: "ticketCode",
      key: "ticketCode",
      sorter: (a, b) => a.ticketCode - b.ticketCode,
    },
    {
      title: "Nombre Proyecto",
      dataIndex: "nombre",
      key: "nombre",
    },

    {
      title: "Contratista",
      dataIndex: ["Contratistas", "nombre_contratista"],
      key: "contratista",
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
      render: (text, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              handleDetallesLiquidar(record);
            }}
          >
            Ver Detalles
          </Button>
        </Space>
      ),
    },
  ];

  const handleDetallesLiquidar = (proyectoSeleccionado) => {
    navigate(
      `/lista-liquidacion-proyectos/detalles-para-liquidar/${proyectoSeleccionado.ticketCode}`,
      {
        state: { proyectoSeleccionado },
      }
    );
  };

  const [loading, setLoading] = useState(false);
  const [proyectosData, setProyectosData] = useState({
    proyectos: [],
    totalItems: 0,
  });
  const [opcionesDeEstado, setOpcionesDeEstado] = useState([]);
  const [filters, setFilters] = useState(initialFilters);

  const loadProyectos = useCallback(
    async (filtersToUse) => {
      setLoading(true);
      try {
        const response = await listaProyectosLiquidacion({
          limit: filtersToUse.limit,
          offset: (filtersToUse.page - 1) * filtersToUse.limit,
          search: filtersToUse.search,
          estados: filtersToUse.estados,
        });
        setProyectosData(response);

        // Solo actualizamos las opciones de estado si la lista está vacía (carga inicial)
        if (opcionesDeEstado.length === 0) {
          setOpcionesDeEstado(response.estados || []);
        }
      } catch (error) {
        console.error("Error al cargar los proyectos:", error);
      } finally {
        setLoading(false);
      }
    },
    [opcionesDeEstado.length]
  );

  useEffect(() => {
    loadProyectos(initialFilters);
  }, [loadProyectos]);

  // --- 3. MANEJADORES DE EVENTOS ---
  const handleInputChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePaginationChange = (page, pageSize) => {
    const newFilters = { ...filters, page, limit: pageSize };
    setFilters(newFilters);
    loadProyectos(newFilters); // La paginación sí debe ser inmediata
  };

  // --- CAMBIO 4: Nuevas funciones para los botones de Buscar y Limpiar ---
  const handleSearch = () => {
    // Al buscar, siempre volvemos a la página 1
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    loadProyectos(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    loadProyectos(initialFilters);
  };

  const isFiltersActive = filters.search !== "" || filters.estados.length > 0;

  return (
    <MainLayout>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2}>Proyectos en Liquidacion</Title>

        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Buscar por nombre, Ticket"
                value={filters.search}
                onChange={(e) => handleInputChange("search", e.target.value)}
                onPressEnter={handleSearch} // Permite buscar con la tecla Enter
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="Filtrar por estado"
                onChange={(value) => handleInputChange("estados", value)}
                options={opcionesDeEstado.map((e) => ({
                  label: `${e.nombre} (${e.count})`,
                  value: e.nombre,
                }))}
              ></Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Space>
                <Button
                  type="primary"
                  onClick={handleSearch}
                  icon={<SearchOutlined />}
                >
                  Buscar
                </Button>
                <Button
                  onClick={handleClearFilters}
                  disabled={!isFiltersActive}
                  icon={<ClearOutlined />}
                >
                  Limpiar
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>
        <Table
          columns={columns}
          dataSource={proyectosData.proyectos}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: proyectosData.totalItems,
            onChange: handlePaginationChange,
            showSizeChanger: true,
          }}
        />
      </Space>
    </MainLayout>
  );
}
