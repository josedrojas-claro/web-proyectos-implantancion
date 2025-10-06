import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import ListaDocumentos from "../ejecucionDiaria/components/ListaDocumentos";
import POConSolpedsSimple from "./components/POConSolpedsSimple";
import { Flex, Space, Typography, Alert, Spin, Empty } from "antd";
import { getDatosLiquidacionPorProyecto } from "../../services/liquidacionServices";

const { Text } = Typography;

export default function DetallesParaLiquidar() {
  const location = useLocation();
  const proyecto = location.state?.proyectoSeleccionado;
  const proyectoId = proyecto?.id;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!proyectoId) return;

    let ignore = false;
    const controller = new AbortController();

    const fetchPoSolpeds = async () => {
      setLoading(true);
      setError(null);
      try {
        // Si tu service no acepta signal, quita el objeto de opciones.
        const result = await getDatosLiquidacionPorProyecto(proyectoId, {
          signal: controller.signal,
        });
        if (!ignore) {
          // Normaliza por si el service retorna { data: [...] } o directamente [...]
          const arr = Array.isArray(result) ? result : result?.data ?? [];
          setData(arr);
        }
      } catch (err) {
        if (!ignore && err.name !== "AbortError") {
          console.error("Error al obtener datos de liquidación:", err);
          setError(err);
          setData([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchPoSolpeds();
    return () => {
      ignore = true;
      controller.abort();
    };
  }, [proyectoId]);

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

      <Space direction="vertical" size={24} style={{ width: "100%" }}>
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
          <POConSolpedsSimple data={data} />
        ) : (
          <Empty description="Este proyecto no tiene datos de liquidación aún." />
        )}
      </Space>
    </MainLayout>
  );
}
