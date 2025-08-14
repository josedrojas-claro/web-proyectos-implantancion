import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import { fetchListaHorasRetraso } from "../../services/proyectoServices";
import { Table, Typography, Tag, Spin, Alert, Input, Space } from "antd";
import { getEstadoColor } from "../../utils/colorUtils";

const { Title, Text } = Typography;
const { Search } = Input;

const columns = [
  { title: "Ticket", dataIndex: "ticketCode", key: "ticketCode" },
  {
    title: "Nombre del Proyecto",
    dataIndex: "nombreProyecto",
    key: "nombreProyecto",
  },
  {
    title: "Supervisor",
    dataIndex: "supervisorAsignado",
    key: "supervisorAsignado",
  },
  {
    title: "Estado Actual",
    dataIndex: "estadoActual",
    key: "estadoActual",
    render: (estado) => (
      <Tag color={getEstadoColor(estado)} key={estado}>
        {estado}
      </Tag>
    ),
  },
  {
    title: "Horas Transcurridas",
    dataIndex: "horasTranscurridas",
    key: "horasTranscurridas",
    align: "right",
  },
  {
    title: "Horas Retraso",
    dataIndex: "horasRetraso",
    key: "horasRetraso",
    align: "right",
    render: (horas) => (
      <Text type={horas > 0 ? "danger" : "secondary"}>
        <b>{horas}</b>
      </Text>
    ),
  },
];

export default function ListaProyectoHoras() {
  const [data, setData] = useState({ proyectos: [], totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 15,
      total: 0,
    },
    searchTerm: "",
  });

  useEffect(() => {
    setLoading(true);
    fetchListaHorasRetraso(
      tableParams.pagination.current,
      tableParams.pagination.pageSize,
      tableParams.searchTerm
    )
      .then((responseData) => {
        setData(responseData);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: responseData.totalItems,
          },
        }));
      })
      .catch((err) => {
        setError("No se pudo cargar la lista de proyectos.");
        console.error(err);
      })
      .finally(() => setLoading(false));

    // LA CORRECCIÓN DEFINITIVA: El array de dependencias solo contiene valores primitivos.
    // Se eliminó "tableParams.pagination" de aquí.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.searchTerm,
  ]);

  const handleTableChange = (pagination) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
    }));
  };

  const handleSearch = (value) => {
    setTableParams((prev) => ({
      ...prev,
      searchTerm: value,
      pagination: {
        ...prev.pagination,
        current: 1, // Volvemos a la página 1 en cada nueva búsqueda
      },
    }));
  };

  if (error) {
    return (
      <MainLayout>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ margin: "24px" }}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: 24 }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          <Title level={2}>Proyectos con Horas de Retraso</Title>
          <Search
            placeholder="Buscar por ticket o nombre..."
            onSearch={handleSearch}
            enterButton
            style={{ maxWidth: 400 }}
            allowClear
          />
          <Table
            columns={columns}
            dataSource={data.proyectos}
            rowKey="proyectoId"
            loading={loading}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            rowClassName={(record) =>
              record.horasRetraso > 0 ? "fila-retrasada" : ""
            }
          />
        </Space>
      </div>
    </MainLayout>
  );
}
