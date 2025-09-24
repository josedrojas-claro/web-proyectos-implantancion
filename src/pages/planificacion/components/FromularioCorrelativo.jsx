import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, Row, Col, Spin } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";

import "./FormularioCorrelativo.css";
import {
  updateCorrelativoProyecto,
  fetchCorrelativoProyecto,
} from "../../../services/proyectoServices";

const { Title } = Typography;

const FormularioCorrelativo = ({ proyecto, onSuccess, viewBotton = true }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // useEffect para cargar los datos iniciales
  useEffect(() => {
    const cargarDatosCorrelativo = async () => {
      if (proyecto?.id) {
        setLoadingData(true);
        try {
          const data = await fetchCorrelativoProyecto(proyecto.id);
          const fechaFormateada = new Date(data.fecha)
            .toISOString()
            .split("T")[0];

          form.setFieldsValue({
            correlativo: data.correlativo,
            fecha: fechaFormateada,
          });
        } catch (error) {
          console.log(
            "Info: El proyecto aún no tiene un correlativo asignado.",
            error
          );
          form.setFieldsValue({
            correlativo: proyecto.correlativo,
            fecha: undefined, // Aseguramos que la fecha esté vacía si no hay historial
          });
        } finally {
          setLoadingData(false);
        }
      }
    };
    cargarDatosCorrelativo();
  }, [proyecto, form]);

  // onFinish AHORA ENVÍA LA FECHA
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // ✨ La fecha del formulario se incluye en el payload
      const payload = {
        correlativo: values.correlativo,
        fecha: values.fecha, // El input nativo ya da el formato 'YYYY-MM-DD'
      };

      console.log("Payload enviado:", payload);

      const response = await updateCorrelativoProyecto(proyecto.id, payload);

      await Swal.fire({
        icon: "success",
        title: "¡Éxito!",
        text: response.message,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Ocurrió un error al guardar.";
      await Swal.fire("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!proyecto) {
    return null;
  }

  return (
    <Card style={{ marginTop: "20px" }}>
      {viewBotton ? (
        <Title level={4}>Asignar o Actualizar Correlativo</Title>
      ) : (
        <Title level={4}>Correlativo</Title>
      )}
      {loadingData ? (
        <Spin tip="Cargando datos del correlativo..." />
      ) : (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16} align="bottom">
            <Col xs={24} sm={10}>
              <Form.Item
                name="correlativo"
                label="Número de Correlativo"
                rules={[
                  { required: true, message: "Este campo es obligatorio." },
                ]}
              >
                <Input placeholder="Ej: C-001-2025" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              {/* ✨ El campo de fecha ahora es editable de nuevo */}
              <Form.Item
                name="fecha"
                label="Fecha de Asignación"
                help="Modifica esta fecha si es necesario, si es diferente a la actual."
              >
                <input type="date" className="native-datepicker" />
              </Form.Item>
            </Col>
            {viewBotton ? (
              <Col xs={24} sm={6}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    style={{ width: "100%" }}
                  >
                    Guardar
                  </Button>
                </Form.Item>
              </Col>
            ) : null}
          </Row>
        </Form>
      )}
    </Card>
  );
};

export default FormularioCorrelativo;
