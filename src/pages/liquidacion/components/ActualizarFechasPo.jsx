import React, { useMemo, useState } from "react";
import { Modal, Button, Form, Typography, Space } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const { Text } = Typography;

// Util: formatea una fecha a "YYYY-MM-DD" para <input type="date">
// Evita desfases por zona horaria.
function toInputDate(value) {
  if (!value) return undefined;
  const d = new Date(value);
  if (isNaN(d)) return undefined;
  const tzOffset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tzOffset * 60000);
  return local.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export default function ActualizarFechasPO({ po, onSave }) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  // Valores iniciales del formulario
  const initialValues = useMemo(
    () => ({
      fechaInicio: toInputDate(po?.fechaInicio),
      fechaFin: toInputDate(po?.fechaFin),
    }),
    [po?.fechaInicio, po?.fechaFin]
  );

  const handleOpen = () => {
    setOpen(true);
    // Establece los valores al abrir para asegurar que toma el po más reciente
    setTimeout(() => form.setFieldsValue(initialValues), 0);
  };

  const handleCancel = () => setOpen(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // Regresamos strings "YYYY-MM-DD" (fáciles de enviar a backend).
      // Si prefieres Date o ISO, puedo ajustarlo.
      const payload = {
        fechaInicio: values.fechaInicio || null,
        fechaFin: values.fechaFin || null,
      };
      onSave?.(payload);
      setOpen(false);
    } catch (e) {
      console.log("Validación fallida:", e);
    }
  };

  return (
    <>
      {/* Vista de solo lectura, como tu snippet */}
      <Space direction="vertical" size={4} style={{ display: "block" }}>
        {po?.fechaInicio && (
          <Text type="secondary">
            Fecha Inicio: {new Date(po.fechaInicio).toLocaleDateString("es-NI")}
          </Text>
        )}
        {po?.fechaFin && (
          <Text type="secondary">
            Fecha Fin: {new Date(po.fechaFin).toLocaleDateString("es-NI")}
          </Text>
        )}
      </Space>

      <Button
        onClick={handleOpen}
        size="small"
        style={{
          width: 140,
        }}
        icon={<CalendarOutlined />}
      >
        Actualizar
      </Button>

      <Modal
        open={open}
        title="Actualizar fechas"
        onCancel={handleCancel}
        onOk={handleOk}
        okText="Guardar"
        cancelText="Cancelar"
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={initialValues}
          requiredMark={false}
        >
          {/* Campo 1: Fecha de Inicio */}
          <Form.Item
            name="fechaInicio"
            label="Fecha de Inicio"
            help="Modifica esta fecha si es necesario, si es diferente a la actual."
          >
            <input type="date" className="native-datepicker" />
          </Form.Item>

          {/* Campo 2: Fecha de Fin (con validación contra Inicio) */}
          <Form.Item
            name="fechaFin"
            label="Fecha de Fin"
            help="Debe ser igual o posterior a la fecha de inicio."
            dependencies={["fechaInicio"]}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const inicio = getFieldValue("fechaInicio");
                  if (!value || !inicio || value >= inicio) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(
                      "La fecha fin no puede ser anterior a la fecha inicio."
                    )
                  );
                },
              }),
            ]}
          >
            <input type="date" className="native-datepicker" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
