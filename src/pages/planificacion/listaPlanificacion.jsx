import React, { useState, useEffect, useCallback } from "react";
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
} from "antd";
import {
  SearchOutlined,
  ClearOutlined,
  EyeOutlined,
  VerticalAlignTopOutlined,
  FullscreenExitOutlined,
} from "@ant-design/icons";
import { getEstadoColor } from "../../utils/colorUtils";
import MainLayout from "../../layout/MainLayout";
import { fetchProyectosEnPlanificacion } from "../../services/proyectoServices";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { cambiarEstadoProyecto } from "../../services/proyectoServices";

const { Title } = Typography;
const { Option } = Select;

// Define las columnas de la tabla fuera del componente para optimizar el rendimiento.

const initialFilters = {
  search: "",
  estados: [],
  page: 1,
  limit: 10,
};

export default function ListaPlanificacion() {
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
      render: (text, record) => {
        // --- Lógica para el segundo botón (condicional) ---
        let actionButton = null;
        const estado = record.estado?.nombre;

        if (estado === "Alcances Preliminares") {
          actionButton = (
            <Button size="small" onClick={() => handleCargarAlcances(record)}>
              Cargar Alcances
            </Button>
          );
        } else if (
          estado === "En planificación" ||
          estado === "Con Correlativo" ||
          estado === "Con SOLPED"
        ) {
          actionButton = (
            <Button size="small" onClick={() => handleVerSolped(record)}>
              Ver Data
            </Button>
          );
        } else if (estado === "Con PO") {
          actionButton = (
            <Button size="small" onClick={() => handleAsignar(record)}>
              Asignar
            </Button>
          );
        }

        return (
          <Space size="middle">
            {/* Botón 1: Mostrar Modal con Detalles */}
            <Button
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleVerDetalles(record)}
            >
              Vista Rapida
            </Button>

            {/* Botón 2: Se renderiza solo si cumple una de las condiciones */}
            {actionButton}
          </Space>
        );
      },
    },
  ];

  const navigate = useNavigate();

  const handleCargarAlcances = (proyectoSeleccionado) => {
    navigate(
      `/lista-proyectos-planificacion/alances-preliminares/${proyectoSeleccionado.ticketCode}`,
      {
        state: { proyectoSeleccionado },
      }
    );
  };

  const handleVerSolped = (proyectoSeleccionado) => {
    navigate(
      `/lista-proyectos-planificacion/ver-solpeds/${proyectoSeleccionado.ticketCode}`,
      {
        state: { proyectoSeleccionado },
      }
    );
  };

  const handleCargaSolpedMasiva = () => {
    navigate(`/lista-proyectos-planificacion/carga-solpeds-masiva`);
  };

  const handleCargaPO = () => {
    navigate(`/lista-proyectos-planificacion/carga-po-masiva`);
  };

  const handleAsignar = async (proyectoSeleccionado) => {
    // --- PASO 1: Confirmación más detallada ---
    // Usamos la propiedad `html` para mostrar más información y dar formato.
    const confirmacion = await Swal.fire({
      title: "¿Confirmar Envío a Ejecución?",
      icon: "warning",
      html: `
      <p>Estás a punto de cambiar el estado del proyecto:</p>
      <div style="text-align: left; display: inline-block; margin-top: 10px; padding: 10px; border-radius: 5px; background-color: #f9f9f9;">
        <strong>Ticket:</strong> ${proyectoSeleccionado.ticketCode}<br/>
        <strong>Nombre:</strong> ${proyectoSeleccionado.nombre}
      </div>
      <p style="margin-top: 15px;">El nuevo estado será: <strong>"Pendiente Asignación"</strong>.</p>
      <p>¿Deseas continuar?</p>
    `,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, ¡Asignar!",
      cancelButtonText: "Cancelar",
    });

    // Si el usuario confirma la acción...
    if (confirmacion.isConfirmed) {
      try {
        // --- PASO 2: Mostrar un mensaje de "cargando" mientras se ejecuta la API ---
        Swal.fire({
          title: "Asignando proyecto...",
          text: "Por favor espera.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Llamamos a la API para cambiar el estado
        const response = await cambiarEstadoProyecto(proyectoSeleccionado.id);

        // Recargamos la lista de proyectos en segundo plano
        await loadProyectos(initialFilters);

        // --- PASO 3: Mostrar mensaje de éxito ---
        // Cerramos el 'loading' y mostramos el éxito
        Swal.fire({
          icon: "success",
          title: "¡Proyecto Asignado!",
          text:
            response.message ||
            "El proyecto fue enviado a ejecución correctamente.",
          timer: 2500, // Se cierra solo después de 2.5 segundos
          showConfirmButton: false,
        });
      } catch (error) {
        // --- PASO 4: Manejar errores si la API falla ---
        console.error("Error al asignar el proyecto:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo asignar el proyecto. Por favor, intenta de nuevo.",
        });
      }
    }
  };
  // --- 1. ESTADOS ---
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
        const response = await fetchProyectosEnPlanificacion({
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
  ); // Depende de `opcionesDeEstado` para no resetearlas

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

  ///data para el modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  const handleVerDetalles = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setProyectoSeleccionado(null);
  };

  return (
    <MainLayout>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2}>Proyectos en Planificación</Title>

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
                <Button
                  color="cyan"
                  variant="solid"
                  onClick={handleCargaSolpedMasiva}
                  icon={<VerticalAlignTopOutlined />}
                >
                  Carga Solped Masiva
                </Button>
                <Button
                  onClick={handleCargaPO}
                  color="danger"
                  variant="solid"
                  icon={<FullscreenExitOutlined />}
                >
                  Carga PO's
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
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: proyectosData.totalItems,
            onChange: handlePaginationChange,
            showSizeChanger: true,
          }}
        />
      </Space>
      {proyectoSeleccionado && (
        <Modal
          title={`Detalles del Proyecto: ${proyectoSeleccionado.nombre}`}
          visible={isModalVisible}
          onOk={handleCloseModal}
          onCancel={handleCloseModal}
          width={1000}
        >
          {/* Aquí pones el contenido del modal, por ejemplo un componente <DetallesProyecto /> */}
          <p>Ticket: {proyectoSeleccionado.ticketCode}</p>
          <p>Estado: {proyectoSeleccionado.estado?.nombre}</p>
          {/* ... más detalles ... */}
        </Modal>
      )}
    </MainLayout>
  );
}
