import React, { useState } from "react";
import { Table, Card, Typography, Tag, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons"; // ✨ Añade un ícono
import Swal from "sweetalert2";
import { deleteMaterialesReplanteo } from "../../../services/materialesServices";
const { Title } = Typography;

const columns = [
  {
    title: "Código",
    dataIndex: ["material", "codigo"],
    key: "codigo",
  },
  {
    title: "Descripción",
    dataIndex: ["material", "descripcion"],
    key: "descripcion",
  },
  {
    title: "Planificado",
    dataIndex: "cantidadPlanificada",
    key: "planificada",
    render: (text) => <Tag color="blue">{text}</Tag>,
  },
  {
    title: "Replanteado",
    dataIndex: "cantidadReplanteo",
    key: "cantidadReplanteo",
    render: (text) => <Tag color="cyan">{text}</Tag>,
  },
];

const ListaMaterialesReplanteo = ({
  materiales,
  loading,
  onUpdate,
  rowSeleccionActivate = true,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteSelected = async () => {
    // Confirmación con Swal
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: `Se eliminarán ${selectedRowKeys.length} material(es) planificado(s). ¡Esta acción no se puede revertir!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, ¡eliminar!",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setDeleting(true);
    try {
      // Llamamos al servicio de borrado en lote que ya creamos
      const response = await deleteMaterialesReplanteo({
        ids: selectedRowKeys.map((id) => Number(id)),
      });

      await Swal.fire("¡Eliminados!", response.message, "success");

      // ✨ Le decimos al componente padre que los datos cambiaron para que refresque la lista
      if (onUpdate) {
        onUpdate();
      }
      setSelectedRowKeys([]); // Limpiamos la selección
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Ocurrió un error al eliminar.";
      await Swal.fire("Error", errorMessage, "error");
    } finally {
      setDeleting(false);
    }
  };

  const rowSelection = {
    selectedRowKeys, // El estado que controla qué filas están seleccionadas
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys); // Actualiza el estado cuando el usuario selecciona/deselecciona
    },
  };

  const hasSelected = selectedRowKeys.length > 0;

  return (
    <Card style={{ marginTop: "20px" }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Materiales
        </Title>
        {/*  El botón de eliminar solo aparece si hay algo seleccionado */}
        {hasSelected && (
          <Button
            type="primary"
            danger
            onClick={handleDeleteSelected}
            disabled={!hasSelected}
            loading={deleting}
            icon={<DeleteOutlined />}
          >
            Eliminar ({selectedRowKeys.length})
          </Button>
        )}
      </div>
      <Table
        {...(rowSeleccionActivate ? { rowSelection } : {})}
        columns={columns}
        dataSource={materiales}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
      />
    </Card>
  );
};

export default ListaMaterialesReplanteo;
