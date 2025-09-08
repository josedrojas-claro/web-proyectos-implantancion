import React, { useState } from "react";
import { Button, Modal, Form, Input, Row, Col } from "antd";
import { updateCorrelativoMasivo } from "../../../services/proyectoServices";
import Swal from "sweetalert2";
// --- PASO 1: El componente intermediario ---
const NativeDatePickerWrapper = ({ value, onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };
  return (
    <input
      type="date"
      className="ant-input"
      value={value || ""}
      onChange={handleChange}
      style={{
        width: "100%",
        padding: "4px 11px",
        height: "32px",
        borderColor: "#d9d9d9",
        borderRadius: "6px",
      }}
    />
  );
};

const BottonCargaCorrelativoMasiva = ({ update }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const onFinish = async (values) => {
    setIsLoading(true);

    const { correlativo, ticketsStr } = values;

    const arrayTickets = ticketsStr
      .split(/\s*[,;\s\n]+\s*/)
      .filter(Boolean)
      .map(Number)
      .filter((num) => !isNaN(num));

    const payload = {
      correlativo,
      // --- PASO 3: Ajuste en el payload ---
      fecha: values.fecha || null,
      arrayTickets,
    };

    try {
      const response = await updateCorrelativoMasivo(payload);
      const { summary } = response;

      form.resetFields();
      if (update) {
        update();
      }
      setIsModalOpen(false);
      let swalConfig = {};

      if (summary.failedCount === 0 && summary.successCount > 0) {
        // CASO 1: ÉXITO TOTAL
        swalConfig = {
          icon: "success",
          title: "¡Proceso Exitoso!",
          html: `Se actualizaron correctamente <b>${summary.successCount}</b> proyectos.`,
        };
      } else if (summary.successCount > 0 && summary.failedCount > 0) {
        // CASO 2: ÉXITO PARCIAL (el más importante)
        swalConfig = {
          icon: "warning", // Usamos 'warning' para indicar que algo requiere atención
          title: "Proceso con Observaciones",
          // Construimos un HTML más detallado y legible
          html: `
        <div style="text-align: left; margin-top: 1rem;">
          <p>✅ <b>${
            summary.successCount
          }</b> proyectos actualizados con éxito.</p>
          <p>❌ <b>${
            summary.failedCount
          }</b> no se pudieron actualizar por tener un estado incorrecto.</p>
          <hr>
          <p><b>Tickets Omitidos:</b></p>
          <code style="display: block; background: #f1f1f1; padding: 10px; border-radius: 4px; word-wrap: break-word;">
            ${summary.failedTickets.join(", ")}
          </code>
        </div>
      `,
        };
      } else {
        // CASO 3: FALLO TOTAL
        swalConfig = {
          icon: "error",
          title: "Ningún Proyecto fue Actualizado",
          html:
            summary.reason ||
            "Todos los tickets proporcionados tenían un estado incorrecto.",
        };
      }

      // Mostramos el Swal con la configuración dinámica
      await Swal.fire({
        ...swalConfig, // Usamos el objeto de configuración que creamos
        confirmButtonText: "Entendido",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Error en la Actualización",
        text:
          error.response?.data?.message ||
          "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
        confirmButtonText: "Cerrar",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Correlativo
      </Button>

      <Modal
        title="Carga Masiva de Correlativo"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={() => form.submit()}
          >
            Actualizar
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="correlativo"
                label="Correlativo"
                rules={[
                  { required: true, message: "El correlativo es obligatorio" },
                ]}
              >
                <Input placeholder="Ej: XYZ-01" />
              </Form.Item>
            </Col>
            <Col span={12}>
              {/* --- PASO 2: Usar el intermediario --- */}
              <Form.Item name="fecha" label="Fecha de Asignación">
                <NativeDatePickerWrapper />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="ticketsStr"
            label="Lista de Tickets"
            rules={[
              { required: true, message: "La lista de tickets es obligatoria" },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Pega los tickets aquí..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BottonCargaCorrelativoMasiva;
