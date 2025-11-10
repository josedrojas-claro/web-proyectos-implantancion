import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";

import MainLayout from "../../../layout/MainLayout";
import {
  fecthListaSitios,
  createSitio,
  updateSitio,
  deleteSitio,
  fecthListaZonificaiones,
  fetchListaMunicipios,
} from "../../../services/sitiosServices"; // Assuming these services exist
import { useAuthUser } from "../../../services/authServices"; // Importa el hook para obtener el usuario autenticado

const { Title } = Typography;

const ListaSitios = () => {
  const user = useAuthUser(); // Obtiene la información del usuario autenticado

  // Asegúrate de que user y user.UserData existan antes de intentar acceder a user.UserData.rol
  const userRole = user?.role;
  // --- 1. STATE MANAGEMENT ---
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sitiosData, setSitiosData] = useState({ data: [], totalItems: 0 });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSitio, setEditingSitio] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  });
  const [zonificaciones, setZonificaciones] = useState([]);
  const [loadingZonificaciones, setLoadingZonificaciones] = useState(false);

  const [municipios, setMunicipios] = useState([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // --- 2. DATA FETCHING ---
  const loadSitios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fecthListaSitios({
        limit: filters.limit,
        offset: (filters.page - 1) * filters.limit,
        search: filters.search,
      });
      setSitiosData(response);
    } catch (error) {
      console.error("Error fetching sites:", error);
      Swal.fire("Error", "No se pudieron cargar los sitios.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadZonifiaciones = useCallback(async () => {
    setLoadingZonificaciones(true);
    try {
      const response = await fecthListaZonificaiones(); // tu servicio
      setZonificaciones(response);
    } catch (error) {
      console.error("Error al cargar zonificaciones:", error);
    } finally {
      setLoadingZonificaciones(false);
    }
  }, []);

  const loadMunicipios = useCallback(async () => {
    setLoadingMunicipios(true);
    try {
      const response = await fetchListaMunicipios(); // tu servicio
      setMunicipios(response);
    } catch (error) {
      console.error("Error al cargar zonificaciones:", error);
    } finally {
      setLoadingMunicipios(false);
    }
  }, []);

  useEffect(() => {
    loadSitios();
    loadZonifiaciones();
    loadMunicipios();
  }, [loadSitios, loadZonifiaciones, loadMunicipios]);

  // --- 3. CRUD HANDLERS ---
  const handleOpenModal = (sitio = null) => {
    setEditingSitio(sitio);
    form.setFieldsValue(
      sitio || { nombreSitio: "", nemonico: "", dirreccion: "" }
    );
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingSitio(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values) => {
    // Filtrar campos vacíos que no son requeridos
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    const apiCall = editingSitio
      ? updateSitio(editingSitio.id, filteredValues)
      : createSitio(filteredValues);

    const action = editingSitio ? "actualizado" : "creado";

    try {
      await apiCall;
      Swal.fire(
        "¡Éxito!",
        `El sitio ha sido ${action} correctamente.`,
        "success"
      );
      handleCloseModal();
      loadSitios();
    } catch (error) {
      console.error(
        `Error al ${action} el sitio:`,
        error.response.data.message
      );
      Swal.fire("Error", error.response.data.message, "error");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, ¡eliminar!",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteSitio(id);
          Swal.fire("¡Eliminado!", "El sitio ha sido eliminado.", "success");
          loadSitios();
        } catch (error) {
          console.error("Error al eliminar el sitio:", error);
          Swal.fire("Error", "No se pudo eliminar el sitio.", "error");
        }
      }
    });
  };

  const handlePaginationChange = (page, pageSize) => {
    setFilters((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  // --- 4. TABLE COLUMNS DEFINITION ---
  const columns = [
    {
      title: "Nombre del Sitio",
      dataIndex: "nombreSitio",
      key: "nombreSitio",
      sorter: (a, b) => a.nombreSitio.localeCompare(b.nombreSitio),
    },
    {
      title: "Nemónico",
      dataIndex: "nemonico",
      key: "nemonico",
    },
    {
      title: "Municipio",
      dataIndex: ["Municipio", "municipio"],
      key: "municipio",
      render: (_, record) => record.Municipio?.municipio || "N/A",
    },
    {
      title: "Zonificación",
      dataIndex: ["Zonificaciones", "nombreZonificacion"],
      key: "zonificacion",
      render: (_, record) => record.Zonificaciones?.nombreZonificacion || "N/A",
    },
    ...(["admin", "coordinador-ing", "coordinador-sup"].includes(userRole)
      ? [
          {
            title: "Acciones",
            key: "acciones",
            render: (_, record) => (
              <Space size="middle">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleOpenModal(record)}
                >
                  Editar
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  onClick={() => handleDelete(record.id)}
                >
                  Eliminar
                </Button>
              </Space>
            ),
          },
        ]
      : []),
  ];

  // --- 5. COMPONENT RENDER ---
  return (
    <MainLayout>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={2}>Gestión de Sitios</Title>

        <Card>
          <Row justify="space-between" align="middle">
            <Col xs={24} md={12}>
              <Input.Search
                placeholder="Buscar por nombre, nemónico, etc..."
                onSearch={handleSearch}
                style={{ width: "90%" }}
                enterButton={<SearchOutlined />}
              />
            </Col>
            {["admin", "coordinador-ing", "coordinador-sup"].includes(
              userRole
            ) && (
              <Col
                xs={24}
                md={4}
                style={{ textAlign: "right", marginTop: "10px" }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal()}
                >
                  Añadir Sitio
                </Button>
              </Col>
            )}
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={sitiosData.data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: sitiosData.totalItems,
            onChange: handlePaginationChange,
            showSizeChanger: true,
          }}
        />
      </Space>

      <Modal
        title={editingSitio ? "Editar Sitio" : "Nuevo Sitio"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null} // We will use the form's button
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="nombreSitio"
            label="Nombre del Sitio"
            rules={[
              { required: true, message: "Por favor, ingrese el nombre." },
            ]}
          >
            <Input placeholder="Ej. AEROPUERTO PUNTA HUETE" />
          </Form.Item>

          <Form.Item
            name="nemonico"
            label="Nemónico"
            rules={[
              { required: true, message: "Por favor, ingrese el nemónico." },
            ]}
          >
            <Input placeholder="Ej. MN608" />
          </Form.Item>

          <Form.Item
            name="claseObjetivo"
            label="Clase Objetivo"
            rules={[
              {
                required: true,
                message: "Por favor, ingrese la clase objetivo.",
              },
            ]}
          >
            <Input placeholder="Ej. RBS" />
          </Form.Item>

          <Form.Item
            name="centroEmpalazamiento"
            label="Centro Empalazamiento"
            rules={[
              {
                required: true,
                message: "Por favor, ingrese el centro de empalazamiento.",
              },
            ]}
          >
            <Input placeholder="Ej. E936" />
          </Form.Item>

          <Form.Item
            name="empalazamiento"
            label="Empalazamiento"
            rules={[
              {
                required: true,
                message: "Por favor, ingrese el empalazamiento.",
              },
            ]}
          >
            <Input placeholder="Ej. MANAGUA-SAN. FCO. LIBRE" />
          </Form.Item>

          <Form.Item
            name="dirreccion"
            label="Dirección"
            rules={[{ message: "Por favor, ingrese la dirección." }]}
          >
            <Input placeholder="Ej. Pista 1.34Km Norte, Aerop. Punta Huete San Francisco Libre, Managua" />
          </Form.Item>

          <Form.Item
            name="latitud"
            label="Latitud"
            rules={[{ message: "Por favor, ingrese la latitud." }]}
          >
            <Input placeholder="Ej. 12.362054" />
          </Form.Item>

          <Form.Item
            name="longitud"
            label="Longitud"
            rules={[{ message: "Por favor, ingrese la longitud." }]}
          >
            <Input placeholder="Ej. -86.170617" />
          </Form.Item>

          <Form.Item
            name="ubicacionTenica"
            label="Ubicación Técnica"
            rules={[
              {
                required: true,
                message: "Por favor, ingrese la ubicación técnica.",
              },
            ]}
          >
            <Input placeholder="Ej. NI-B-MA-SIT-SC-MN0608" />
          </Form.Item>
          <Form.Item
            name="zonficacionId"
            label="Zonificación"
            rules={[
              {
                required: true,
                message: "Por favor, seleccione una zonificación.",
              },
            ]}
          >
            <Select
              placeholder="Seleccione una zonificación"
              loading={loadingZonificaciones}
              showSearch
              optionFilterProp="children"
            >
              {zonificaciones.map((zona) => (
                <Select.Option key={zona.id} value={zona.id}>
                  {zona.nombreZonificacion}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="municipioId"
            label="Municipio"
            rules={[
              {
                required: true,
                message: "Por favor, seleccione un Municipio.",
              },
            ]}
          >
            <Select
              placeholder="Seleccione un Municipio"
              loading={loadingMunicipios}
              showSearch
              optionFilterProp="children"
            >
              {municipios.map((muni) => (
                <Select.Option key={muni.id} value={muni.id}>
                  {muni.municipio}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingSitio ? "Actualizar" : "Guardar"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default ListaSitios;
