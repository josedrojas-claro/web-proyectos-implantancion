import React, { useEffect, useState, useCallback } from "react";
import { List, Typography, Tooltip, Button, Space } from "antd";
import {
  DownloadOutlined,
  DeleteOutlined,
  FileOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import "dayjs/locale/es";
dayjs.locale("es");

import {
  fetchDocumentosByProyect,
  descargarArchivoDesdeUrl,
  deleteDocumentoById,
  fetchDocumentosByPo,
} from "../../../services/DocumentosServices";

export default function ListaDocumentos({
  proyectoId,
  reloadTrigger,
  ventana = false,
  docFirmados = false,
}) {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarDocumentos = useCallback(async () => {
    setLoading(true);
    try {
      const data = docFirmados
        ? await fetchDocumentosByPo(proyectoId) // <- usa esta si docFirmados === true
        : await fetchDocumentosByProyect(proyectoId); // <- default
      setDocumentos(data);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    } finally {
      setLoading(false);
    }
  }, [proyectoId, docFirmados]);

  useEffect(() => {
    cargarDocumentos();
  }, [cargarDocumentos, reloadTrigger]);

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Este archivo será eliminado permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteDocumentoById(id);
      await cargarDocumentos();
      Swal.fire("Eliminado", "El archivo ha sido eliminado.", "success");
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo eliminar el archivo.", "error");
    }
  };

  return (
    <List
      size="small"
      loading={loading}
      header={
        <Typography.Text strong>
          <FileOutlined style={{ marginRight: 8 }} />
          {!docFirmados ? "Documentos Subidos" : "Documentos Firmados"}
        </Typography.Text>
      }
      bordered
      dataSource={documentos}
      locale={{ emptyText: "No hay documentos subidos." }}
      renderItem={(doc) => (
        <List.Item
          style={{
            paddingTop: 6,
            paddingBottom: 6,
            paddingLeft: 8,
            paddingRight: 8,
          }}
          actions={[
            <Tooltip title="Descargar" key="download">
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() =>
                  descargarArchivoDesdeUrl(doc.nombreArchivo, doc.id)
                }
              />
            </Tooltip>,
            !ventana && (
              <Tooltip title="Eliminar" key="delete">
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleEliminar(doc.id)}
                />
              </Tooltip>
            ),
          ]}
        >
          <Tooltip
            title={
              <div>
                <div>
                  <b>Archivo:</b> {doc.nombreArchivo || "Sin nombre archivo"}
                </div>
                <div>
                  <b>Comentario:</b> {doc.descripcion || "Sin comentario"}
                </div>
                <div>
                  <b>Subido:</b>{" "}
                  {dayjs(doc.createdAt).format("D MMM YYYY, hh:mm a")}
                </div>
                <div>
                  <b>Por:</b> {doc.SubidoPor?.UserData?.nombre || "Desconocido"}
                </div>
              </div>
            }
            placement="topLeft"
          >
            <Space size="small" style={{ minWidth: 0, flexWrap: "wrap" }}>
              <FileOutlined style={{ color: "#1677ff" }} />
              <Typography.Text ellipsis style={{ maxWidth: 300 }}>
                {doc.nombreArchivo}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                ellipsis
                style={{ maxWidth: 150 }}
              >
                {doc.descripcion || "Sin comentario"}
              </Typography.Text>
              <UserOutlined style={{ color: "#aaa", marginLeft: 4 }} />
              <Typography.Text
                type="secondary"
                ellipsis
                style={{ maxWidth: 90 }}
              >
                {doc.SubidoPor?.UserData?.nombre || "Desconocido"}
              </Typography.Text>
              <InfoCircleOutlined style={{ color: "#aaa", marginLeft: 4 }} />
              <Typography.Text
                type="secondary"
                ellipsis
                style={{ maxWidth: 80 }}
              >
                {dayjs(doc.createdAt).format("D MMM YY")}
              </Typography.Text>
            </Space>
          </Tooltip>
        </List.Item>
      )}
      style={{
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px #f0f1f2",
        padding: 0,
        width: "100%",
        maxWidth: 800,
      }}
    />
  );
}
