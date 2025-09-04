import React, { useEffect, useState } from "react";
import { Input, Table, Button } from "antd";
import {
  fetchInventarioParaReasignar,
  reasignarMaterialDesdeInventario,
} from "../../../services/materialesServices";
import Swal from "sweetalert2"; // <-- ¡Añade esta importación!

const InventarioModalContent = ({
  materialSeleccionado,
  onReasignacionExitosa,
}) => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const res = await fetchInventarioParaReasignar({
        limit: params.pageSize,
        offset: (params.current - 1) * params.pageSize,
        search: params.search || "",
      });

      setData(res.materiales);
      setPagination({
        ...params,
        total: res.totalItems,
      });
    } catch (error) {
      console.error("Error al cargar inventario", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ current: 1, pageSize: 10 });
  }, []);

  const handleSearch = () => {
    fetchData({ current: 1, pageSize: pagination.pageSize, search });
  };

  const handleTableChange = (pagination) => {
    fetchData({ ...pagination, search });
  };

  const columns = [
    { title: "Código", dataIndex: "materialCodigo", key: "materialCodigo" },
    {
      title: "Descripción",
      dataIndex: "materialDescripcion",
      key: "materialDescripcion",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidadDisponible",
      key: "cantidadDisponible",
    },

    { title: "Centro", dataIndex: "centro", key: "centro" },
    { title: "Almacén", dataIndex: "almacen", key: "almacen" },
    {
      title: "Acción",
      key: "accion",
      render: (text, record) => (
        <Button onClick={() => handleReasignar(record)}>Reasignar</Button>
      ),
    },
  ];

  const handleReasignar = async (record) => {
    try {
      const response = await reasignarMaterialDesdeInventario(
        materialSeleccionado.id,
        { codigo: record.materialCodigo }
      );
      Swal.fire(
        "¡Éxito!",
        response.message || "El material ha sido reasignado.",
        "success"
      );

      if (onReasignacionExitosa) {
        onReasignacionExitosa();
      }
      Swal.close();
    } catch (error) {
      console.error("Error al reasignar material:", error);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div>
        <strong style={{ fontSize: "13px" }}>Material a sustituir:</strong>
        <br />
        <span style={{ fontSize: "12px" }}>
          <b>Código:</b> {materialSeleccionado.material?.codigo}
        </span>
        <br />
        <span style={{ fontSize: "12px" }}>
          <b>Descripción:</b> {materialSeleccionado.material?.descripcion}
        </span>
        <br />
        <span style={{ fontSize: "12px" }}>
          <b>Cantidad:</b> {materialSeleccionado.cantidadReplanteo}
        </span>
      </div>

      <Input.Search
        placeholder="Buscar material"
        enterButton="Buscar"
        onSearch={handleSearch}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ y: 250 }}
      />
    </div>
  );
};

export default InventarioModalContent;
