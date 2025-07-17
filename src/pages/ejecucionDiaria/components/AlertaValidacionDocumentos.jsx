import React from "react";
import { Alert, Typography, Space } from "antd";
import { ExclamationCircleOutlined, FileTextOutlined, CheckSquareOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function AlertaValidacionDocumentos() {
  return (
    <div
      style={{
        backgroundColor: "#fdf6f6",
        padding: 24,
        borderRadius: 12,
        marginBottom: 24,
        border: "1px solid #f2caca",
      }}
    >
      <Alert
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined />}
        message={<strong>⚠️ Atención</strong>}
        description={
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Text>
              <FileTextOutlined style={{ marginRight: 8 }} />
              En esta sección debes subir todos los documentos finales requeridos para el cierre del proyecto.
            </Text>

            <Text>
              ⚠️ Una vez confirmada la carga, <strong>no podrás editar ni volver a subir archivos</strong>. Asegúrate de
              que los documentos estén completos y correctamente validados antes de continuar.
            </Text>

            <Text>
              <CheckSquareOutlined style={{ marginRight: 8 }} />
              Esta será la información oficial que quedará registrada en el sistema al cambiar el estado del proyecto a{" "}
              <Text strong style={{ color: "#1677ff" }}>
                RDO
              </Text>
              .
            </Text>
          </Space>
        }
      />
    </div>
  );
}
