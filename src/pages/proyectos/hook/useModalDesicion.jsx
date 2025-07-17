import React, { useState } from "react";
import { Modal, Input, Button, message } from "antd";
import { updateSerMateAproRecha } from "../services/tuServicio"; // Ajusta la importación

export default function useModalDecision({ onAfterUpdate } = {}) {
  const [visible, setVisible] = useState(false);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState("aprobado");
  const [id, setId] = useState(null);

  const showModal = (itemId, nuevoEstado) => {
    setId(itemId);
    setEstado(nuevoEstado);
    setComentario("");
    setVisible(true);
  };

  const handleOk = async () => {
    setLoading(true);
    try {
      await updateSerMateAproRecha(id, {
        estado,
        comentarioAprobador: comentario,
      });
      message.success(`Solicitud ${estado === "aprobado" ? "aprobada" : "rechazada"} con éxito`);
      setVisible(false);
      if (onAfterUpdate) onAfterUpdate(); // Para recargar datos
    } catch (e) {
      message.error("Error: " + (e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  // Este fragmento lo puedes poner al final de tu componente principal para que el modal esté en el árbol
  const ModalDecision = (
    <Modal
      open={visible}
      title={estado === "aprobado" ? "Aprobar Solicitud" : "Rechazar Solicitud"}
      onOk={handleOk}
      onCancel={() => setVisible(false)}
      confirmLoading={loading}
      okText={estado === "aprobado" ? "Aprobar" : "Rechazar"}
      cancelText="Cancelar"
    >
      <div style={{ marginBottom: 12 }}>
        {estado === "aprobado"
          ? "¿Estás seguro de aprobar esta solicitud?"
          : "¿Estás seguro de rechazar esta solicitud?"}
      </div>
      <Input.TextArea
        rows={3}
        placeholder="Comentario (opcional)"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />
    </Modal>
  );

  return { showModal, ModalDecision };
}
