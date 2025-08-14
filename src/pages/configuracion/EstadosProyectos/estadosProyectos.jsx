// src/pages/proyectos/EstadosProyectos.jsx

import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Space,
  Typography,
  Card,
  Flex,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"; // ✨ CAMBIO: Añadido DeleteOutlined
import Swal from "sweetalert2"; // ✨ CAMBIO: Importamos SweetAlert2
import MainLayout from "../../../layout/MainLayout";
import {
  fetchEstadosProyectos,
  createEstadoProyecto,
  updateEstadoProyectos,
  deleteEstadoProyecto,
} from "../../../services/proyectoServices";

const { Search } = Input;
const { Title } = Typography;

export default function EstadosProyectos() {
  const [form] = Form.useForm();

  const [estados, setEstados] = useState([]);
  const [filteredEstados, setFilteredEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEstado, setEditingEstado] = useState(null);

  useEffect(() => {
    loadEstados();
  }, []);

  const loadEstados = async () => {
    try {
      setLoading(true);
      const data = await fetchEstadosProyectos();
      setEstados(data);
      setFilteredEstados(data);
    } catch (error) {
      // ✨ CAMBIO: Usamos Swal para el mensaje de error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los estados de proyecto.",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    const filtered = estados.filter((estado) =>
      estado.nombre.toLowerCase().includes(lowercasedValue)
    );
    setFilteredEstados(filtered);
  };

  const showModal = (estado = null) => {
    setEditingEstado(estado);
    if (estado) {
      form.setFieldsValue({ nombre: estado.nombre });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingEstado(null);
    form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingEstado) {
        await updateEstadoProyectos(editingEstado.id, values);
        // ✨ CAMBIO: Usamos Swal para el mensaje de éxito
        Swal.fire(
          "¡Actualizado!",
          "El estado ha sido actualizado correctamente.",
          "success"
        );
      } else {
        await createEstadoProyecto(values);
        // ✨ CAMBIO: Usamos Swal para el mensaje de éxito
        Swal.fire(
          "¡Creado!",
          "El estado ha sido creado correctamente.",
          "success"
        );
      }

      setIsModalVisible(false);
      form.resetFields();
      loadEstados();
    } catch (errorInfo) {
      console.log("Fallo la validación:", errorInfo);
      // Opcional: podrías mostrar un swal de error aquí también si falla la API
    }
  };

  // ✨ CAMBIO: Nueva función para manejar el borrado
  const handleDelete = (estado) => {
    Swal.fire({
      title: `¿Estás seguro de borrar "${estado.nombre}"?`,
      text: "¡No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, ¡bórralo!",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteEstadoProyecto(estado.id);
          Swal.fire("¡Borrado!", "El estado ha sido eliminado.", "success");
          loadEstados(); // Recargamos los datos
        } catch (error) {
          Swal.fire(
            "Error",
            error || "Hubo un problema al borrar el estado.",
            "error"
          );
        }
      }
    });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Nombre del Estado",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        // ✨ CAMBIO: Añadido Space para separar los botones y el nuevo botón de borrado
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showModal(record)}>
            Editar
          </Button>
          <Button
            danger // El botón se verá en rojo
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Borrar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <Card>
        <Flex justify="space-between" align="center" wrap="wrap" gap="middle">
          <Title level={3} style={{ margin: 0 }}>
            Gestión de Estados de Proyectos
          </Title>
          <Flex gap="middle" wrap="wrap">
            <Search
              placeholder="Buscar por nombre..."
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Agregar Nuevo
            </Button>
          </Flex>
        </Flex>

        <Table
          columns={columns}
          dataSource={filteredEstados}
          loading={loading}
          rowKey="id"
          style={{ marginTop: 20 }}
        />
      </Card>

      <Modal
        title={editingEstado ? "Editar Estado" : "Agregar Nuevo Estado"}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingEstado ? "Guardar Cambios" : "Crear"}
        cancelText="Cancelar"
        destroyOnClose // Buena práctica para resetear el estado interno del modal al cerrar
      >
        <Form form={form} layout="vertical" name="estado_form">
          <Form.Item
            name="nombre"
            label="Nombre del Estado"
            rules={[{ required: true, message: "El nombre es obligatorio." }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
}
