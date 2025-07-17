import React, { useState } from "react";
import { Upload, Input, Button, Card, Typography, Space, message } from "antd";
import { UploadOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;

export default function SubirArchivoValidDocumentos({ onSubmit }) {
  const [fileList, setFileList] = useState([]);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const files = fileList.map((f) => f.originFileObj);
      await onSubmit?.({ files, comentario });
      setFileList([]);
      setComentario("");
      message.success("Archivos subidos correctamente");
    } catch (error) {
      console.error("Error al subir documentos:", error);
      message.error("Error al subir los archivos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      style={{
        maxWidth: 600,
        minWidth: 550,
        margin: "auto",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
      title={
        <Space>
          <UploadOutlined />
          <Typography.Text strong>Subir Documentos Finales</Typography.Text>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Upload
          multiple
          beforeUpload={() => false} // para evitar la subida automática
          fileList={fileList}
          onChange={handleUploadChange}
        >
          <Button icon={<UploadOutlined />}>Seleccionar archivos</Button>
        </Upload>

        {fileList.length > 0 && (
          <Typography.Text type="secondary">{fileList.length} archivo(s) seleccionado(s)</Typography.Text>
        )}

        <TextArea
          placeholder="Comentario"
          rows={4}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
        />

        <Button type="primary" icon={<CheckCircleOutlined />} loading={loading} onClick={handleSubmit} block>
          Subir información
        </Button>
      </Space>
    </Card>
  );
}
