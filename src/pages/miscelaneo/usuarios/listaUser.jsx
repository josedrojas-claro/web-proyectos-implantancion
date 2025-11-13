import React, { useState, useEffect, useCallback, useRef } from "react";
import MainLayout from "../../../layout/MainLayout";
import {
  fecthListaUsuarios,
  habilitarDesabilitarUser,
  crearUsuario,
  updateUsuario,
} from "../../../services/userServices";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Card,
  Space,
  Typography,
  Row,
  Col,
  Select,
} from "antd";
import { Box } from "@mui/material";
import { fetchContratista } from "../../../services/miscelaneo/contratistaServices";
import { useAuthUser, resetContraseña } from "../../../services/authServices"; // Importa el hook para obtener el usuario autenticado
import Swal from "sweetalert2";
import SignaturePad from "react-signature-pad-wrapper";
import {
  SearchOutlined,
  EditOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { Password } from "@mui/icons-material";
const { Title } = Typography;

export default function ListaUsuarios() {
  const user = useAuthUser(); // Obtiene la información del usuario autenticado

  // Asegúrate de que user y user.UserData existan antes de intentar acceder a user.UserData.rol
  const userRole = user?.role;
  // Lista de materiales: búsqueda simple y tabla con paginación
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  const [contratista, setContratista] = useState([]);
  const [loadingContratista, setLoadingContratista] = useState(false);

  const loadUsuarios = useCallback(async () => {
    setLoadingUsuarios(true);
    try {
      const res = await fecthListaUsuarios({
        limit: filters.limit,
        offset: (filters.page - 1) * filters.limit,
        search: filters.search,
      }); // se espera un arreglo
      setUsuarios(res);
    } catch (e) {
      console.error("Error cargando materiales", e);
      Swal.fire("Error", "No se pudieron cargar los usuarios.", "error");
    } finally {
      setLoadingUsuarios(false);
    }
  }, [filters]);

  const loadContratistas = useCallback(async () => {
    setLoadingContratista(true);
    try {
      const response = await fetchContratista(); // tu servicio
      setContratista(response);
    } catch (error) {
      console.error("Error al cargar Contratista:", error);
    } finally {
      setLoadingContratista(false);
    }
  }, []);

  useEffect(() => {
    loadUsuarios();
    loadContratistas();
  }, [loadUsuarios, loadContratistas]);

  const handlePaginationChange = (page, pageSize) => {
    setFilters((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Gerencia o Contrata",
      dataIndex: "gerencia",
      key: "gerencia",
    },
    {
      title: "Correo",
      dataIndex: ["User", "email"],
      key: "email",
      render: (text) => text || "-",
    },
    {
      title: "Role",
      dataIndex: ["User", "role"],
      key: "role",
      render: (text) => text || "-",
    },
    ...(["admin", "coordinador-ing", "coordinador-sup"].includes(userRole)
      ? [
          {
            title: "Acciones",
            key: "acciones",
            render: (_, record) => {
              const habilitado = record.isHabilitado; // viene de UserData
              return (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleOpenModal(record)}
                  >
                    Editar
                  </Button>
                  <Button
                    style={{
                      backgroundColor: record.isHabilitado
                        ? "#52c41a"
                        : "#ff4d4f", // verde o rojo
                      color: "#fff",
                      borderColor: record.isHabilitado ? "#52c41a" : "#ff4d4f",
                    }}
                    icon={<PauseCircleOutlined />}
                    size="small"
                    onClick={() => handleHabilitarDesabilitar(record)}
                  >
                    {habilitado ? "Deshabilitar" : "Habilitar"}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => handleResetPassword(record)}
                  >
                    Reset Password
                  </Button>
                </Space>
              );
            },
          },
        ]
      : []),
  ];

  const handleHabilitarDesabilitar = async (record) => {
    const action = record.isHabilitado ? "deshabilitar" : "habilitar";
    const confirm = await Swal.fire({
      title: `¿Está seguro?`,
      text: `Se va a ${action} al usuario "${record.nombre}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await habilitarDesabilitarUser(record.id); // envía solo el id
      await Swal.fire("Listo", response.message, "success");
      loadUsuarios(); // recarga la lista
    } catch (error) {
      console.error("Error actualizando usuario", error);
      Swal.fire("Error", error.response.data.message, "error");
    }
  };

  const handleResetPassword = async (record) => {
    const confirm = await Swal.fire({
      title: "¿Está seguro?",
      text: `Se va a resetear la contraseña del usuario "${record.nombre}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, resetear",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!confirm.isConfirmed) return;

    try {
      const response = await resetContraseña(record.userId); // Envía el ID del usuario
      await Swal.fire(
        "Listo",
        `${response.message} y nueva contraseña: ${response.nuevaPassword}`,
        "success"
      );
      loadUsuarios(); // Recarga la lista si es necesario
    } catch (error) {
      console.error("Error reseteando contraseña", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo resetear la contraseña",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const tipoUsuario = Form.useWatch("tipoUsuario", form);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        nombre: user.nombre,
        gerencia: user.gerencia,
        carnet: user.carnet,
        manager: user.manager,
        managerCarnet: user.managerCarnet,
        tipoUsuario: user.tipoUsuario,
        email: user.User.email,
        password: user.User.password,
        role: user.User.role,
        firma: user.firma,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const gerenciasInternas = [
    "Ingenieria PX",
    "Ingenieria PX/Redes Acesso",
    "Supervicion PX/Lider",
    "Supervision PX/Supervisor",
    "Ingenieria PX/Redes Troncales",
    "Supervicion PX",
  ];

  const rolesContrata = ["contratista-lider", "contratista"];

  const rolesImplantacion = [
    "coordinador-sup",
    "liquidador",
    "supervisor",
    "admin",
    "planificador",
    "coordinador-ing",
    "lider",
  ];

  //variable para firma:
  const sigCanvas = useRef();

  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      // Filtrar campos vacíos que no son requeridos
      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(
          ([, value]) => value !== undefined && value !== null && value !== ""
        )
      );

      // Verificar si hay firma en el canvas (proteger si sigCanvas no está montado)
      const hasSigCanvas =
        sigCanvas &&
        sigCanvas.current &&
        typeof sigCanvas.current.isEmpty === "function";

      if (hasSigCanvas) {
        const isEmptySignature = sigCanvas.current.isEmpty();
        if (!isEmptySignature) {
          const firmaBase64 = sigCanvas.current
            .toDataURL("image/png")
            .replace(/^data:image\/png;base64,/, "");
          filteredValues.firma = firmaBase64;
        }
      }
      const apiCall = editingUser
        ? updateUsuario(editingUser.id, filteredValues)
        : crearUsuario(filteredValues);

      const response = await apiCall;
      await Swal.fire("Listo", response.message, "success");
      handleCloseModal();
      loadUsuarios();
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || "Ocurrió un error";
      Swal.fire("Error", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <MainLayout>
      <Card>
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Buscar por nombre"
              onSearch={handleSearch}
              style={{ width: "100%" }}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col>
            <Space>
              {[
                "admin",
                "coordinador-ing",
                "coordinador-sup",
                "planificador",
              ].includes(userRole) && (
                <Button type="primary" onClick={() => handleOpenModal()}>
                  Nuevo Usuario
                </Button>
              )}
            </Space>
          </Col>
        </Row>
        <Table
          style={{ marginTop: 16 }}
          columns={columns}
          rowKey="id"
          dataSource={usuarios.data}
          loading={loadingUsuarios}
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            showSizeChanger: true,
            total: usuarios.totalItems,
            onChange: handlePaginationChange,
          }}
        />
      </Card>
      <Modal
        title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null} // We will use the form's button
      >
        {/* Contenedor relativo para poder mostrar overlay de carga */}
        <div style={{ position: "relative" }}>
          {/* Overlay simple cuando se está enviando */}
          {submitting && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.75)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                borderRadius: 4,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    border: "4px solid #1890ff",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 8px",
                  }}
                />
                <div style={{ fontWeight: 500 }}>Cargando...</div>
              </div>
            </div>
          )}

          <style>
            {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
          </style>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
            disabled={submitting}
          >
            <Form.Item
              name="tipoUsuario"
              label="Tipo de Usuario"
              rules={[
                {
                  required: true,
                  message: "Por favor, seleccione el tipo de usuario.",
                },
              ]}
            >
              <Select
                placeholder="Seleccione una opción"
                onChange={() => form.setFieldsValue({ gerencia: null })} // Limpia gerencia al cambiar tipo
              >
                <Select.Option value="externo">Externo</Select.Option>
                <Select.Option value="interno">Interno</Select.Option>
              </Select>
            </Form.Item>
            {tipoUsuario === "externo" && (
              <Form.Item
                name="gerencia"
                label="Contratista"
                rules={[
                  {
                    required: true,
                    message: "Por favor, seleccione un contratista.",
                  },
                ]}
              >
                <Select
                  placeholder="Seleccione un Contratista"
                  loading={loadingContratista}
                  showSearch
                  optionFilterProp="children"
                >
                  {contratista.map((contra) => (
                    <Select.Option
                      key={contra.nombreContratista}
                      value={contra.nombreContratista}
                    >
                      {contra.nombreContratista}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            {tipoUsuario === "interno" && (
              <Form.Item
                name="gerencia"
                label="Gerencia"
                rules={[
                  {
                    required: true,
                    message: "Por favor, seleccione una gerencia.",
                  },
                ]}
              >
                <Select placeholder="Seleccione una Gerencia">
                  {gerenciasInternas.map((g) => (
                    <Select.Option key={g} value={g}>
                      {g}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Form.Item
              name="nombre"
              label="Nombre"
              rules={[
                {
                  required: true,
                  message: "Por favor, ingrese el nombre del usuario.",
                },
              ]}
            >
              <Input placeholder="Ej. Jose Daniel Rojas" />
            </Form.Item>

            <Form.Item
              name="carnet"
              label="Identificacion o Carnet"
              rules={[
                {
                  required: true,
                  message: "Por favor, ingrese la Identificacion o Carnet.",
                },
              ]}
            >
              <Input placeholder="Ej. 500454" />
            </Form.Item>
            <Form.Item
              name="manager"
              label="Nombre Jefe Inmediato"
              rules={[
                {
                  required: true,
                  message: "Por favor, ingrese el Nombre Jefe Inmediato.",
                },
              ]}
            >
              <Input placeholder="Ej. Luis Ortiz" />
            </Form.Item>

            <Form.Item
              name="managerCarnet"
              label="ID o Carnet Jefe Inmediato"
              rules={[
                {
                  required: true,
                  message: "Por favor, ingrese el ID o Carnet Jefe Inmediato.",
                },
              ]}
            >
              <Input placeholder="Ej. 12345" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Correo"
              extra="App no vinculada con correo, pero se toma como referencia"
              rules={[
                {
                  required: true,
                  message: "Por favor, ingrese el Correo.",
                },
              ]}
            >
              <Input placeholder="Ej. jose@jose.com" />
            </Form.Item>

            {!editingUser && (
              <>
                <Form.Item
                  name="password"
                  label="Contraseña"
                  rules={[
                    {
                      required: true,
                      message: "Por favor, ingrese la contraseña.",
                    },
                    {
                      min: 6,
                      message:
                        "La contraseña debe tener al menos 6 caracteres.",
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password placeholder="Ingrese una contraseña" />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirmar Contraseña"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: "Por favor, confirme la contraseña.",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Las contraseñas no coinciden.")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Confirme la contraseña" />
                </Form.Item>

                <div>
                  <Box
                    sx={{
                      border: "2px dashed #9e9e9e",
                      borderRadius: 2,
                      backgroundColor: "#fff",
                      width: "100%",
                      height: 350,
                      mb: 2,
                      position: "relative",
                    }}
                  >
                    <SignaturePad
                      ref={sigCanvas}
                      options={{
                        minWidth: 1,
                        maxWidth: 2.5,
                        penColor: "black",
                        backgroundColor: "#fff",
                      }}
                      canvasProps={{
                        style: {
                          borderRadius: "8px",
                          width: "100%",
                          height: "100%",
                        },
                      }}
                    />
                  </Box>

                  <Button
                    onClick={() => sigCanvas.current.clear()}
                    style={{
                      width: "100px",
                    }}
                    disabled={submitting}
                  >
                    Limpiar
                  </Button>
                </div>
              </>
            )}
            {tipoUsuario && (
              <>
                <Form.Item
                  name="role"
                  label="Rol"
                  rules={[
                    {
                      required: true,
                      message: "Por favor, seleccione un rol.",
                    },
                  ]}
                >
                  <Select
                    placeholder="Seleccione un rol"
                    showSearch
                    optionFilterProp="children"
                  >
                    {(tipoUsuario === "externo"
                      ? rolesContrata
                      : rolesImplantacion
                    ).map((r) => (
                      <Select.Option key={r} value={r}>
                        {r}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {editingUser?.firma ? (
                  <img
                    src={`data:image/png;base64,${editingUser.firma}`}
                    alt="Firma Contratista"
                    style={{ maxHeight: 120 }}
                  />
                ) : (
                  <span style={{ color: "#9e9e9e" }}>Usuario sin firma</span>
                )}
              </>
            )}

            <Form.Item>
              <Space style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={handleCloseModal} disabled={submitting}>
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  onClick={() => form.submit()}
                  loading={submitting}
                >
                  {editingUser ? "Actualizar" : "Crear"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </MainLayout>
  );
}
