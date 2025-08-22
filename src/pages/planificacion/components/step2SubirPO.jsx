import React, { useState } from "react";
import { Upload, Button, Collapse, Alert, Space, Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";

import { subirExcelSapConPo } from "../../../services/liquidacionServices";

const { Dragger } = Upload;
const { Panel } = Collapse;
const { Title, Text } = Typography;

const Step2SubirPo = ({ onUploadComplete }) => {
  const [loading, setLoading] = useState(false);
  const [processingLogs, setProcessingLogs] = useState([]);

  // Esta función se activa cuando el usuario selecciona un archivo
  const handleFileUpload = async (file) => {
    setLoading(true);
    setProcessingLogs([]);

    Swal.fire({
      title: "Procesando Archivo",
      text: "Por favor, espera...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      // ✨ Llamamos a nuestro nuevo servicio con el archivo seleccionado
      const response = await subirExcelSapConPo(file);

      Swal.close(); // Cerramos la alerta de "cargando"
      Swal.fire({
        icon: "success",
        title: "¡Archivo Procesado!",
        text: response.message,
      });

      setProcessingLogs(response.logs || []);
      if (onUploadComplete) onUploadComplete(true); // Avisamos al padre que el paso se completó
    } catch (error) {
      Swal.close();
      const errorMessage =
        error.response?.data?.message ||
        "Ocurrió un error al procesar el archivo.";
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space
      direction="vertical"
      align="center"
      style={{ width: "100%", marginTop: 24 }}
    >
      <Title level={5}>Paso 2: Cargar Archivo Excel con las POs</Title>
      <Text type="secondary" style={{ textAlign: "center", maxWidth: "500px" }}>
        Arrastra o selecciona el archivo Excel que descargaste y llenaste con
        los números de Orden de Compra (PO) y sus detalles.
      </Text>

      <Dragger
        name="file"
        multiple={false}
        // ✨ Usamos beforeUpload para tomar control del archivo y llamar a nuestro servicio
        beforeUpload={(file) => {
          handleFileUpload(file);
          return false; // Esto previene que Ant Design intente subir el archivo por su cuenta
        }}
        disabled={loading}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Haz clic o arrastra el archivo a esta área para subirlo
        </p>
      </Dragger>

      {/* Componente para mostrar los logs del procesamiento */}
      {processingLogs.length > 0 && (
        <Collapse style={{ marginTop: 20, width: "100%" }}>
          <Panel header="Ver Detalles del Procesamiento" key="1">
            <Space direction="vertical" style={{ width: "100%" }}>
              {processingLogs.map((log, index) => (
                <Alert
                  key={index}
                  message={log.message}
                  type={log.type}
                  showIcon
                />
              ))}
            </Space>
          </Panel>
        </Collapse>
      )}
    </Space>
  );
};

export default Step2SubirPo;
