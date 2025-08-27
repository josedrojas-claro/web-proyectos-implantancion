import React, { useState, useEffect } from "react";
import { Input, List, Spin, Typography } from "antd";
import { fetchMaterialesByFiltro } from "../../../services/materialesServices"; // Asegúrate que la ruta a tu servicio sea correcta

const { Text } = Typography;

// Este componente recibe una función `onSelect` para comunicar qué material se eligió.
const MaterialSearch = ({ onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Implementamos tu lógica de useEffect aquí
  useEffect(() => {
    const searchMaterials = async () => {
      if (searchTerm.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchMaterialesByFiltro(searchTerm);
        setResults(data);
      } catch (error) {
        console.error("Error al buscar materiales:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // El temporizador para el debounce
    const timerId = setTimeout(() => {
      searchMaterials();
    }, 500); // 500ms de espera

    // Función de limpieza
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]); // Se ejecuta solo cuando searchTerm cambia

  const handleSelect = (material) => {
    setSelectedId(material.id);
    onSelect(material.id);
  };

  return (
    <div>
      <Text type="secondary" style={{ marginTop: 0 }}>
        Busca el nuevo codigo de material que vas a cambiar
      </Text>
      <Input
        placeholder="Buscar por código"
        onChange={(e) => setSearchTerm(e.target.value)}
        autoFocus
      />
      {loading && <Spin style={{ margin: "1rem 0" }} />}
      <List
        style={{ marginTop: "1rem", maxHeight: "250px", overflowY: "auto" }}
        bordered
        dataSource={results}
        renderItem={(item) => (
          <List.Item
            onClick={() => handleSelect(item)}
            style={{
              cursor: "pointer",
              backgroundColor:
                selectedId === item.id ? "#e6f7ff" : "transparent",
            }}
          >
            <div>
              <Text strong>{item.codigo}</Text>
              <br />
              <Text type="secondary">{item.descripcion}</Text>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default MaterialSearch;
