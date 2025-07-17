import React, { useState } from "react";
import { Card, Typography, Space, Button, Tag, Tooltip, Modal, Input, message } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined } from "@ant-design/icons";
import { updateSerMateAproRecha } from "../../../services/serviciosServices"; // Cambia ruta (asegúrate de que esta es la ruta correcta para la función de actualización)

const getEstadoTag = (estado) => {
  if (estado === "aprobado")
    return (
      <Tag color="green" style={{ fontWeight: 600, borderRadius: 16 }}>
        APROBADO
      </Tag>
    );
  if (estado === "rechazado")
    return (
      <Tag color="red" style={{ fontWeight: 600, borderRadius: 16 }}>
        RECHAZADO
      </Tag>
    );
  return (
    <Tag color="default" style={{ fontWeight: 600, borderRadius: 16 }}>
      PENDIENTE
    </Tag>
  );
};

// === CAMBIO EN LAS PROPS: `recargar` se cambia por `onActionSuccess` ===
export default function SolicitudAprobarCard({ data, tipo, loading = false, onActionSuccess }) {
  const [modal, setModal] = useState({ visible: false, estado: null });
  const [comentario, setComentario] = useState("");
  const [saving, setSaving] = useState(false);

  // Nombres y descripciones:
  const codigo = tipo === "material" ? data.material?.codigo : data.servicio?.servicio;
  const descripcion = tipo === "material" ? data.material?.descripcion : data.servicio?.descripcionServicio;
  const unidad = tipo === "material" ? data.material?.unidadMedida : data.servicio?.unidadMedida;

  // Handler para abrir modal
  const handleOpenModal = (estado) => {
    setComentario("");
    setModal({ visible: true, estado });
  };

  // Handler para confirmar
  const handleConfirm = async () => {
    setSaving(true);
    try {
      // console.log("esto es un test", modal.estado); // Puedes quitar este console.log de prueba
      await updateSerMateAproRecha(data.id, {
        estado: modal.estado,
        comentarioAprobador: comentario,
      });
      message.success(`Solicitud ${modal.estado === "aprobado" ? "aprobada" : "rechazada"} con éxito`);
      setModal({ visible: false, estado: null });

      // === CAMBIO CLAVE AQUÍ: Llamar a `onActionSuccess` con el id y el tipo ===
      if (typeof onActionSuccess === "function") {
        onActionSuccess(data.id, tipo); // Pasamos el ID del elemento y su TIPO (servicio o material)
      }
      // =====================================================================
    } catch (e) {
      message.error("Error: " + (e?.response?.data?.message || e.message || "Error desconocido"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card
        style={{
          background: "#faf7fc",
          borderRadius: 16,
          border: "2px solid #bdbdbd",
          boxShadow: "0 1px 4px rgba(7, 6, 6, 0.07)",
          width: "100%",
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {getEstadoTag(data.estado)}
            <Space>
              <Tooltip title="Rechazar">
                <Button
                  type="text"
                  shape="circle"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleOpenModal("rechazado")}
                  loading={loading}
                />
              </Tooltip>
              <Tooltip title="Aprobar">
                <Button
                  type="text"
                  shape="circle"
                  icon={<CheckCircleOutlined style={{ color: "green" }} />}
                  onClick={() => handleOpenModal("aprobado")}
                  loading={loading}
                />
              </Tooltip>
            </Space>
          </div>

          <Typography.Text strong style={{ fontSize: 16 }}>
            {codigo}
          </Typography.Text>
          <Typography.Text style={{ fontSize: 13, color: "#222" }}>{descripcion}</Typography.Text>
          <Typography.Text type="secondary">
            <UserOutlined style={{ marginRight: 4 }} />
            {data.solicitante?.UserData?.nombre}
          </Typography.Text>
          <Typography.Text>
            <span role="img" aria-label="cantidad">
              📦
            </span>{" "}
            Cantidad solicitada:{" "}
            <strong>
              {parseFloat(data.cantidad).toFixed(2)} {unidad}
            </strong>
          </Typography.Text>
          {data.comentarioUsuario && (
            <Typography.Paragraph type="secondary" italic style={{ margin: 0 }}>
              <span role="img" aria-label="comentario">
                💬
              </span>{" "}
              {data.comentarioUsuario}
            </Typography.Paragraph>
          )}
        </Space>
      </Card>

      <Modal
        open={modal.visible}
        title={modal.estado === "aprobado" ? "Aprobar Solicitud" : "Rechazar Solicitud"}
        okText={modal.estado === "aprobado" ? "Aprobar" : "Rechazar"}
        cancelText="Cancelar"
        onCancel={() => setModal({ visible: false, estado: null })}
        onOk={handleConfirm}
        confirmLoading={saving}
      >
        <div style={{ marginBottom: 12 }}>
          {modal.estado === "aprobado"
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
    </>
  );
}
