// POConSolpedsSimple.jsx
import React, { useMemo, useState } from "react";
import {
  Collapse,
  Tabs,
  Table,
  Space,
  Typography,
  Tag,
  Flex,
  Divider,
  Empty,
  Button,
  Tooltip,
} from "antd";

import { DownloadOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { Text, Title } = Typography;
import {
  exportarExcelPorNumeroPO,
  actualizarDataPo,
} from "../../../services/liquidacionServices";
import Swal from "sweetalert2";
import ActualizarFechasPO from "./ActualizarFechasPo";

// ---- Utils

function getQtyService(s) {
  return (
    s?.cantidadEjecutadaFin ??
    s?.cantidadAsignada ??
    s?.cantidadPlanificada ??
    s?.cantidadReplanteo ??
    0
  );
}

function getQtyMaterial(m) {
  return (
    m?.cantidadEjecutadaFinal ??
    m?.cantidadAsignado ??
    m?.cantidadPlanificada ??
    m?.cantidadReplanteo ??
    0
  );
}

/**
 * Transforma el arreglo de órdenes (POs) al árbol: PO -> SOLPED -> {servicios[], materiales[]}
 * y calcula contadores/quantities (no precios).
 */
function groupByPOandSolped(ordenes = []) {
  return ordenes.map((po) => {
    const solpedMap = new Map();

    (po.ordenesCompraPosiciones || []).forEach((pos) => {
      const sol = pos?.solpeds;
      if (!sol) return;

      if (!solpedMap.has(sol.id)) {
        solpedMap.set(sol.id, {
          solpedId: sol.id,
          numeroSOLPED: sol.numeroSOLPED,
          elementoPEP: sol.elementoPEP,
          grafo: sol.grafo,
          subtec: sol.subtec,
          descripcion: sol.descripcion,
          materiales: [],
          servicios: [],
          posiciones: [],
        });
      }

      const bucket = solpedMap.get(sol.id);
      bucket.posiciones.push({
        id: pos.id,
        numeroPosicion: pos.numeroPosicion,
      });

      (pos.serviciosAsignados || []).forEach((s) => {
        bucket.servicios.push({
          ...s,
          _posicionId: pos.id,
          _numeroPosicion: pos.numeroPosicion,
        });
      });

      (pos.MaterialAsignado || []).forEach((m) => {
        bucket.materiales.push({
          ...m,
          _posicionId: pos.id,
          _numeroPosicion: pos.numeroPosicion,
        });
      });
    });

    const solpeds = Array.from(solpedMap.values()).map((sp) => {
      const totalQtyServ = sp.servicios.reduce(
        (acc, s) => acc + getQtyService(s),
        0
      );
      const totalQtyMat = sp.materiales.reduce(
        (acc, m) => acc + getQtyMaterial(m),
        0
      );
      return {
        ...sp,
        contadores: {
          servicios: sp.servicios.length,
          materiales: sp.materiales.length,
          qtyServicios: totalQtyServ,
          qtyMateriales: totalQtyMat,
        },
      };
    });

    // Contadores a nivel PO
    const contadoresPO = solpeds.reduce(
      (acc, sp) => {
        acc.solpeds += 1;
        acc.servicios += sp.contadores.servicios;
        acc.materiales += sp.contadores.materiales;
        acc.qtyServicios += sp.contadores.qtyServicios;
        acc.qtyMateriales += sp.contadores.qtyMateriales;
        return acc;
      },
      {
        solpeds: 0,
        servicios: 0,
        materiales: 0,
        qtyServicios: 0,
        qtyMateriales: 0,
      }
    );

    return { ...po, solpeds, contadores: contadoresPO };
  });
}

// ---- Columnas (sin precios)

const serviceColumns = [
  {
    title: "Servicio",
    dataIndex: ["Servicios", "servicio"],
    key: "servicio",
    width: 120,
  },
  {
    title: "Descripción",
    dataIndex: ["Servicios", "descripcio"],
    key: "descripcio",
    ellipsis: true,
  },
  {
    title: "Unidad",
    dataIndex: ["Servicios", "unidadMedi"],
    key: "unidadMedi",
    width: 90,
  },
  {
    title: "Posición PO",
    key: "_numeroPosicion",
    width: 110,
    render: (_, s) => s?._numeroPosicion ?? "-",
    align: "center",
  },
  {
    title: "Cant. planificada",
    dataIndex: "cantidadPlanificada",
    key: "cantidadPlanificada",
    width: 130,
    align: "right",
  },
  {
    title: "Cant. ejecutada",
    key: "cantidadEjecutada",
    width: 130,
    render: (_, s) => getQtyService(s),
    align: "right",
  },
];

const materialColumns = [
  {
    title: "Código",
    dataIndex: ["material", "codigo"],
    key: "codigo",
    width: 120,
  },
  {
    title: "Descripción",
    dataIndex: ["material", "descripcion"],
    key: "descripcion",
    ellipsis: true,
  },
  {
    title: "Unidad",
    dataIndex: ["material", "unidadMedida"],
    key: "unidadMedida",
    width: 90,
  },
  {
    title: "Posición OC",
    key: "_numeroPosicion",
    width: 110,
    render: (_, m) => m?._numeroPosicion ?? "-",
    align: "center",
  },
  {
    title: "Cant. planificada",
    dataIndex: "cantidadPlanificada",
    key: "cantidadPlanificada",
    width: 130,
    align: "right",
  },
  {
    title: "Cant. asignada",
    dataIndex: "cantidadAsignado",
    key: "cantidadAsignado",
    width: 130,
    align: "right",
  },
  {
    title: "Cant. ejecutada",
    key: "cantidadEjecutada",
    width: 130,
    align: "right",
    render: (_, m) => getQtyMaterial(m),
  },
];

// ---- Vista

export default function POConSolpedsSimple({ data = [], refetch }) {
  const grouped = useMemo(() => groupByPOandSolped(data), [data]);
  const [isDownloading, setIsDownloading] = useState(false);

  const proyectoId = data[0].ordenesCompraPosiciones[0].solpeds.proyectoId;

  const handleExportarExcel = async (numeroPO) => {
    Swal.fire({
      title: "Generando archivo Excel",
      text: "Por favor, espera mientras preparamos tu archivo...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    setIsDownloading(true);
    try {
      await exportarExcelPorNumeroPO(proyectoId, numeroPO);
      Swal.fire({
        icon: "success",
        title: "¡Descarga Exitosa!",
        text: "Tu archivo se ha descargado correctamente.",
        timer: 2000, // Close automatically after 2 seconds
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al exportar Excel:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al generar el archivo Excel. Inténtalo de nuevo.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Crea un ISO que representa "YYYY-MM-DD 00:00:00" en hora local
  const toLocalMidnightISOZ = (yyyyMMdd) => {
    if (!yyyyMMdd) return null;
    const [y, m, d] = yyyyMMdd.split("-").map(Number);
    // Date(y, m-1, d, 0, 0, 0) crea la fecha en HORA LOCAL
    const local = new Date(y, m - 1, d, 0, 0, 0);
    // toISOString la convierte a UTC; en Managua (-06) será "YYYY-MM-DDT06:00:00.000Z"
    return local.toISOString();
  };

  const guardarFechas = async ({ fechaInicio, fechaFin, poId }) => {
    try {
      const fechas = {};
      if (fechaInicio != null) {
        // Enviar ISO en medianoche local (no .split('T')[0])
        fechas.fechaInicio = toLocalMidnightISOZ(fechaInicio);
      }
      if (fechaFin != null) {
        fechas.fechaFin = toLocalMidnightISOZ(fechaFin);
      }

      const response = await actualizarDataPo(poId, fechas);
      Swal.fire({
        icon: "success",
        title: "¡Fechas actualizadas!",
        text:
          response.message ||
          "Las fechas de la PO se han actualizado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      if (refetch) refetch();
    } catch (error) {
      console.error("Error al actualizar fechas:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron actualizar las fechas. Inténtalo de nuevo.",
      });
    }
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Title level={4} style={{ margin: 0 }}>
        Órdenes de Compra (PO) con SOLPEDs
      </Title>

      <Collapse accordion>
        {grouped.map((po) => (
          <Panel
            key={po.id}
            header={
              <Flex align="center" gap={12} wrap="wrap">
                <Text strong>PO #{po.numeroPO}</Text>
                <Tag color="blue">SOLPEDs: {po.contadores.solpeds}</Tag>
                <Tag color="geekblue">Servicios: {po.contadores.servicios}</Tag>
                <Tag color="gold">Materiales: {po.contadores.materiales}</Tag>

                <Tooltip title="Exporta los datos de esta PO en Excel">
                  <Button
                    size="small"
                    style={{
                      width: 140,
                    }}
                    icon={<DownloadOutlined />}
                    loading={isDownloading === po.numeroPO}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportarExcel(po.numeroPO);
                    }}
                    disabled={
                      Boolean(isDownloading) && isDownloading !== po.numeroPO
                    }
                  >
                    {isDownloading === po.numeroPO
                      ? "Descargando..."
                      : "Exportar Excel"}
                  </Button>
                </Tooltip>
                <ActualizarFechasPO
                  po={po}
                  onSave={(params) => guardarFechas({ ...params, poId: po.id })}
                />
              </Flex>
            }
          >
            {po.solpeds.length === 0 ? (
              <Empty description="Sin SOLPEDs" />
            ) : (
              <Collapse accordion>
                {po.solpeds.map((sp) => (
                  <Panel
                    key={sp.solpedId}
                    header={
                      <Flex vertical gap={4}>
                        <Flex align="center" gap={12} wrap="wrap">
                          <Text strong>SOLPED #{sp.numeroSOLPED}</Text>
                          {sp.subtec && (
                            <Tag color="purple">Subtec: {sp.subtec}</Tag>
                          )}
                          {sp.elementoPEP && (
                            <Tag color="cyan">PEP: {sp.elementoPEP}</Tag>
                          )}
                          {sp.grafo && (
                            <Tag color="magenta">Grafo: {sp.grafo}</Tag>
                          )}
                          <Tag>
                            Servicios: {sp.contadores.servicios} • Materiales:{" "}
                            {sp.contadores.materiales}
                          </Tag>
                        </Flex>
                      </Flex>
                    }
                  >
                    <Tabs
                      items={[
                        {
                          key: "servicios",
                          label: `Servicios (${sp.servicios.length})`,
                          children: sp.servicios.length ? (
                            <Table
                              rowKey={(r) => r.id}
                              columns={serviceColumns}
                              dataSource={sp.servicios}
                              size="small"
                              pagination={false}
                              scroll={{ x: true }}
                            />
                          ) : (
                            <Empty description="Sin servicios para este SOLPED" />
                          ),
                        },
                        {
                          key: "materiales",
                          label: `Materiales (${sp.materiales.length})`,
                          children: sp.materiales.length ? (
                            <Table
                              rowKey={(r) => r.id}
                              columns={materialColumns}
                              dataSource={sp.materiales}
                              size="small"
                              pagination={false}
                              scroll={{ x: true }}
                            />
                          ) : (
                            <Empty description="Sin materiales para este SOLPED" />
                          ),
                        },
                      ]}
                    />
                    <Divider style={{ margin: "8px 0" }} />
                  </Panel>
                ))}
              </Collapse>
            )}
          </Panel>
        ))}
      </Collapse>
    </Space>
  );
}
