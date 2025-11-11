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
import MainLayout from "../../../layout/MainLayout";
import {
  fecthListaMateriales,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../../../services/materialesServices";
import { useAuthUser } from "../../../services/authServices"; // Importa el hook para obtener el usuario autenticado
import Swal from "sweetalert2";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
const { Title } = Typography;

export default function ListaMateriales() {
  const user = useAuthUser(); // Obtiene la información del usuario autenticado

  // Asegúrate de que user y user.UserData existan antes de intentar acceder a user.UserData.rol
  const userRole = user?.role;
  // Lista de materiales: búsqueda simple y tabla con paginación
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  const loadMateriales = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fecthListaMateriales({
        limit: filters.limit,
        offset: (filters.page - 1) * filters.limit,
        search: filters.search,
      }); // se espera un arreglo
      setMateriales(res);
    } catch (e) {
      console.error("Error cargando materiales", e);
      Swal.fire("Error", "No se pudieron cargar los materiales.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMateriales();
  }, [loadMateriales]);

  const handlePaginationChange = (page, pageSize) => {
    setFilters((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };
  const columns = [
    {
      title: "Codigo Mate",
      dataIndex: "codigo",
      key: "codigo",
    },
    {
      title: "Descripcion",
      dataIndex: "descripcion",
      key: "descripcion",
    },
    {
      title: "Unidad Medida",
      dataIndex: "unidadMedida",
      key: "unidadMedida",
    },
    {
      title: "Moneda",
      dataIndex: "moneda",
      key: "moneda",
    },
    ...(["admin", "coordinador-ing", "coordinador-sup"].includes(userRole)
      ? [
          {
            title: "Acciones",
            key: "acciones",
            render: (_, record) => (
              <Space>
                <>
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleOpenModal(record)}
                  >
                    Editar
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                    onClick={() => handleDelete(record)}
                  >
                    Eliminar
                  </Button>
                </>
              </Space>
            ),
          },
        ]
      : []),
  ];

  const [editingMaterial, setEditingMaterial] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingMaterial(null);
    form.resetFields();
  };

  const handleOpenModal = (material = null) => {
    setEditingMaterial(material);
    if (material) {
      form.setFieldsValue({
        codigo: material.codigo,
        descripcion: material.descripcion,
        unidadMedida: material.unidadMedida,
        moneda: material.moneda,
        costo: material.costo,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    // Filtrar campos vacíos que no son requeridos
    const filteredValues = Object.fromEntries(
      Object.entries(values).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    );

    const apiCall = editingMaterial
      ? updateMaterial(editingMaterial.id, filteredValues)
      : createMaterial(filteredValues);
    console.log(filteredValues);
    const action = editingMaterial ? "actualizado" : "creado";
    try {
      await apiCall;
      Swal.fire(
        "¡Éxito!",
        `El sitio ha sido ${action} correctamente.`,
        "success"
      );
      handleCloseModal();
      loadMateriales();
    } catch (error) {
      console.error(
        `Error al ${action} el sitio:`,
        error.response.data.message
      );
      Swal.fire("Error", error.response.data.message, "error");
    }
  };

  const handleDelete = (material) => {
    Swal.fire({
      title: "¿Estás seguro de eliminar este material?",
      text: `${material.codigo}\n¡No podrás revertir esta acción!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, ¡eliminar!",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteMaterial(material.id);
          Swal.fire("¡Eliminado!", response.message, "success");
          loadMateriales();
        } catch (error) {
          console.error("Error al eliminar el sitio:", error);
          Swal.fire("Error", "No se pudo eliminar el sitio.", "error");
        }
      }
    });
  };

  return (
    <MainLayout>
      <Card>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Buscar por nombre, Codigo"
              onSearch={handleSearch}
              style={{ width: "90%" }}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col>
            <Space>
              <Button
                onClick={() => {
                  loadMateriales();
                }}
              >
                Refrescar
              </Button>
              {userRole === "admin" && (
                <Button type="primary" onClick={() => handleOpenModal()}>
                  Nuevo material
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        <Table
          style={{ marginTop: 16 }}
          columns={columns}
          rowKey="id"
          dataSource={materiales.data}
          loading={loading}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            showSizeChanger: true,
            total: materiales.totalItems,
            onChange: handlePaginationChange,
          }}
        />
      </Card>
      <Modal
        title={editingMaterial ? "Editar Material" : "Nuevo Material"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null} // We will use the form's button
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="codigo"
            label="Código Material"
            rules={[
              { required: true, message: "Por favor, ingrese el código." },
            ]}
          >
            <Input placeholder="Ej. 1003415" />
          </Form.Item>
          <Form.Item
            name="descripcion"
            label="Descripción"
            rules={[
              { required: true, message: "Por favor, ingrese la descripción." },
            ]}
          >
            <Input placeholder="Ej. Cable coaxial RG6" />
          </Form.Item>
          <Form.Item
            name="unidadMedida"
            label="Unidad de Medida"
            rules={[
              {
                required: true,
                message: "Por favor, ingrese la unidad de medida.",
              },
            ]}
          >
            <Input placeholder="Ej. Metro, Unidad, Caja" />
          </Form.Item>

          <Form.Item
            name="costo"
            label="Costo"
            extra="Si codigo de material es de bodega dejelo en 0"
            rules={[
              {
                required: true,
                message: "Por favor, ingrese el costo.",
              },
            ]}
          >
            <Input placeholder="Ej. 20, 30,40" />
          </Form.Item>
          <Form.Item
            name="moneda"
            label="Moneda"
            rules={[
              { required: true, message: "Por favor, seleccione la moneda." },
            ]}
          >
            <Select placeholder="Seleccione una moneda">
              <Select.Option value="USD">USD</Select.Option>
              <Select.Option value="NIO">NIO</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingMaterial ? "Actualizar" : "Guardar"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
}
