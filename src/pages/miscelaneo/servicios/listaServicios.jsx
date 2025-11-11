import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import MainLayout from "../../../layout/MainLayout";
import {
  fecthListaServicios,
  nuevoServicio,
  actualizarServicio,
  deleteServicio,
} from "../../../services/serviciosServices";
import { useAuthUser } from "../../../services/authServices";
import { getListaGerenciasTecnicas } from "../../../services/proyectoServices";
import { fetchContratista } from "../../../services/miscelaneo/contratistaServices";

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
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

export default function ListaServicios() {
  const user = useAuthUser(); // Obtiene la información del usuario autenticado

  // Asegúrate de que user y user.UserData existan antes de intentar acceder a user.UserData.rol
  const userRole = user?.role;

  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  const [gerecniasTecnicas, setGerenciasTecnicas] = useState([]);
  const [loadingGerenciasTecnicas, setLoadingGerenciasTecnicas] =
    useState(false);

  const [contratista, setContratista] = useState([]);
  const [loadingContratista, setLoadingContratista] = useState(false);

  const loadServicios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fecthListaServicios({
        limit: filters.limit,
        offset: (filters.page - 1) * filters.limit,
        search: filters.search,
      }); // se espera un arreglo
      setServicios(res);
    } catch (e) {
      console.error("Error cargando Servicios", e);
      Swal.fire("Error", "No se pudieron cargar los Servicios.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadGerenciasTecnicas = useCallback(async () => {
    setLoadingGerenciasTecnicas(true);
    try {
      const response = await getListaGerenciasTecnicas(); // tu servicio
      setGerenciasTecnicas(response);
    } catch (error) {
      console.error("Error al cargar zonificaciones:", error);
    } finally {
      setLoadingGerenciasTecnicas(false);
    }
  }, []);

  const loadContratistas = useCallback(async () => {
    setLoadingContratista(true);
    try {
      const response = await fetchContratista(); // tu servicio
      setContratista(response);
    } catch (error) {
      console.error("Error al cargar Contratista:", error);
    } finally {
      setLoadingContratista(false);
    }
  }, []);

  useEffect(() => {
    loadServicios();
    loadGerenciasTecnicas();
    loadContratistas();
  }, [loadServicios, loadGerenciasTecnicas, loadContratistas]);

  const handlePaginationChange = (page, pageSize) => {
    setFilters((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const columns = [
    {
      title: "Codigo Servicio",
      dataIndex: "servicio",
      key: "servicio",
    },
    {
      title: "Descripcion",
      dataIndex: "descripcionServicio",
      key: "descripcionServicio",
    },
    {
      title: "Unidad Medida",
      dataIndex: "unidadMedida",
      key: "unidadMedida",
    },
    ...([
      "admin",
      "coordinador-ing",
      "coordinador-sup",
      "lider",
      "planificador",
    ].includes(userRole)
      ? [
          {
            title: "Costo",
            dataIndex: "costo",
            key: "costo",
          },
        ]
      : []),

    {
      title: "Moneda",
      dataIndex: "moneda",
      key: "moneda",
    },
    {
      title: "Contratista",
      dataIndex: ["Contratistas", "nombreContratista"],
      key: "contratista",
      render: (text) => text || "-", // opcional: fallback si no existe
    },
    ...([
      "admin",
      "coordinador-ing",
      "coordinador-sup",
      "planificador",
    ].includes(userRole)
      ? [
          {
            title: "Acciones",
            key: "acciones",
            render: (_, record) => (
              <Space>
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
              </Space>
            ),
          },
        ]
      : []),
  ];

  const [editingServicios, setEditingServicios] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingServicios(null);
    form.resetFields();
  };

  const handleOpenModal = (servicio = null) => {
    setEditingServicios(servicio);
    if (servicio) {
      form.setFieldsValue({
        servicio: servicio.servicio,
        descripcionServicio: servicio.descripcionServicio,
        costo: servicio.costo,
        unidadMedida: servicio.unidadMedida,
        moneda: servicio.moneda,
        gerenciaTecnicaId: servicio.gerenciaTecnicaId,
        contratistaId: servicio.contratistaId,
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

    const apiCall = editingServicios
      ? actualizarServicio(editingServicios.id, filteredValues)
      : nuevoServicio(filteredValues);

    const action = editingServicios ? "actualizado" : "creado";

    try {
      await apiCall;
      Swal.fire(
        "¡Éxito!",
        `El sitio ha sido ${action} correctamente.`,
        "success"
      );
      handleCloseModal();
      loadServicios();
    } catch (error) {
      console.error(
        `Error al ${action} el sitio:`,
        error.response.data.message
      );
      Swal.fire("Error", error.response.data.message, "error");
    }
  };

  const handleDelete = (servicio) => {
    Swal.fire({
      title: "¿Estás seguro de eliminar este Servicio?",
      text: `${servicio.servicio}\n¡No podrás revertir esta acción!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, ¡eliminar!",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await deleteServicio(servicio.id);
          Swal.fire("¡Eliminado!", response.message, "success");
          loadServicios();
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
              {[
                "admin",
                "coordinador-ing",
                "coordinador-sup",
                "planificador",
              ].includes(userRole) && (
                <Button type="primary" onClick={() => handleOpenModal()}>
                  Nuevo servicio
                </Button>
              )}
            </Space>
          </Col>
        </Row>
        <Table
          style={{ marginTop: 16 }}
          columns={columns}
          rowKey="id"
          dataSource={servicios.data}
          loading={loading}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            showSizeChanger: true,
            total: servicios.totalItems,
            onChange: handlePaginationChange,
          }}
        />
      </Card>
      <Modal
        title={editingServicios ? "Editar Sitio" : "Nuevo Sitio"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null} // We will use the form's button
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          <Form.Item
            name="servicio"
            label="Codigo del Servicio"
            rules={[
              {
                required: true,
                message: "Por favor, ingrese el codigo del servicio.",
              },
            ]}
          >
            <Input placeholder="Ej. 34008593" />
          </Form.Item>

          <Form.Item
            name="descripcionServicio"
            label="Descripcion del Servicio"
            rules={[
              {
                required: true,
                message: "Por favor, ingrese el descripcion del servicio.",
              },
            ]}
          >
            <Input placeholder="Ej. SUMINISTRO E INSTALACION ACOPLADOR F.O" />
          </Form.Item>

          <Form.Item
            name="costo"
            label="Costo"
            rules={[
              {
                required: true,
                message: "Por favor, ingrese el costo",
              },
            ]}
          >
            <Input placeholder="Ej. 100" />
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
            name="gerenciaTecnicaId"
            label="Gerencia Tecnica"
            rules={[
              {
                required: true,
                message: "Por favor, seleccione una Gerencia Tecnica.",
              },
            ]}
          >
            <Select
              placeholder="Seleccione una Gerencia"
              loading={loadingGerenciasTecnicas}
              showSearch
              optionFilterProp="children"
            >
              {gerecniasTecnicas.map((gerenciasTec) => (
                <Select.Option key={gerenciasTec.id} value={gerenciasTec.id}>
                  {gerenciasTec.nomenclaturaSubTec} -{" "}
                  {gerenciasTec.nombreSubTec}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="contratistaId"
            label="Contratistas"
            rules={[
              {
                required: true,
                message: "Por favor, seleccione un contratista.",
              },
            ]}
          >
            <Select
              placeholder="Seleccione un Contratista"
              loading={loadingContratista}
              showSearch
              optionFilterProp="children"
            >
              {contratista.map((contra) => (
                <Select.Option key={contra.id} value={contra.id}>
                  {contra.nombreContratista}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingServicios ? "Actualizar" : "Guardar"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
}
