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
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { useAuthUser } from "../../../services/authServices"; // Importa el hook para obtener el usuario autenticado

import MainLayout from "../../../layout/MainLayout";
import {
  fetchListaContratista,
  createContratista,
  updateContratista,
  deleteContratista,
} from "../../../services/miscelaneo/contratistaServices";

const { Title } = Typography;

const ListaContratistaPage = () => {
  const user = useAuthUser(); // Obtiene la información del usuario autenticado

  // Asegúrate de que user y user.UserData existan antes de intentar acceder a user.UserData.rol
  const userRole = user?.role;
  // --- 1. STATE MANAGEMENT ---
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [contratistasData, setContratistasData] = useState({
    data: [],
    totalItems: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContratista, setEditingContratista] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  // --- 2. DATA FETCHING ---
  const loadContratistas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchListaContratista({
        limit: filters.limit,
        offset: (filters.page - 1) * filters.limit,
        search: filters.search,
      });
      setContratistasData(response);
    } catch (error) {
      console.error("Error fetching contractors:", error);
      Swal.fire("Error", "No se pudieron cargar los contratistas.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadContratistas();
  }, [loadContratistas]);

  // --- 3. CRUD HANDLERS ---
  const handleOpenModal = (contratista = null) => {
    setEditingContratista(contratista);
    form.setFieldsValue(contratista || { nombreContratista: "", centro: "" });
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingContratista(null);
    form.resetFields();
  };

  const handleFormSubmit = async (values) => {
    const apiCall = editingContratista
      ? updateContratista(editingContratista.id, values)
      : createContratista(values);

    const action = editingContratista ? "actualizado" : "creado";

    try {
      const response = await apiCall;
      Swal.fire(
        "¡Éxito!",
        response.message || `El contratista ha sido ${action} correctamente.`,
        "success"
      );
      handleCloseModal();
      loadContratistas();
    } catch (error) {
      console.error(`Error al ${action} el contratista:`, error);
      Swal.fire(
        "Error",
        error.response?.data?.message || `No se pudo ${action} el contratista.`,
        "error"
      );
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
          const response = await deleteContratista(id);
          Swal.fire(
            "¡Eliminado!",
            response.message || "El contratista ha sido eliminado.",
            "success"
          );
          loadContratistas();
        } catch (error) {
          console.error("Error al eliminar el contratista:", error);
          Swal.fire(
            "Error",
            error.response?.data?.message ||
              "No se pudo eliminar el contratista.",
            "error"
          );
        }
      }
    });
  };

  const handlePaginationChange = (page, pageSize) => {
    setFilters((prev) => ({ ...prev, page, limit: pageSize }));
  };

  // --- 4. TABLE COLUMNS DEFINITION ---
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Nombre Contratista",
      dataIndex: "nombreContratista",
      key: "nombreContratista",
    },
    {
      title: "Centro",
      dataIndex: "centro",
      key: "centro",
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
        <Title level={2}>Gestión de Contratistas</Title>

        <Card>
          <Row justify="space-between">
            <Col xs={24} md={12}>
              <Input.Search
                placeholder="Buscar por nombre o centro..."
                onSearch={(value) =>
                  setFilters((prev) => ({ ...prev, search: value, page: 1 }))
                }
                style={{ width: "100%" }}
                enterButton
              />
            </Col>
            {["admin", "coordinador-ing", "coordinador-sup"].includes(
              userRole
            ) && (
              <Col xs={24} md={4} style={{ textAlign: "right" }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal()}
                >
                  Añadir Contratista
                </Button>
              </Col>
            )}
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={contratistasData.data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: contratistasData.totalItems,
            onChange: handlePaginationChange,
          }}
        />
      </Space>

      <Modal
        title={editingContratista ? "Editar Contratista" : "Nuevo Contratista"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="nombreContratista"
            label="Nombre del Contratista"
            rules={[
              { required: true, message: "Por favor, ingrese el nombre." },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="centro"
            label="Centro"
            rules={[
              { required: true, message: "Por favor, ingrese el centro." },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingContratista ? "Actualizar" : "Guardar"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default ListaContratistaPage;
