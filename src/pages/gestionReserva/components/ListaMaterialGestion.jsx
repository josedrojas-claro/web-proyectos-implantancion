import React from "react";
import ReactDOM from "react-dom/client";
import { Table, Card, Typography, Tag, Button, Space } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import MaterialSearch from "./MaterialSearch";
import BottonExcelReserva from "./BottonDescargarExcelReserva";
import { updateMaterialesReplanteo } from "../../../services/materialesServices";
const { Title, Text } = Typography;

const ListaMaterialesGestion = ({
  materiales,
  loading,
  onUpdate,
  proyectoId,
}) => {
  const columns = [
    {
      title: "Código",
      dataIndex: ["material", "codigo"],
      key: "codigo",
    },
    {
      title: "Descripción",
      dataIndex: ["material", "descripcion"],
      key: "descripcion",
    },
    {
      title: "Planificado",
      dataIndex: "cantidadPlanificada",
      key: "planificada",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Replanteado",
      dataIndex: "cantidadReplanteo",
      key: "cantidadReplanteo",
      render: (text) => <Tag color="cyan">{text}</Tag>,
    },
    {
      title: "Cantidad a Entregar",
      dataIndex: "cantidadEntregadaClaro",
      key: "cantidadEntregadaClaro",
      render: (text) => <Tag color="blue-inverse">{text}</Tag>,
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => handleEdit(record)}>
            Editar Cantidad
          </Button>
          {/* ✨ NUEVO: Agregamos el segundo botón para editar el código. */}
          <Button onClick={() => handleEditCode(record)}>Editar Código</Button>
        </Space>
      ),
    },
  ];

  const handleEdit = async (record) => {
    // 1. Usamos Swal.fire para crear el diálogo de edición
    const { value: nuevaCantidadStr } = await Swal.fire({
      title: "Asignar Cantidad",
      // Mostramos un mensaje claro sobre la acción por defecto
      html: `
  <p style="text-align: left; font-size: 16px;">
    Confirme o modifique la cantidad sugerida para que coincida con el <strong>stock real en su bodega.</strong>
  </p>
  <p style="text-align: left; font-size: 14px; margin-top: 8px;">
    Si no realiza cambios, la cantidad del replanteo se asignará por defecto al guardar la reserva.
  </p>
  <div style="margin-top: 1rem; text-align: left; background-color: #f7f7f7; padding: 10px; border-radius: 5px;">
    <p><strong>Código:</strong> ${record.material.codigo}</p>
    <p><strong>Descripción:</strong> ${record.material.descripcion}</p>
    <p><strong>Cantidad Replanteo (Sugerida):</strong> ${record.cantidadReplanteo}</p>
  </div>
`,
      input: "number", // Creamos un campo de entrada numérico
      // Pre-rellenamos el campo con el valor del replanteo
      inputValue: record.cantidadReplanteo,
      showCancelButton: true,
      confirmButtonText: "Confirmar y Asignar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        // La validación sigue siendo importante
        if (!value || parseFloat(value) < 0) {
          return "Por favor, ingresa un número válido y positivo.";
        }
      },
    });

    // 2. Si el usuario confirma y hay un valor
    if (nuevaCantidadStr) {
      const nuevaCantidad = parseFloat(nuevaCantidadStr);

      // Verificamos si el valor realmente cambió para evitar llamadas innecesarias a la API
      if (nuevaCantidad !== record.cantidadEntregadaClaro) {
        try {
          // Mostramos una alerta de carga mientras se procesa
          Swal.fire({
            title: "Actualizando...",
            text: "Por favor, espera.",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          // 3. Preparamos los datos y llamamos al servicio de actualización
          // El objeto que enviamos ahora modifica 'cantidadEntregadaClaro'
          const data = { cantidadEntregadaClaro: nuevaCantidad };
          await updateMaterialesReplanteo(record.id, data);

          Swal.fire(
            "¡Actualizado!",
            "La cantidad ha sido asignada correctamente.",
            "success"
          );

          // 4. Llamamos a la función para refrescar los datos en el componente padre
          if (onUpdate) {
            onUpdate();
          }
        } catch (error) {
          console.error("Error al actualizar la cantidad asignada:", error);
          Swal.fire("Error", "No se pudo actualizar la cantidad.", "error");
        }
      } else {
        // Opcional: Informar al usuario que no hubo cambios
        Swal.fire(
          "Sin cambios",
          "La cantidad asignada no fue modificada.",
          "info"
        );
      }
    }
  };

  const handleEditCode = async (record) => {
    let selectedMaterialId = null; // Variable para guardar el ID seleccionado

    const result = await Swal.fire({
      title: "Cambiar Código de Material",
      html: '<div id="material-search-container"></div>', // Contenedor para nuestro componente
      width: "600px",
      showCancelButton: true,
      confirmButtonText: "Actualizar",
      cancelButtonText: "Cancelar",

      // didOpen es la clave: se ejecuta cuando el modal se abre.
      didOpen: () => {
        const container = document.getElementById("material-search-container");
        const root = ReactDOM.createRoot(container);
        root.render(
          <MaterialSearch
            onSelect={(id) => {
              selectedMaterialId = id; // Guardamos el ID cuando el usuario selecciona uno
            }}
          />
        );
      },

      // preConfirm se ejecuta antes de cerrar el modal al confirmar.
      // Ideal para validaciones.
      preConfirm: () => {
        if (!selectedMaterialId) {
          Swal.showValidationMessage(
            "Por favor, selecciona un material de la lista."
          );
          return false; // Evita que el modal se cierre
        }
        return selectedMaterialId; // Este será el valor en result.value
      },
    });

    // Si el usuario confirmó y se seleccionó un material
    if (result.isConfirmed && result.value) {
      const newMaterialId = result.value;

      // Preparamos los datos para la actualización.
      // El backend debe esperar el ID del nuevo material para asociarlo.
      const dataToUpdate = { materialesId: newMaterialId };

      try {
        Swal.fire({
          title: "Actualizando...",
          didOpen: () => Swal.showLoading(),
        });

        // Llama a tu servicio de actualización
        await updateMaterialesReplanteo(record.id, dataToUpdate);
        // Nota: Necesitarás crear este servicio si no lo tienes.

        Swal.fire(
          "¡Actualizado!",
          "El material ha sido modificado.",
          "success"
        );

        // Llama a la función para refrescar los datos en la tabla (si la tienes)
        onUpdate();
      } catch (error) {
        console.error("Error al actualizar:", error);
        Swal.fire("Error", "No se pudo actualizar el material.", "error");
      }
    }
  };

  return (
    <Card style={{ marginTop: "20px" }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",

          flexDirection: "column", // Cambia a columna
          gap: 8,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Materiales
        </Title>
        <Text type="secondary">
          <strong>Paso 1:</strong> Ajuste las cantidades según la disponibilidad
          en bodega.
          <br />
          <strong>Paso 2:</strong> Descargue el formato, que solo contendrá los
          materiales no planificados y serán entregados por (CLARO).
          <br />
          <strong>Paso 3:</strong> Use el archivo para gestionar su reserva.
        </Text>
        {/*  El botón de eliminar solo aparece si hay algo seleccionado */}
      </div>
      <Table
        columns={columns}
        dataSource={materiales}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
      />
      <BottonExcelReserva proyectoId={proyectoId} />
    </Card>
  );
};

export default ListaMaterialesGestion;
