import React from "react";
import { List, Spin, Typography, Alert, Tag } from "antd";
import { useEffect, useState } from "react";
import { getListaPo } from "../../../services/liquidacionServices"; // 1. Import your service

const { Text } = Typography;

const ListaPoComponent = ({ proyectoId }) => {
  // --- 2. State Management ---
  const [loading, setLoading] = useState(true);
  const [listaPo, setListaPo] = useState([]);
  const [error, setError] = useState(null);

  // --- 3. Data Fetching ---
  useEffect(() => {
    const fetchPoData = async () => {
      if (!proyectoId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getListaPo(proyectoId);
        setListaPo(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching PO list:", err);
        setError("No se pudo cargar la lista de Órdenes de Compra.");
      } finally {
        setLoading(false);
      }
    };

    fetchPoData();
  }, [proyectoId]); // Re-fetches if the proyectoId changes

  // --- 4. Render Logic ---
  if (loading) {
    return <Spin tip="Cargando Órdenes de Compra..." />;
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  if (listaPo.length === 0) {
    return (
      <Alert
        message="No hay Órdenes de Compra asignadas a este proyecto."
        type="info"
      />
    );
  }

  return (
    <List
      header={<Text strong>Órdenes de Compra Asociadas</Text>}
      bordered
      dataSource={listaPo}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            title={`PO: ${item.numeroPO}`}
            description={`Registrada el: ${new Date(
              item.createdAt
            ).toLocaleDateString("es-NI")}`}
          />
        </List.Item>
      )}
    />
  );
};

export default ListaPoComponent;
