import React, { useState, useEffect } from "react";
import { Table, Input, Button } from "antd";
import { updateDataReserva } from "../../../services/materialesServices";

import Swal from "sweetalert2";

const ReservasEditable = ({ data, loading, buttonTrue = true, recargar }) => {
  // Use an empty array as the default value for useState
  const [editedData, setEditedData] = useState(data || []);
  const [originalData, setOriginalData] = useState(data || []);

  useEffect(() => {
    // Also use a safe value inside useEffect
    setEditedData(data || []);
    setOriginalData(data || []);
  }, [data]);

  const handleChange = (value, record, field) => {
    const newData = editedData.map((item) =>
      item.id === record.id ? { ...item, [field]: value } : item
    );
    setEditedData(newData);
  };

  const isModified = (original, edited) => {
    return (
      original.reserva !== edited.reserva ||
      original.grafo !== edited.grafo ||
      original.elementoPep !== edited.elementoPep
    );
  };

  const handleUpdate = async () => {
    const modifiedItems = editedData.filter((editedItem) => {
      const originalItem = originalData.find(
        (item) => item.id === editedItem.id
      );
      return originalItem && isModified(originalItem, editedItem);
    });

    if (modifiedItems.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin cambios",
        text: "No hay reservas modificadas para actualizar.",
      });
      return;
    }

    try {
      await Promise.all(
        modifiedItems.map((item) =>
          updateDataReserva(item.id, {
            reserva: item.reserva,
            grafo: item.grafo,
            elementoPep: item.elementoPep,
            estado: item.estado,
          })
        )
      );

      if (recargar) {
        recargar();
      }

      Swal.fire({
        icon: "success",
        title: "Actualización exitosa",
        text: `${modifiedItems.length} reserva(s) actualizada(s) correctamente.`,
      });

      setOriginalData(editedData);
    } catch (error) {
      console.error("Error al actualizar reservas:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al actualizar las reservas.",
      });
    }
  };

  const columns = [
    {
      title: "Reserva",
      dataIndex: "reserva",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleChange(e.target.value, record, "reserva")}
        />
      ),
    },
    {
      title: "Grafo",
      dataIndex: "grafo",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleChange(e.target.value, record, "grafo")}
        />
      ),
    },
    {
      title: "Elemento PEP",
      dataIndex: "elementoPep",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) => handleChange(e.target.value, record, "elementoPep")}
        />
      ),
    },
  ];

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={editedData}
        loading={loading}
      />

      {buttonTrue &&
        (editedData.length === 0 ? (
          <Button
            type="primary"
            style={{ maxWidth: 200, marginBottom: 16 }}
            disabled
          >
            No hay reservas
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={handleUpdate}
            style={{ maxWidth: 200, marginBottom: 16 }}
          >
            Actualizar Reservas
          </Button>
        ))}
    </>
  );
};

export default ReservasEditable;
