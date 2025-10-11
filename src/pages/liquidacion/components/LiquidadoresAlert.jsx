import React, { useState } from "react";
import { Button, Modal, List } from "antd";
import Swal from "sweetalert2";
import { updateAsignarLiquidador } from "../../../services/proyectoServices";

const LiquidadoresAlert = ({ liquidadores, proyectoId, refresh }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAsignar = async (liquidadorId, nombre) => {
    const confirm = await Swal.fire({
      title: `¿Asignar a ${nombre}?`,
      text: "Esta acción asignará el liquidador al proyecto.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, asignar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      setLoadingId(liquidadorId);
      try {
        const response = await updateAsignarLiquidador({
          id: proyectoId,
          liquidadorId,
        });

        Swal.fire({
          title: "¡Asignado!",
          text: response.message || "Liquidador asignado correctamente.",
          icon: "success",
        });

        setIsModalVisible(false);
        if (refresh) {
          refresh();
        }
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Error",
          text: "No se pudo asignar el liquidador.",
          icon: "error",
        });
      } finally {
        setLoadingId(null);
      }
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Asignar A:
      </Button>
      <Modal
        title="Lista de Liquidadores"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <List
          dataSource={liquidadores}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="primary"
                  loading={loadingId === item.id}
                  onClick={() => handleAsignar(item.id, item.UserData.nombre)}
                >
                  Asignar
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={item.UserData.nombre}
                description={`Email: ${item.email} | Carnet: ${item.UserData.carnet}`}
              />
            </List.Item>
          )}
        />
      </Modal>
    </>
  );
};

export default LiquidadoresAlert;
