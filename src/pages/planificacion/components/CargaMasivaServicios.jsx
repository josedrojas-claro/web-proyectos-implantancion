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
} from "antd";
import { CheckCircleOutlined, ExperimentOutlined } from "@ant-design/icons";
import {
  fetchServiciosPorArray,
  createServiciosPlanificacion,
} from "../../../services/serviciosServices"; // Asegúrate de importar tu servicio
import Swal from "sweetalert2"; // Asegúrate de tener SweetAlert2 instalado

const { TextArea } = Input;
const { Title, Text } = Typography;

// Columnas para la tabla de validación
const columns = [
  {
    title: "Código Servicio",
    dataIndex: "servicio",
    key: "servicio",
  },
  {
    title: "Descripción del Servicio",
    dataIndex: "descripcionServicio",
    key: "descripcionServicio",
    render: (text) => text || <Text type="danger">Servicio no encontrado</Text>,
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

const CargaMasivaServicios = ({
  contratistaId,
  proyectoId,
  onPlanificacionGuardada,
}) => {
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

  // Recibe el contratistaId como prop
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [tableData, setTableData] = useState([]);

  // El cerebro de la operación: Parsea, Llama a la API y Une los datos
  const handleProcesar = async () => {
    if (!contratistaId) {
      message.error("Por favor, seleccione un contratista primero.");
      return;
    }
    if (inputText.trim() === "") {
      message.warning("El campo de texto está vacío.");
      return;
    }

    setLoading(true);
    setTableData([]); // Limpia la tabla anterior

    try {
      // 1. PARSEO: Convierte el texto en un array de [servicio, cantidad]
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

      // 2. LLAMADA A LA API: Extrae solo los códigos de servicio para enviar al backend
      const codigosServicio = datosParseados.map((item) => item[0]);
      const serviciosDesdeAPI = await fetchServiciosPorArray(
        codigosServicio,
        contratistaId
      );

      // 3. UNIÓN DE DATOS: Combina los datos de la API con las cantidades del usuario
      const mapaServiciosAPI = new Map(
        serviciosDesdeAPI.map((s) => [s.servicio, s])
      );

      const datosFinales = datosParseados.map(([codigo, cantidad]) => {
        const detallesServicio = mapaServiciosAPI.get(codigo);
        return {
          key: codigo, // Key única para la tabla
          servicio: codigo,
          cantidad: cantidad,
          serviciosId: detallesServicio?.id || null,
          descripcionServicio: detallesServicio?.descripcionServicio || null,
          unidadMedida: detallesServicio?.unidadMedida || "N/A",
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
    // 1. Validar que tengamos los IDs necesarios
    if (!proyectoId || !contratistaId) {
      Swal.fire(
        "Error",
        "Falta el ID del proyecto o del contratista.",
        "error"
      );
      return;
    }

    // 2. Validar que no haya servicios no encontrados en la tabla
    const hayErrores = tableData.some((item) => !item.serviciosId);
    if (hayErrores) {
      Swal.fire(
        "Error de Validación",
        "La lista contiene servicios no encontrados o inválidos. Por favor, corríjalos antes de guardar.",
        "error"
      );
      return;
    }

    // 3. Confirmación con el usuario usando Swal
    const confirmacion = await Swal.fire({
      title: "¿Guardar Planificación?",
      text: `Se guardarán ${tableData.length} servicios en el proyecto. ¿Deseas continuar?`,
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
      // 4. Transformar los datos al formato que espera el backend
      const datosParaAPI = {
        contratistaId: contratistaId,
        servicios: tableData.map((item) => ({
          serviciosId: item.serviciosId,
          cantidadAsignada: item.cantidad,
        })),
      };

      const response = await createServiciosPlanificacion(
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

  return (
    <Card style={{ marginTop: 10 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={4}>Carga Rápida de Servicios</Title>
        <Alert
          message="Instrucciones"
          description="Copie y pegue desde una hoja de cálculo (Excel, Google Sheets). Asegúrese de tener dos columnas: la primera con el código del servicio y la segunda con la cantidad. Deben estar separadas por una tabulación (copiado directo de Excel) o un espacio."
          type="info"
          showIcon
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
              // Deshabilitamos el botón si hay algún servicio que no se encontró
              disabled={tableData.some((item) => !item.serviciosId)}
            >
              Guardar Planificación
            </Button>
          </Card>
        )}
      </Space>
      {contextHolder}
    </Card>
  );
};

export default CargaMasivaServicios;
