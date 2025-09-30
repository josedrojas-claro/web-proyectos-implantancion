import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Typography,
  Table,
  InputNumber,
  Button,
  Space,
  Statistic,
  Alert,
  Result,
  Row,
  Col,
} from "antd";
import {
  RetweetOutlined,
  RollbackOutlined,
  SwapOutlined,
  DeleteOutlined,
  IssuesCloseOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const ModalAsignacionRetiros = ({
  visible,
  onClose,
  onConfirm,
  onReasignar,
  onAsignarContratista,
  onRollbackMaterial,
  onDelete,
  reasignarReserva,
  stockDisponible,
  materialInfo,
}) => {
  const [retiros, setRetiros] = useState({});

  useEffect(() => {
    if (!visible) setRetiros({});
  }, [visible]);

  // --- Cálculos (sin cambios aquí) ---
  const MARGEN_TOLERANCIA = 0.01;
  const MARGEN_TOLERANCIA_SUPERIOR = 0.1;
  const cantidadObjetivo = materialInfo?.cantidadReplanteo || 0;
  const variacion = cantidadObjetivo * MARGEN_TOLERANCIA;
  const variacionMaxima = cantidadObjetivo * MARGEN_TOLERANCIA_SUPERIOR;
  const cantidadMinima = parseFloat((cantidadObjetivo - variacion).toFixed(2));
  const cantidadMaxima = parseFloat(
    (cantidadObjetivo + variacionMaxima).toFixed(2)
  );
  const totalRetirado = Object.values(retiros).reduce(
    (sum, val) => sum + (val || 0),
    0
  );
  const esValido =
    totalRetirado >= cantidadMinima && totalRetirado <= cantidadMaxima;

  const toNum = (v) => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = parseFloat(v.replace(/,/g, ""));
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  };

  const noStock =
    !Array.isArray(stockDisponible) ||
    stockDisponible.length === 0 ||
    stockDisponible.every((r) => toNum(r.cantidadDisponible) <= 0);

  // Mapeo por ID para encontrar rápido la info de la fila
  const stockById = useMemo(() => {
    const map = new Map();
    (stockDisponible || []).forEach((item) => {
      map.set(item.id, item); // <-- CAMBIO: Usamos el ID como clave del mapa
    });
    return map;
  }, [stockDisponible]);

  const handleRetiroChange = (id, value, maxDisponible) => {
    // <-- CAMBIO: el primer param es 'id'
    const nuevaCantidad = Math.min(value || 0, toNum(maxDisponible));
    setRetiros((prev) => ({
      ...prev,
      [id]: nuevaCantidad, // <-- CAMBIO: la clave del estado es el id
    }));
  };

  const handleConfirmar = () => {
    const retirosParaEnviar = Object.entries(retiros)
      .filter(([, cantidad]) => (cantidad || 0) > 0)
      .map(([id, cantidad]) => {
        // <-- CAMBIO: la clave es el 'id'
        const row = stockById.get(Number(id)) || {}; // <-- CAMBIO: Buscamos en el mapa por ID

        const cantidadDisponibleNum = toNum(row.cantidadDisponible);
        const valorUnitarioNum = toNum(row.valorUnitario);
        const precioUnitario =
          cantidadDisponibleNum > 0
            ? valorUnitarioNum / cantidadDisponibleNum
            : 0;

        return {
          centro: row.centro,
          almacen: row.almacen,
          cantidad: toNum(cantidad),
          precio: Number(precioUnitario.toFixed(2)),
          materialAsignadoId: materialInfo.id,
        };
      });

    onConfirm(retirosParaEnviar);
  };

  const columns = [
    { title: "Centro", dataIndex: "centro", key: "centro" },
    { title: "Almacén", dataIndex: "almacen", key: "almacen" },
    {
      title: "Disponible",
      dataIndex: "cantidadDisponible",
      key: "disponible",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Cantidad a Retirar",
      key: "retirar",
      render: (_, record) => {
        const id = record.id; // <-- CAMBIO: La clave ahora es el ID único
        return (
          <InputNumber
            min={0}
            max={toNum(record.cantidadDisponible)}
            value={retiros[id] ?? undefined} // <-- CAMBIO: Usamos el ID para leer el estado
            onChange={
              (value) =>
                handleRetiroChange(id, value, record.cantidadDisponible) // <-- CAMBIO: Pasamos el ID
            }
            style={{ width: "100%" }}
            placeholder="0"
          />
        );
      },
    },
  ];

  return (
    <Modal
      title="Asignar Retiro de Material desde Inventario"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          disabled={!esValido || noStock}
          onClick={handleConfirmar}
        >
          Confirmar Retiros
        </Button>,
      ]}
    >
      {/* ... El resto del JSX no necesita cambios ... */}
      <Alert
        message={`Objetivo (Replanteo): ${cantidadObjetivo} | Rango Aceptable: ${cantidadMinima} a ${cantidadMaxima}`}
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      <Space align="center" size="large" style={{ marginBottom: 24 }}>
        <Statistic
          title="Total a Retirar"
          value={totalRetirado}
          precision={2}
        />
        <Statistic
          title="Estado"
          value={esValido ? "Dentro del Rango" : "Fuera de Rango"}
          valueStyle={{ color: esValido ? "#3f8600" : "#cf1322" }}
        />
      </Space>
      {noStock ? (
        <Result
          status="warning"
          title="Sin stock disponible para este material"
          subTitle="Puedes reasignar el código de material a otro con disponibilidad en el stock general."
        />
      ) : (
        <Table
          columns={columns}
          dataSource={stockDisponible}
          rowKey={(record) => record.id} // <-- CAMBIO PRINCIPAL
          pagination={false}
          bordered
        />
      )}
      <Row
        justify="center"
        align="middle"
        gutter={[16, 8]}
        style={{ marginTop: 12 }}
      >
        <Col>
          <Button
            type="primary"
            icon={<RollbackOutlined />}
            onClick={onRollbackMaterial}
          >
            Rollbacks código material
          </Button>
        </Col>
        <Col>
          <Button
            color="purple"
            variant="solid"
            icon={<RetweetOutlined />}
            onClick={onReasignar}
          >
            Reasignar código material
          </Button>
        </Col>

        <Col>
          <Button
            color="cyan"
            variant="solid"
            icon={<SwapOutlined />}
            onClick={onAsignarContratista}
          >
            Suministro Contratista
          </Button>
        </Col>
        <Col>
          <Button
            danger
            type="primary"
            icon={<DeleteOutlined />}
            onClick={onDelete}
          >
            Limpiar
          </Button>
        </Col>
        <Col>
          <Button
            color="geekblue"
            variant="solid"
            icon={<IssuesCloseOutlined />}
            onClick={reasignarReserva}
          >
            Cambiar Reserva
          </Button>
        </Col>
      </Row>
    </Modal>
  );
};

export default ModalAsignacionRetiros;
