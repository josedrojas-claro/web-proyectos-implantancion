import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Row,
  Typography,
  Space,
  Col,
  Spin,
  Button,
  Flex,
  Card,
  Table,
  Tag,
  message,
  Alert,
  Divider,
} from "antd";
import {
  fetchMaterialesConciliacion,
  descargarExcelFormatoConciliacion,
} from "../../services/materialesServices";
import { cambiarEstadoProyecto } from "../../services/proyectoServices";
import MainLayout from "../../layout/MainLayout";
import ProyectoResumenCard from "../../components/ProyectoResumenCard";
import SubirArchivoValidDocumentos from "../ejecucionDiaria/components/SubirArchivoValidDocumentos";
import ListaDocumentos from "../ejecucionDiaria/components/ListaDocumentos";

import { subirDocumentos } from "../../services/DocumentosServices";
import Swal from "sweetalert2";
const { Title, Text } = Typography;

export default function DetallesConciliacionMateriales() {
  const location = useLocation();
  const proyecto = location.state?.record;
  const navigate = useNavigate();

  // --- Estados para manejar los datos de la tabla ---
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // variables para subir data
  const [reloadKey, setReloadKey] = useState(0);

  //variable para descarga
  const [isDownloading, setIsDownloading] = useState(false);

  // --- Carga de datos cuando el componente se monta ---
  useEffect(() => {
    if (!proyecto?.id) {
      setError("No se encontró información del proyecto.");
      setLoading(false);
      return;
    }

    const cargarMateriales = async () => {
      try {
        const data = await fetchMaterialesConciliacion(proyecto.id);
        setMateriales(data);
      } catch (err) {
        setError("Error al cargar los materiales de conciliación.");
        console.error(err);
        message.error("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    cargarMateriales();
  }, [proyecto?.id]); // Se ejecuta si el ID del proyecto cambia

  // --- Definición de las columnas para la tabla de Ant Design ---
  const columns = [
    {
      title: "Reserva",
      dataIndex: ["reserva", "reserva"], // Accede a datos anidados
      key: "reserva",
    },
    {
      title: "Grafo",
      dataIndex: ["reserva", "grafo"], // Accede a datos anidados
      key: "reserva",
    },
    {
      title: "Código",
      dataIndex: ["material", "codigo"], // Accede a datos anidados
      key: "codigo",
    },
    {
      title: "Descripción",
      dataIndex: ["material", "descripcion"],
      key: "descripcion",
    },
    {
      title: "Total Retirado",
      dataIndex: "sumaRetiro",
      key: "sumaRetiro",
      align: "center",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Total Ejecutado",
      dataIndex: "cantidadEjecutada",
      key: "cantidadEjecutada",
      align: "center",
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: "Cantidad A entregar",
      dataIndex: "diferencia",
      key: "diferencia",
      align: "center",
      // Renderizado condicional para el color
      render: (diferencia) => {
        let color;
        if (diferencia > 0) {
          color = "orange"; // Sobrante (se retiró más de lo que se ejecutó)
        } else if (diferencia < 0) {
          color = "red"; // Faltante (se ejecutó más de lo que se retiró)
        } else {
          color = "green"; // Conciliado
        }
        return (
          <Tag color={color} style={{ fontSize: "14px", fontWeight: "bold" }}>
            {diferencia}
          </Tag>
        );
      },
    },
  ];

  // --- Lógica de renderizado ---
  const renderContent = () => {
    if (loading) {
      return <Spin tip="Cargando materiales..." size="large" />;
    }
    if (error) {
      return <Alert message={error} type="error" showIcon />;
    }
    return (
      <Table
        columns={columns}
        dataSource={materiales}
        rowKey="id"
        bordered
        pagination={false} // Usualmente no se pagina en una vista de detalles
      />
    );
  };

  //funcion para descargar formato de conciliaion
  const handleDescargarFormatoConciliacion = async () => {
    Swal.fire({
      title: "Generando archivo previo planificar",
      text: "Por favor, espera mientras preparamos tu archivo...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setIsDownloading(true);
    try {
      await descargarExcelFormatoConciliacion(proyecto.id);
      Swal.fire({
        icon: "success",
        title: "¡Descarga Exitosa!",
        text: "Tu archivo se ha descargado correctamente.",
        timer: 2000, // Close automatically after 2 seconds
        showConfirmButton: false,
      });
    } catch (error) {
      // 5. Show an error message if anything fails
      console.error("Error al descargar el archivo:", error);
      Swal.fire({
        icon: "error",
        title: "Error en la Descarga",
        text: "No se pudo generar el archivo. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCambioEstado = async () => {
    const confirmacion = await Swal.fire({
      title: "Confirmar Cambio de Estado", // Un título más directo
      icon: "warning",
      html: `
    <div style="text-align: left; font-size: 16px;">
      <p>Se cambiará el estado del siguiente proyecto:</p>
      <div style="background-color: #f0f2f5; border-radius: 8px; padding: 12px; margin: 1em 0;">
        <strong>Ticket:</strong> ${proyecto.ticketCode}<br/>
        <strong>Nombre:</strong> ${proyecto.nombre}
      </div>

      <p>El cambio de estado será:</p>
      <div style="border: 1px solid #d9d9d9; border-radius: 8px; padding: 12px; text-align: center; font-size: 18px;">
        <strong style="color: #faad14;">${proyecto.estado.nombre}</strong> 
        <span style="font-size: 20px; margin: 0 10px; font-weight: bold;">&rarr;</span> 
        <strong style="color: #52c41a;">Pendiente Liquidacion</strong>
      </div>

      <p style="margin-top: 1.5em; font-size: 14px; font-weight: bold;">¿Estás seguro de que deseas continuar?</p>
    </div>
  `,
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, ¡Cambiar!",
      cancelButtonText: "Cancelar",
    });

    // Si el usuario confirma la acción...
    if (confirmacion.isConfirmed) {
      try {
        // --- PASO 2: Mostrar un mensaje de "cargando" mientras se ejecuta la API ---
        Swal.fire({
          title: "Cargando...",
          text: "Por favor espera.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        // Llamamos a la API para cambiar el estado
        const response = await cambiarEstadoProyecto(proyecto.id);

        // --- PASO 3: Mostrar mensaje de éxito ---
        // Cerramos el 'loading' y mostramos el éxito
        Swal.fire({
          icon: "success",
          title: "¡Proyecto Asignado!",
          text:
            response.message ||
            "El proyecto fue enviado a ejecución correctamente.",
          timer: 2500, // Se cierra solo después de 2.5 segundos
          showConfirmButton: false,
        });
        navigate("/lista-conciliacion-materiales");
      } catch (error) {
        // --- PASO 4: Manejar errores si la API falla ---
        console.error("Error al asignar el proyecto:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo asignar el proyecto. Por favor, intenta de nuevo.",
        });
      }
    }
  };

  return (
    <MainLayout>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={3} style={{ textAlign: "center" }}>
          Conciliación de Materiales
        </Title>
        <Flex justify="center">
          <ProyectoResumenCard proyecto={proyecto} />
        </Flex>

        <Card title="Detalle de Conciliación de materiales">
          {renderContent()}
        </Card>
        <Flex
          justify="center"
          style={{ marginTop: "10px", marginBottom: "10px" }}
        >
          <Button
            onClick={handleDescargarFormatoConciliacion}
            type="primary"
            loading={isDownloading}
            style={{ minWidth: "220px", width: "220px" }}
          >
            Descargar Formato Conciliacion
          </Button>
        </Flex>
        <Card title="Gestión de Documentos de Conciliación">
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Alert
              message="Adjuntar Documento de Conciliación"
              description="Sube aquí el archivo de devolucion de materiales ya firmada si el proceso lo requiere. Si no es necesario un documento, podrás cambiar el estado del proyecto directamente."
              type="info"
              showIcon
            />

            <Title level={5}>Documentos Cargados</Title>
            <Row
              justify="center" // Centra las columnas horizontalmente
              align="middle" // Centra el contenido de las columnas verticalmente
              gutter={[16, 16]} // Espacio horizontal y vertical entre columnas
            >
              <Col
                xs={24}
                md={12}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <SubirArchivoValidDocumentos
                  onSubmit={async ({ files, comentario }) => {
                    try {
                      if (!files.length) {
                        return Swal.fire(
                          "Advertencia",
                          "Debes seleccionar al menos un archivo.",
                          "warning"
                        );
                      }

                      if (!comentario.trim()) {
                        return Swal.fire(
                          "Advertencia",
                          "El comentario no puede estar vacío.",
                          "warning"
                        );
                      }

                      const response = await subirDocumentos({
                        proyectoId: proyecto.id,
                        comentario,
                        estado: "PO firmadas", // ⚠️ cámbialo si usas otro tipo en backend
                        archivos: files,
                      });

                      setReloadKey((prev) => prev + 1);
                      Swal.fire("¡Éxito!", response.message, "success");
                    } catch (error) {
                      console.error(error);
                      Swal.fire("Error", error.message, "error");
                    }
                  }}
                />
              </Col>
              <Col
                xs={24}
                md={12}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <ListaDocumentos
                  proyectoId={proyecto.id}
                  reloadTrigger={reloadKey}
                  docFirmados={true}
                />
              </Col>
            </Row>
          </Space>
        </Card>
        <Row justify="center" style={{ marginTop: "20px" }}>
          <Space size="middle">
            <Button type="primary" onClick={() => handleCambioEstado()}>
              Cambiar Estado
            </Button>
          </Space>
        </Row>
      </Space>
    </MainLayout>
  );
}
