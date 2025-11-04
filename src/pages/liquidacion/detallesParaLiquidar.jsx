import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import ListaDocumentos from "../ejecucionDiaria/components/ListaDocumentos";
import POConSolpedsSimple from "./components/POConSolpedsSimple";
import {
  Flex,
  Space,
  Typography,
  Alert,
  Spin,
  Empty,
  Row,
  Col,
  Button,
  Card,
  Table,
  Tag,
  Divider,
} from "antd";
import { getDatosLiquidacionPorProyecto } from "../../services/liquidacionServices";
import { subirDocumentos } from "../../services/DocumentosServices";
import SubirArchivoValidDocumentos from "../ejecucionDiaria/components/SubirArchivoValidDocumentos";

import Swal from "sweetalert2";
const { Title, Text } = Typography;

export default function DetallesParaLiquidar() {
  const location = useLocation();
  const proyecto = location.state?.proyectoSeleccionado;
  const proyectoId = proyecto?.id;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchPoSolpeds = useCallback(async () => {
    if (!proyectoId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getDatosLiquidacionPorProyecto(proyectoId);
      const arr = Array.isArray(result) ? result : result?.data ?? [];
      setData(arr);
    } catch (err) {
      console.error("Error al obtener datos de liquidación:", err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [proyectoId]);

  useEffect(() => {
    fetchPoSolpeds();
    // No abort controller, solo fetch simple
  }, [fetchPoSolpeds]);

  // Si alguien llegó sin proyecto seleccionado
  if (!proyectoId) {
    return (
      <MainLayout>
        <Empty description="No se encontró el proyecto seleccionado." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Flex justify="center">
        <ProyectoResumenCard proyecto={proyecto} />
      </Flex>

      <Space
        direction="vertical"
        size={24}
        style={{ width: "100%", marginTop: 24 }}
      >
        {/* Banner informativo general */}
        <Alert
          type="info"
          showIcon
          message="Descargables del proyecto"
          description={
            <>
              Aquí encontrarás los documentos del proyecto listos para
              descargar. Los archivos con firma aparecerán también en la sección
              “Documentos firmados”.
            </>
          }
        />

        {/* Dos columnas con título y descripción para cada lista */}
        <Space direction="horizontal" size={25} wrap style={{ width: "100%" }}>
          <Space
            direction="vertical"
            size={8}
            style={{ minWidth: 360, flex: 1 }}
          >
            <Text strong>Documentos del proyecto</Text>
            <Text type="secondary">
              Descarga aquí planos, protocolos ópticos, informes y demás
              documentos.
            </Text>
            {proyectoId && <ListaDocumentos proyectoId={proyectoId} ventana />}
          </Space>

          <Space
            direction="vertical"
            size={8}
            style={{ minWidth: 360, flex: 1 }}
          >
            <Text strong>Documentos firmados</Text>
            <Text type="secondary">
              Archivos firmados y listos para descargar y adjuntar a la
              liquidación.
            </Text>
            {proyectoId && (
              <ListaDocumentos proyectoId={proyectoId} ventana docFirmados />
            )}
          </Space>
        </Space>

        {/* PO -> SOLPED -> Servicios/Materiales (sin precios) */}
        {loading ? (
          <Flex justify="center" style={{ padding: 24 }}>
            <Spin tip="Cargando órdenes de compra..." />
          </Flex>
        ) : error ? (
          <Alert
            type="error"
            showIcon
            message="No se pudieron cargar las órdenes de compra"
            description={error?.message || "Inténtalo de nuevo más tarde."}
          />
        ) : data?.length ? (
          <POConSolpedsSimple data={data} refetch={fetchPoSolpeds} />
        ) : (
          <Empty description="Este proyecto no tiene datos de liquidación aún." />
        )}
        <Title level={5}>Documentos Cargados</Title>
        <Row
          justify="center" // Centra las columnas horizontalmente
          align="middle" // Centra el contenido de las columnas verticalmente
          gutter={[16, 16]} // Espacio horizontal y vertical entre columnas
        >
          <Col
            xs={24}
            md={12}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <SubirArchivoValidDocumentos
              onSubmit={async ({ files, comentario }) => {
                try {
                  if (!files.length) {
                    return Swal.fire(
                      "Advertencia",
                      "Debes seleccionar al menos un archivo.",
                      "warning"
                    );
                  }

                  if (!comentario.trim()) {
                    return Swal.fire(
                      "Advertencia",
                      "El comentario no puede estar vacío.",
                      "warning"
                    );
                  }

                  const response = await subirDocumentos({
                    proyectoId: proyecto.id,
                    comentario,
                    estado: "PO firmadas", // ⚠️ cámbialo si usas otro tipo en backend
                    archivos: files,
                  });

                  setReloadKey((prev) => prev + 1);
                  Swal.fire("¡Éxito!", response.message, "success");
                } catch (error) {
                  console.error(error);
                  Swal.fire("Error", error.message, "error");
                }
              }}
            />
          </Col>
          <Col
            xs={24}
            md={12}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <ListaDocumentos
              proyectoId={proyecto.id}
              reloadTrigger={reloadKey}
              docFirmados={true}
            />
          </Col>
        </Row>
      </Space>
    </MainLayout>
  );
}
