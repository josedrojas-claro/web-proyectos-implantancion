import React from "react";
import { Table, Card, Typography, Tag, Button } from "antd";
import Swal from "sweetalert2";
import { updateMaterialesAsignados } from "../../../services/materialesServices";

const { Title, Text } = Typography;

const ListaMaterialesGestionPlanificados = ({
  materiales,
  loading,
  onUpdate,
  userRole,
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
      title: "Planificada",
      dataIndex: "cantidadPlanificada",
      key: "cantidadPlanificada",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Replanteado",
      dataIndex: "cantidadReplanteo",
      key: "cantidadReplanteo",
      render: (text) => <Tag color="cyan">{text}</Tag>,
    },
    {
      title: "Cantidad Asignada",
      dataIndex: "cantidadAsignado",
      key: "cantidadAsignado",
      render: (text) => <Tag color="blue-inverse">{text}</Tag>,
    },
    ...(["admin", "coordinador-ing", "planificador"].includes(userRole)
      ? [
          {
            title: "Acciones",
            key: "acciones",
            render: (_, record) => (
              <Button type="primary" onClick={() => handleEdit(record)}>
                Editar
              </Button>
            ),
          },
        ]
      : []),
  ];

  const handleEdit = async (record) => {
    // 1. Usamos Swal.fire para crear el diálogo de edición
    const { value: nuevaCantidadStr } = await Swal.fire({
      title: "Asignar Cantidad",
      // Mostramos un mensaje claro sobre la acción por defecto
      html: `
      <p>Se asignará la cantidad del replanteo por defecto. Puedes modificarla si es necesario.</p>
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
      if (nuevaCantidad !== record.cantidadAsignada) {
        try {
          // Mostramos una alerta de carga mientras se procesa
          Swal.fire({
            title: "Actualizando...",
            text: "Por favor, espera.",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          // 3. Preparamos los datos y llamamos al servicio de actualización
          // El objeto que enviamos ahora modifica 'cantidadAsignada'
          const data = { cantidadAsignado: nuevaCantidad };
          await updateMaterialesAsignados(record.id, data);

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

  return (
    <Card style={{ marginTop: "20px" }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          flexDirection: "column", // Cambia a columna
          gap: 8, // Espacio entre los elementos
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Valide Lista de Materiales Replanteados vs Planificados
        </Title>
        <Text type="secondary" style={{ marginTop: 0 }}>
          Revise los materiales. Si no realiza cambios, la cantidad de la
          Planificación se asignará por defecto. Esta validación es clave para
          aprobar adicionales fuera de lo planificado.
        </Text>
        {/* El botón de eliminar solo aparece si hay algo seleccionado */}
      </div>
      <Table
        columns={columns}
        dataSource={materiales}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
      />
    </Card>
  );
};

export default ListaMaterialesGestionPlanificados;
