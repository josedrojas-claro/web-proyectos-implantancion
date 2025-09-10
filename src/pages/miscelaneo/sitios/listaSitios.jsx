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

  useEffect(() => {
    loadSitios();
  }, [loadSitios]);

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
    const apiCall = editingSitio
      ? updateSitio(editingSitio.id, values)
      : createSitio(values);

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
      console.error(`Error al ${action} el sitio:`, error);
      Swal.fire("Error", `No se pudo ${action} el sitio.`, "error");
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
        visible={isModalVisible}
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
            <Input />
          </Form.Item>
          <Form.Item
            name="nemonico"
            label="Nemónico"
            rules={[
              { required: true, message: "Por favor, ingrese el nemónico." },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="dirreccion" label="Dirección">
            <Input.TextArea rows={3} />
          </Form.Item>
          {/* Add other form fields here (municipioId, zonficacionId, etc.) using Select components */}
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
