import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom/client";
import {
  Table,
  Card,
  Typography,
  Tag,
  Button,
  Space,
  Upload,
  Spin,
  Alert,
  Modal,
  Row,
  Col,
} from "antd";

import { CloudSyncOutlined, UploadOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import MaterialSearch from "./MaterialSearch";
import ModalAsignacionRetiros from "./ModalAsignacionRetiro";
import BottonExcelReserva from "./BottonDescargarExcelReserva";
import ReservasEditable from "./ReservasEditable";
import {
  // updateMaterialesReplanteo,
  sincronizarInventario,
  fetchInventarioPorCodigo,
  createMaterialGestionReserva,
  fetchFechaSincronizacion,
  rollbackMaterialGestionReserva,
  asignarMaterialContratista,
  fetchMaterialesReservaPorProyecto,
} from "../../../services/materialesServices";

const { Title, Text } = Typography;
const { Dragger } = Upload;
import { formatToNicaragua } from "../../../utils/formatToNicaragua";
import withReactContent from "sweetalert2-react-content";
import InventarioModalContent from "./InventarioModalContent";

const MySwal = withReactContent(Swal);

const ListaMaterialesGestion = ({
  materiales,
  loading,
  onUpdate,
  proyectoId,
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
      title: "Replanteado",
      dataIndex: "cantidadReplanteo",
      key: "cantidadReplanteo",
      render: (text) => <Tag color="cyan">{text}</Tag>,
    },
    //
    {
      title: "Retiros (Centro-Almacen)",
      key: "retiros",
      render: (_, record) => {
        const retiros = record.RetirosMaterial || [];
        if (retiros.length === 0) return <span>Sin retiros</span>;

        return (
          <div>
            {retiros.map((r, index) => (
              <div key={index}>
                <strong>
                  {r.centro}-{r.almacen}
                </strong>
                : {r.cantidad}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: "Suma Retiro",
      dataIndex: "sumaRetiro",
      key: "sumaRetiro",
      render: (text) => <Tag color="blue-inverse">{text}</Tag>,
    },
    ...(["admin", "coordinador-ing", "planificador"].includes(userRole)
      ? [
          {
            title: "Acciones",
            key: "acciones",
            render: (_, record) => (
              <Space size="middle">
                <Button onClick={() => handleEditCode(record)}>
                  Asignar / Consultar Stock
                </Button>
              </Space>
            ),
          },
        ]
      : []),
    {
      title: "Suministrado",
      dataIndex: "cantidadAsignado",
      key: "cantidadAsignado",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
  ];

  //   const handleEdit = async (record) => {
  //     // 1. Usamos Swal.fire para crear el diálogo de edición
  //     const { value: nuevaCantidadStr } = await Swal.fire({
  //       title: "Asignar Cantidad",
  //       // Mostramos un mensaje claro sobre la acción por defecto
  //       html: `
  //   <p style="text-align: left; font-size: 16px;">
  //     Confirme o modifique la cantidad sugerida para que coincida con el <strong>stock real en su bodega.</strong>
  //   </p>
  //   <p style="text-align: left; font-size: 14px; margin-top: 8px;">
  //     Si no realiza cambios, la cantidad del replanteo se asignará por defecto al guardar la reserva.
  //   </p>
  //   <div style="margin-top: 1rem; text-align: left; background-color: #f7f7f7; padding: 10px; border-radius: 5px;">
  //     <p><strong>Código:</strong> ${record.material.codigo}</p>
  //     <p><strong>Descripción:</strong> ${record.material.descripcion}</p>
  //     <p><strong>Cantidad Replanteo (Sugerida):</strong> ${record.cantidadReplanteo}</p>
  //   </div>
  // `,
  //       input: "number", // Creamos un campo de entrada numérico
  //       // Pre-rellenamos el campo con el valor del replanteo
  //       inputValue: record.cantidadReplanteo,
  //       showCancelButton: true,
  //       confirmButtonText: "Confirmar y Asignar",
  //       cancelButtonText: "Cancelar",
  //       inputValidator: (value) => {
  //         // La validación sigue siendo importante
  //         if (!value || parseFloat(value) < 0) {
  //           return "Por favor, ingresa un número válido y positivo.";
  //         }
  //       },
  //     });

  //     // 2. Si el usuario confirma y hay un valor
  //     if (nuevaCantidadStr) {
  //       const nuevaCantidad = parseFloat(nuevaCantidadStr);

  //       // Verificamos si el valor realmente cambió para evitar llamadas innecesarias a la API
  //       if (nuevaCantidad !== record.cantidadEntregadaClaro) {
  //         try {
  //           // Mostramos una alerta de carga mientras se procesa
  //           Swal.fire({
  //             title: "Actualizando...",
  //             text: "Por favor, espera.",
  //             allowOutsideClick: false,
  //             didOpen: () => Swal.showLoading(),
  //           });

  //           // 3. Preparamos los datos y llamamos al servicio de actualización
  //           // El objeto que enviamos ahora modifica 'cantidadEntregadaClaro'
  //           const data = { cantidadEntregadaClaro: nuevaCantidad };
  //           await updateMaterialesReplanteo(record.id, data);

  //           Swal.fire(
  //             "¡Actualizado!",
  //             "La cantidad ha sido asignada correctamente.",
  //             "success"
  //           );

  //           // 4. Llamamos a la función para refrescar los datos en el componente padre
  //           if (onUpdate) {
  //             onUpdate();
  //           }
  //         } catch (error) {
  //           console.error("Error al actualizar la cantidad asignada:", error);
  //           Swal.fire("Error", "No se pudo actualizar la cantidad.", "error");
  //         }
  //       } else {
  //         // Opcional: Informar al usuario que no hubo cambios
  //         Swal.fire(
  //           "Sin cambios",
  //           "La cantidad asignada no fue modificada.",
  //           "info"
  //         );
  //       }
  //     }
  //   };

  // Estados para manejar el modal
  const [isModalVisibleStock, setIsModalVisibleStock] = useState(false);
  const [stockActual, setStockActual] = useState([]);
  const [materialSeleccionado, setMaterialSeleccionado] = useState(null);

  const handleEditCode = async (record) => {
    Swal.fire({
      title: "Consultando inventario...",
      didOpen: () => Swal.showLoading(),
    });
    try {
      const inventario = await fetchInventarioPorCodigo(record.material.codigo);

      setStockActual(inventario);
      setMaterialSeleccionado(record);
      setIsModalVisibleStock(true);
      Swal.close();
    } catch (error) {
      Swal.fire(
        error || "Error",
        "No se pudo consultar el inventario.",
        "error"
      );
    }
  };

  // Esta función se ejecutará cuando el usuario confirme en el modal
  const handleConfirmarRetiros = async (retiros) => {
    Swal.fire({
      title: "Registrando retiros...",
      didOpen: () => Swal.showLoading(),
    });
    try {
      const response = await createMaterialGestionReserva(retiros);
      setIsModalVisibleStock(false); // Cierra el modal
      Swal.fire(
        "¡Éxito!",
        response.message || "Los retiros han sido registrados.",
        "success"
      );
      onUpdate(); // Refresca la tabla principal
    } catch (error) {
      Swal.fire(
        "Error",
        `No se pudo registrar el retiro. ${
          error.response?.data?.message || ""
        }`,
        "error"
      );
    }
  };

  // --- Lógica del Modal ---
  const showUploadModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // La lógica de subida ahora se encarga de cerrar el modal al finalizar
  const handleCustomRequest = async (options) => {
    const { onSuccess, onError, file } = options;

    Swal.fire({
      title: "Sincronizando...",
      text: "Por favor, espera mientras se procesa el archivo.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await sincronizarInventario(file);
      onSuccess(response, file);

      setIsModalVisible(false); // Cierra el modal automáticamente

      Swal.fire({
        icon: "success",
        title: "¡Sincronización Exitosa!",
        text: `${file.name} subido y procesado correctamente.`,
        timer: 2500,
      });

      // Llama a la función para refrescar los datos en la tabla principal
      if (onUpdate) {
        onUpdate();
      }
      fetchData();
    } catch (error) {
      onError(error);
      console.error("Error en la sincronización:", error);
      Swal.fire({
        icon: "error",
        title: "¡Oops... Hubo un Error!",
        text: `No se pudo sincronizar el archivo. ${error.message || ""}`,
      });
    }
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  const uploadProps = {
    name: "inventario",
    multiple: false,
    accept: ".xlsx, .csv",
    showUploadList: true,
    beforeUpload: (file) => {
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        Swal.fire({
          icon: "warning",
          title: "Archivo Demasiado Grande",
          text: "El archivo debe pesar menos de 10MB.",
        });
      }
      return isLt10M;
    },
    customRequest: handleCustomRequest,
  };

  const handleReasignarMaterial = () => {
    setIsModalVisibleStock(false);

    MySwal.fire({
      html: (
        <InventarioModalContent
          materialSeleccionado={materialSeleccionado}
          onReasignacionExitosa={onUpdate}
        />
      ),
      showConfirmButton: false,
      width: "80%",
      customClass: {
        popup: "max-width: 90vw",
      },
    });
  };

  const handleAsignarContratista = () => {
    setIsModalVisibleStock(false);
    console.log("materialSeleccionado", materialSeleccionado);
    if (
      materialSeleccionado.cantidadAsignado === 0 ||
      materialSeleccionado.cantidadAsignado === "" ||
      materialSeleccionado.cantidadAsignado === null
    ) {
      Swal.fire({
        title: "Asignar Material a Contratista",
        text: "¿Estás seguro de que deseas asignar este material al contratista?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, asignar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await asignarMaterialContratista({
              id: materialSeleccionado.id,
              accion: "asignar",
            });
            Swal.fire(
              "¡Éxito!",
              response.message || "El material ha sido asignado.",
              "success"
            );
            onUpdate();
          } catch (error) {
            Swal.fire(
              "Error",
              `No se pudo asignar el material. ${error.message || ""}`,
              "error"
            );
          }
        }
      });
    } else {
      Swal.fire({
        title:
          "Estas seguro que deseas revertir esta asignacion al contratista?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, revertir",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await asignarMaterialContratista({
              id: materialSeleccionado.id,
              accion: "revertir",
            });
            Swal.fire(
              "¡Éxito!",
              response.message || "La asignación ha sido revertida.",
              "success"
            );
            onUpdate();
          } catch (error) {
            Swal.fire(
              "Error",
              `No se pudo quitar la asignación. ${error.message || ""}`,
              "error"
            );
          }
        }
      });
    }
  };

  const [fechaSincronizacion, setFechaSincronizacion] = useState(null);
  const [reservaMateriales, setReservaMateriales] = useState(null);
  const [loadingReservaMateriales, setLoadingReservaMateriales] =
    useState(false);

  const fetchReserva = useCallback(async () => {
    setLoadingReservaMateriales(true);
    try {
      const data = await fetchMaterialesReservaPorProyecto(proyectoId);
      setReservaMateriales(data);
    } catch (error) {
      console.error("Error fetching reserva materiales:", error);
    } finally {
      setLoadingReservaMateriales(false);
    }
  }, [proyectoId]);

  const fetchData = async () => {
    const fecha = await fetchFechaSincronizacion();
    setFechaSincronizacion(fecha);
  };
  useEffect(() => {
    fetchData();
    fetchReserva();
  }, [fetchReserva]);

  const handleRefresh = () => {
    fetchReserva();
  };

  const handleRollbackMaterial = async () => {
    Swal.fire({
      title: "¿Estás seguro de que deseas realizar Rollback al material?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, revertir",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Revirtiendo cambios...",
          didOpen: () => Swal.showLoading(),
        });
        try {
          const response = await rollbackMaterialGestionReserva(
            materialSeleccionado.id
          );
          console.log("Rollback response:", response.message);
          Swal.fire(
            "¡Éxito!",
            response.message || "Los cambios han sido revertidos.",
            "success"
          );
          onUpdate();
          setIsModalVisibleStock(false);
        } catch (error) {
          Swal.fire(
            "Error",
            `No se pudo revertir los cambios. ${
              error.response.data.message || ""
            }`,
            "error"
          );
        }
      }
    });
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
          <strong>1. Ajustar Cantidades:</strong> Modifica las cantidades de
          cada material según tu disponibilidad real en bodega.
          <br />
          <strong>2. Descargar Formato:</strong> Descarga el archivo generado.
          Este incluirá <strong>solamente</strong> los materiales no
          planificados que serán entregados por <strong>CLARO</strong>.
          <br />
          <strong>3. Gestionar Reserva:</strong> Utiliza el archivo descargado
          para completar el proceso de reserva.
          <br />
          <br />
          <strong>NOTA IMPORTANTE:</strong> Si un material no tiene stock y no
          puedes sustituirlo por uno similar, debes{" "}
          <strong>confirmar individualmente (uno por uno)</strong> si el
          contratista lo suministrará.
        </Text>
        {/* /* El botón de eliminar solo aparece si hay algo seleccionado */}{" "}
      </div>
      {["admin", "coordinador-ing", "planificador"].includes(userRole) && (
        <Row
          justify="center"
          align="middle"
          gutter={[16, 8]}
          style={{ marginBottom: 5 }}
        >
          <Col>
            <Button
              type="primary"
              icon={<CloudSyncOutlined />}
              onClick={showUploadModal}
            >
              Sincronizar Inventario
            </Button>
          </Col>

          <Col>
            <Text type="secondary">
              Última sincronización:{" "}
              {formatToNicaragua(fechaSincronizacion?.fechaRegistro)}
            </Text>
          </Col>
        </Row>
      )}
      <Table
        columns={columns}
        dataSource={materiales}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        bordered
      />
      {["admin", "coordinador-ing", "planificador"].includes(userRole) && (
        <BottonExcelReserva proyectoId={proyectoId} onRefresh={handleRefresh} />
      )}
      {["admin", "coordinador-ing", "planificador"].includes(userRole) && (
        <ReservasEditable
          data={reservaMateriales}
          loading={loadingReservaMateriales}
        />
      )}
      {/* 4. El Modal que contiene el Dragger */}
      <Modal
        title="Sincronizar Inventario desde Excel"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null} // Ocultamos los botones de "Ok" y "Cancelar" por defecto
      >
        <Alert
          message="Atención"
          description="Este proceso reemplazará todos los datos del inventario actual con la información del archivo que subas."
          type="info"
          showIcon
          style={{ marginBottom: "24px" }}
        />
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Haz clic o arrastra el archivo aquí para subirlo
          </p>
          <p className="ant-upload-hint">
            Soporte para una única carga de tipo .xlsx o .csv.
          </p>
        </Dragger>
      </Modal>
      {materialSeleccionado && (
        <ModalAsignacionRetiros
          visible={isModalVisibleStock}
          onClose={() => setIsModalVisibleStock(false)}
          onReasignar={handleReasignarMaterial}
          onConfirm={handleConfirmarRetiros}
          onAsignarContratista={handleAsignarContratista}
          onRollbackMaterial={handleRollbackMaterial}
          stockDisponible={stockActual}
          materialInfo={materialSeleccionado}
        />
      )}
    </Card>
  );
};

export default ListaMaterialesGestion;
