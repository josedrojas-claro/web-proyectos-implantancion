import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import {
  verSolpedsPorProyecto,
  actualizarSolped,
  eliminarSolped,
} from "../../../services/liquidacionServices";

const { Title } = Typography;

export default function VerSolpedsByProyecto({ proyectoId }) {
  // ✨ 1. Recibe la prop onUpdate
  const [solpeds, setSolpeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✨ 2. Estados para manejar el modal de edición
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // Función para cargar los datos (reutilizable)
  const cargarSolpeds = useCallback(async () => {
    if (!proyectoId) return;
    setLoading(true);
    try {
      const data = await verSolpedsPorProyecto(proyectoId);
      setSolpeds(data);
    } catch (error) {
      console.error("Error al cargar las SOLPEDs:", error);
    } finally {
      setLoading(false);
    }
  }, [proyectoId]);

  useEffect(() => {
    cargarSolpeds();
  }, [proyectoId, cargarSolpeds]);

  // ✨ 3. Función para manejar el borrado
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esta acción!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, ¡bórralo!",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        const response = await eliminarSolped(id);
        Swal.fire("¡Eliminado!", response.message, "success");
        cargarSolpeds();
      } catch (error) {
        const message = error.response?.data?.message || "Ocurrió un error.";
        Swal.fire("Error", message, "error");
      }
    }
  };

  // ✨ 4. Funciones para manejar la edición
  const showEditModal = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record); // Rellena el form con los datos de la fila
    setIsModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      const response = await actualizarSolped(editingRecord.id, values);
      setIsModalVisible(false);
      Swal.fire("¡Actualizado!", response.message, "success");
      cargarSolpeds();
    } catch (error) {
      const message = error.response?.data?.message || "Ocurrió un error.";
      Swal.fire("Error", message, "error");
    }
  };

  // ✨ 5. Añade la columna de "Acciones"
  const columns = [
    { title: "N° SOLPED", dataIndex: "numeroSOLPED", key: "numeroSOLPED" },
    { title: "Elemento PEP", dataIndex: "elementoPEP", key: "elementoPEP" },
    { title: "Grafo", dataIndex: "grafo", key: "grafo" },
    { title: "Subtec", dataIndex: "subtec", key: "subtec" },
    {
      title: "Moneda",
      dataIndex: "moneda",
      key: "moneda",
      render: (moneda) => (
        <Tag color={moneda === "USD" ? "green" : "blue"}>{moneda}</Tag>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="small"
          >
            Editar
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
            danger
          >
            Borrar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <Title level={4}>SOLPEDs del Proyecto</Title>
        <Table
          columns={columns}
          dataSource={solpeds}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          bordered
          size="small"
        />
      </Card>

      {/* ✨ 6. Modal para la edición */}
      <Modal
        title="Puedes editar pero te recomiendo mejor borrar y enviarla del masivo, usalo para casos puntuales"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null} // El botón de guardar estará en el form
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            name="numeroSOLPED"
            label="N° SOLPED"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="elementoPEP"
            label="Elemento PEP"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="grafo" label="Grafo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="subtec" label="Subtec" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="monto" label="Monto" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Guardar Cambios
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
