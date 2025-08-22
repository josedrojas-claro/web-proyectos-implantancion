import React from "react";
import {
  Collapse,
  Typography,
  Tag,
  Divider,
  Button,
  Space,
  notification,
  Empty,
} from "antd";
import { CheckCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import ListaServiciosUsados from "./ListaServiciosUsados";
import ListaMaterialesUsados from "./ListaMaterialesUsados";
import { aprobarRechazarEjecucionDiaria } from "../../../services/ejecucionDiariaServices";
import Swal from "sweetalert2";
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

export default function EjecucionDiariaList({ ejecuciones, user, refetch }) {
  const [notificationApi, contextHolder] = notification.useNotification();

  // ✨ 1. La notificación ahora es una función, no un estado.
  const handleCambioEstado = async (id, estado) => {
    // ✨ 1. Prepara los textos según la acción (aprobar o rechazar)
    const esAprobacion = estado === "aprobada";
    const titulo = esAprobacion ? "Aprobar Ejecución" : "Rechazar Ejecución";
    const textoBoton = esAprobacion ? "Sí, aprobar" : "Sí, rechazar";

    // ✨ 2. Abre el modal de Swal con un campo de texto
    const result = await Swal.fire({
      title: titulo,
      input: "textarea", // Crea un campo de texto
      inputLabel: "Motivo (Opcional)",
      inputPlaceholder: "Escribe aquí el motivo de tu decisión...",
      icon: esAprobacion ? "success" : "warning",
      showCancelButton: true,
      confirmButtonText: textoBoton,
      cancelButtonText: "Cancelar",
    });

    // Si el usuario confirmó la acción (presionó el botón de aprobar/rechazar)
    if (result.isConfirmed) {
      const motivoEstado = result.value || ""; // El valor del textarea, o un string vacío si no escribió nada

      try {
        // ✨ 3. Envía el estado Y el motivo a tu servicio
        const response = await aprobarRechazarEjecucionDiaria(id, {
          estado,
          motivoEstado,
        });

        notificationApi.success({
          message: "Éxito",
          description: response.message,
          placement: "top",
        });

        if (refetch) refetch();
      } catch (error) {
        console.error("Error al cambiar estado:", error);
        const message = error?.response?.data?.message || "Ocurrió un error.";

        notificationApi.error({
          message: "Error",
          description: message,
          placement: "top",
        });
      }
    }
  };

  return (
    <div style={{ width: "100%" }}>
      {contextHolder}

      <Title level={4}>Ejecución diaria del proyecto</Title>

      {ejecuciones.length === 0 ? (
        // ✨ 2. AntD tiene un componente 'Empty' para listas vacías.
        <Empty description="No hay ejecuciones registradas aún." />
      ) : (
        // ✨ 3. 'Accordion' de MUI se convierte en 'Collapse' de AntD.
        <Collapse accordion>
          {ejecuciones.map((item) => {
            // Panel Header personalizado
            const panelHeader = (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Text strong>
                  {new Date(item.createdAt).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                <Space style={{ marginTop: 4 }}>
                  {/* ✨ 4. 'Chip' de MUI se convierte en 'Tag' de AntD. */}
                  <Tag
                    icon={<CheckCircleOutlined />}
                    color={item.estado === "aprobada" ? "success" : "default"}
                  >
                    Estado: {item.estado}
                  </Tag>
                  <Tag icon={<InfoCircleOutlined />} color="processing">
                    Ejecución: {item.porcenEjecucion * 100}%
                  </Tag>
                </Space>
              </div>
            );

            return (
              <Panel header={panelHeader} key={item.id}>
                <Paragraph
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    background: "#f5f5f5",
                    padding: "10px",
                    borderRadius: "6px",
                  }}
                >
                  {item.comentario}
                </Paragraph>
                <Divider />
                <ListaServiciosUsados ejecucionId={item.id} />
                <Divider />
                <ListaMaterialesUsados ejecucionId={item.id} />
                <Divider />
                {
                  item.estado === "pendiente" ? (
                    <Paragraph>
                      <Text underline type="warning">
                        Pendiente de Aprobar
                      </Text>
                    </Paragraph>
                  ) : (
                    <Paragraph>
                      <Text strong>Comentario Supervisor: </Text>

                      {item.motivoEstado || "Sin comentario"}
                    </Paragraph>
                  ) // Muestra el estado normal si no es "pendiente"
                }

                {["admin", "supervisor", "lider"].includes(user.role) && (
                  // ✨ 5. 'Stack' de MUI se convierte en 'Space' de AntD.
                  <Space style={{ marginTop: 16 }}>
                    <Button
                      type="primary"
                      onClick={() => handleCambioEstado(item.id, "aprobada")}
                      // AntD no tiene un color 'success' por defecto, se puede estilizar si se desea
                      style={{
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                      }}
                    >
                      Aprobar
                    </Button>
                    <Button
                      danger
                      onClick={() => handleCambioEstado(item.id, "rechazada")}
                    >
                      Rechazar
                    </Button>
                  </Space>
                )}
              </Panel>
            );
          })}
        </Collapse>
      )}
    </div>
  );
}
