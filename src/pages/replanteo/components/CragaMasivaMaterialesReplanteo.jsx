import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Card,
  Space,
  Typography,
  Alert,
  message,
  List,
} from "antd";
import { CheckCircleOutlined, ExperimentOutlined } from "@ant-design/icons";
import {
  fetchMaterialesPorArray,
  createMaterialesReplanteo,
} from "../../../services/materialesServices";
import Swal from "sweetalert2"; // Asegúrate de tener SweetAlert2 instalado

const { TextArea } = Input;
const { Title, Text } = Typography;

const columns = [
  {
    title: "Código Material",
    dataIndex: "codigo",
    key: "codigo",
  },
  {
    title: "Descripción del Material",
    dataIndex: "descripcion",
    key: "descripcion",
    render: (text) => text || <Text type="danger">Material no encontrado</Text>,
  },
  {
    title: "Unidad de Medida",
    dataIndex: "unidadMedida",
    key: "unidadMedida",
  },
  {
    title: "Cantidad (Ingresada)",
    dataIndex: "cantidad",
    key: "cantidad",
  },
];
export default function CargaMasivaMaterialesReplanteo({
  proyectoId,
  onPlanificacionGuardada,
}) {
  const [messageApi, contextHolder] = message.useMessage();

  const success = (text) => {
    messageApi.open({
      type: "success",
      content: text,
    });
  };

  const mesaageError = (text) => {
    messageApi.open({
      type: "error",
      content: text,
    });
  };

  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [tableData, setTableData] = useState([]);

  const handleProcesar = async () => {
    if (inputText.trim() === "") {
      message.warning("El campo de texto está vacío.");
      return;
    }

    setLoading(true);
    setTableData([]); // Limpia la tabla anterior

    try {
      // 1. PARSEO: Convierte el texto en un array de [material, cantidad]
      const lineas = inputText.trim().split("\n");
      const datosParseados = lineas.map((linea) => {
        const columnas = linea.split(/\s+/); // Divide por tabulación o espacios
        return [columnas[0], parseFloat(columnas[1])];
      });

      // Valida que los datos parseados sean correctos
      const datosInvalidos = datosParseados.some(
        (d) => d.length !== 2 || isNaN(d[1])
      );
      if (datosInvalidos) {
        throw new Error(
          "Formato de datos incorrecto. Asegúrese de que cada línea tenga [CÓDIGO] [CANTIDAD] y que la cantidad sea un número."
        );
      }

      // 2. LLAMADA A LA API: Extrae solo los códigos de materiales para enviar al backend
      const codigosMaterial = datosParseados.map((item) => item[0]);
      const materialesDesdeAPI = await fetchMaterialesPorArray(codigosMaterial);

      // 3. UNIÓN DE DATOS: Combina los datos de la API con las cantidades del usuario
      const mapaMaterialesAPI = new Map(
        materialesDesdeAPI.map((s) => [s.codigo, s])
      );

      const datosFinales = datosParseados.map(([codigo, cantidad]) => {
        const detallesMaterial = mapaMaterialesAPI.get(parseInt(codigo, 10)); // Convertimos a número para asegurar la coincidencia
        return {
          key: codigo, // Key única para la tabla
          codigo: codigo,
          cantidad: cantidad,
          materialesId: detallesMaterial?.id || null,
          descripcion: detallesMaterial?.descripcion || null,
          unidadMedida: detallesMaterial?.unidadMedida || "N/A",
        };
      });

      setTableData(datosFinales);
      success("Datos procesados y validados.");
    } catch (error) {
      console.log(error);
      mesaageError(
        error.response.data?.message ||
          "Ocurrió un error al procesar los datos."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarPlanificacion = async () => {
    if (!proyectoId) {
      Swal.fire("Error", "Falta el ID del proyecto", "error");
      return;
    }

    // 2. Validar que no haya servicios no encontrados en la tabla
    const hayErrores = tableData.some((item) => !item.materialesId);
    if (hayErrores) {
      Swal.fire(
        "Error de Validación",
        "La lista contiene materiales no encontrados o inválidos. Por favor, corríjalos antes de guardar.",
        "error"
      );
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Guardar Replanteo de Materiales?",
      text: `Se guardarán ${tableData.length} materiales en el proyecto. ¿Deseas continuar?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      const datosParaAPI = {
        materiales: tableData.map((item) => ({
          materialesId: item.materialesId,
          cantidadAsignada: item.cantidad,
        })),
      };

      const response = await createMaterialesReplanteo(
        datosParaAPI,
        proyectoId
      );

      await Swal.fire(
        "¡Éxito!",
        response.message || "Planificación guardada correctamente.",
        "success"
      );

      if (onPlanificacionGuardada) {
        onPlanificacionGuardada();
      }
      // 6. Limpiar el formulario después del éxito
      setInputText("");
      setTableData([]);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Ocurrió un error al guardar.";
      await Swal.fire("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const dataInstrucciones = [
    <>
      Copie y pegue los datos desde Excel. Use dos columnas:{" "}
      <strong>Código de Material</strong> y <strong>Cantidad</strong>.
    </>,
    <>
      <Text type="warning">
        <strong>¡Atención!</strong>
      </Text>{" "}
      Valide que las cantidades de los materiales correspondan a los servicios
      planificados o replanteados.
      <br />
      <Text type="secondary" style={{ fontSize: "12px" }}>
        Ej: Si el servicio es "Instalar 100m de fibra", el material "Fibra
        Óptica" debe ser 100.
      </Text>
    </>,
    <>
      Si no se asignarán materiales en esta etapa,{" "}
      <strong>deje el campo de texto en blanco</strong>.
    </>,
  ];

  return (
    <Card style={{ marginTop: 10 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={4}>Carga Rápida de Materiales</Title>
        <Alert
          message="Instrucciones para la Carga de Materiales"
          description={
            <List
              dataSource={dataInstrucciones}
              renderItem={(item) => (
                <List.Item style={{ padding: "8px 0", border: "none" }}>
                  <List.Item.Meta
                    avatar={
                      <ExperimentOutlined
                        style={{ fontSize: "16px", color: "#1890ff" }}
                      />
                    }
                    description={item}
                  />
                </List.Item>
              )}
            />
          }
          type="info"
          showIcon
          style={{ border: "1px solid #1890ff" }} // Borde azul para info
        />
        <TextArea
          rows={10}
          placeholder="Ejemplo:&#10;34025153	2&#10;34028572	1&#10;34028565	1"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <Button
          type="primary"
          onClick={handleProcesar}
          loading={loading}
          icon={<ExperimentOutlined />}
        >
          Procesar y Validar
        </Button>

        {tableData.length > 0 && (
          <Card type="inner" title="Resultado de la Validación">
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              bordered
            />
            <Button
              type="primary"
              onClick={handleGuardarPlanificacion}
              loading={loading}
              icon={<CheckCircleOutlined />}
              style={{ marginTop: "20px", width: "100%" }}
              // Deshabilitamos el botón si hay algún material que no se encontró
              disabled={tableData.some((item) => !item.materialesId)}
            >
              Guardar Replanteo
            </Button>
          </Card>
        )}
      </Space>
      {contextHolder}
    </Card>
  );
}
