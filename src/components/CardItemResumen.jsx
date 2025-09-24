import React, { useState } from "react";
import {
  List,
  Typography,
  Avatar,
  Row,
  Col,
  Button,
  Tooltip,
  Flex,
  Modal,
  Input,
  Spin,
  Space,
} from "antd";
import { EditOutlined, SearchOutlined } from "@ant-design/icons";
import { fetchServiciosByContratista } from "../services/serviciosServices";
import { fetchMaterialesByFiltro } from "../services/materialesServices";
import { updateServiciosAsignadosEjecucion } from "../services/serviciosServices"; // Asumimos que tienes un servicio así
import Swal from "sweetalert2";

const { Text, Paragraph } = Typography;
const Metric = ({ title, value, color }) => (
  <div>
    <Text type="secondary" style={{ fontSize: "12px" }}>
      {title}
    </Text>
    <br />
    <Text
      strong
      style={{ color: color || "inherit", fontSize: "14px", lineHeight: 1.2 }}
    >
      {value}
    </Text>
  </div>
);

// NUEVO NOMBRE: Componente genérico para Servicios o Materiales
export default function ItemResumen({
  dataSource,
  tipo,
  role,
  contratistaId,
  onUpdateSuccess,
}) {
  const getDiferenciaColor = (diferencia) => {
    if (diferencia > 0) return "#faad14";
    if (diferencia < 0) return "#f5222d";
    return "#52c41a";
  };

  const allowedRoles = ["admin", "planificador", "coordinador-ing"];

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null); // Guarda el item que se está editando
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- 2. FUNCIONES PARA MANEJAR EL MODAL ---
  const showEditModal = (item) => {
    setCurrentItem(item);
    setSearchResults([]);
    setSearchTerm("");
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentItem(null);
  };

  // --- 3. FUNCIÓN PARA BUSCAR NUEVOS SERVICIOS O MATERIALES ---
  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsLoadingSearch(true);
    try {
      let results;
      if (tipo === "Servicio") {
        results = await fetchServiciosByContratista(contratistaId, searchTerm);
      } else {
        results = await fetchMaterialesByFiltro(searchTerm); // Asume que tienes un fetchMateriales general
      }
      setSearchResults(results);
    } catch (error) {
      console.error("Error buscando:", error);
      // Aquí podrías mostrar una notificación de error
    } finally {
      setIsLoadingSearch(false);
    }
  };

  // --- 4. FUNCIÓN PARA SELECCIONAR Y ACTUALIZAR EL ITEM ---
  const handleSelectNewItem = async (newItem) => {
    const esServicio = tipo === "Servicio";
    const nuevoCodigo = esServicio ? newItem.servicio : newItem.codigo;

    const result = await Swal.fire({
      title: "¿Confirmar cambio?",
      text: `Se cambiará el item actual por "${nuevoCodigo}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setIsUpdating(true);
      try {
        // Llama a un servicio genérico de actualización
        await updateServiciosAsignadosEjecucion(currentItem.id, newItem.id);

        setIsModalVisible(false);
        // Notifica al padre que la actualización fue exitosa para que pueda refrescar
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }

        Swal.fire(
          "¡Actualizado!",
          "El item ha sido cambiado con éxito.",
          "success"
        );
      } catch (error) {
        console.error("Error al actualizar:", error);
        Swal.fire("Error", "No se pudo actualizar el item.", "error");
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <>
      <List
        itemLayout="vertical"
        dataSource={dataSource}
        renderItem={(item, index) => {
          // LÓGICA NUEVA: Determina qué datos mostrar según el 'tipo'
          const esServicio = tipo === "Servicio";
          const codigo = esServicio
            ? item.Servicios.servicio
            : item.material.codigo;
          const descripcion = esServicio
            ? item.Servicios.descripcionServicio
            : item.material.descripcion;

          return (
            <List.Item
              key={item.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #f0f0f0",
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "12px",
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ backgroundColor: "#1890ff" }}>
                    {index + 1}
                  </Avatar>
                }
                title={
                  <Flex justify="space-between" align="center">
                    {/* Muestra el título y código correctos */}
                    <Text strong>
                      {tipo}: {codigo}
                    </Text>

                    {allowedRoles.includes(role) && (
                      <Tooltip title={`Editar ${tipo}`}>
                        <Button
                          type="text"
                          shape="circle"
                          icon={<EditOutlined />}
                          onClick={() => showEditModal(item)}
                        />
                      </Tooltip>
                    )}
                  </Flex>
                }
                description={
                  <Paragraph
                    type="secondary"
                    ellipsis={{ rows: 1 }}
                    style={{ marginBottom: 0 }}
                  >
                    {/* Muestra la descripción correcta */}
                    {descripcion}
                  </Paragraph>
                }
              />

              <Row gutter={[16, 16]} style={{ marginTop: "10px" }}>
                <Col xs={12} md={8} lg={4}>
                  <Metric
                    title="Planificado"
                    value={item.cantidadPlanificada}
                  />
                </Col>
                <Col xs={12} md={8} lg={4}>
                  <Metric title="Replanteado" value={item.cantidadReplanteo} />
                </Col>
                <Col xs={12} md={8} lg={4}>
                  <Metric
                    title="Asignada"
                    value={item.cantidadAsignado || item.cantidadAsignada}
                  />
                </Col>
                <Col xs={12} md={8} lg={4}>
                  <Metric title="Ejecutada" value={item.cantidadEjecutada} />
                </Col>
                <Col xs={12} md={8} lg={4}>
                  <Metric title="Adicional" value={item.cantidadAdicional} />
                </Col>
                <Col xs={12} md={8} lg={4}>
                  <Metric
                    title="Diferencia"
                    value={item.diferencia.toFixed(2)}
                    color={getDiferenciaColor(item.diferencia)}
                  />
                </Col>
              </Row>
            </List.Item>
          );
        }}
      />
      {/* --- 5. EL MODAL DE EDICIÓN --- */}
      <Modal
        title={`Cambiar ${tipo}`}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null} // Footer personalizado
        width={800}
        destroyOnClose
      >
        <Spin spinning={isUpdating}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input.Search
              placeholder={`Buscar ${tipo} por código o descripción...`}
              enterButton={<Button icon={<SearchOutlined />} type="primary" />}
              size="large"
              onSearch={handleSearch}
              loading={isLoadingSearch}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Text type="secondary">Resultados de la búsqueda:</Text>
            <List
              bordered
              dataSource={searchResults}
              style={{ maxHeight: "300px", overflowY: "auto" }}
              renderItem={(newItem) => {
                const esServicio = tipo === "Servicio";
                const nuevoCodigo = esServicio
                  ? newItem.servicio
                  : newItem.codigo;
                const nuevaDesc = esServicio
                  ? newItem.descripcionServicio
                  : newItem.descripcion;
                return (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        onClick={() => handleSelectNewItem(newItem)}
                      >
                        Seleccionar
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={nuevoCodigo}
                      description={nuevaDesc}
                    />
                  </List.Item>
                );
              }}
            />
          </Space>
        </Spin>
      </Modal>
    </>
  );
}
