import React, { useEffect, useState, useCallback } from "react";
import {
  Input,
  Select,
  Table,
  Pagination,
  Row,
  Col,
  Space,
  Button,
} from "antd";
import MainLayout from "../../layout/MainLayout";
import {
  fetchProyectosPendientesPlanificacion,
  cambiarEstadoProyectosMultiples,
} from "../../services/proyectoServices";
import { descargarExcelFormatoPlanificacion } from "../../services/bitacoraFinalServices";
import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

const { Search } = Input;
const { Option } = Select;

export default function ListaPendientePlanificacion() {
  const [proyectos, setProyectos] = useState([]);
  const [contratistas, setContratistas] = useState([]);
  const [codigos, setCodigos] = useState([]);
  const [search, setSearch] = useState("");
  const [contratistaFiltro, setContratistaFiltro] = useState(null);
  const [codigoFiltro, setCodigoFiltro] = useState(null);
  const [limit, setLimit] = useState(5);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    const res = await fetchProyectosPendientesPlanificacion({
      limit,
      offset,
      search,
    });

    const filtrados = res.proyectos.filter((p) => {
      return (
        (!contratistaFiltro || p.Contratistas?.id === contratistaFiltro) &&
        (!codigoFiltro || p.CodigosIngenieria?.id === codigoFiltro)
      );
    });

    setProyectos(filtrados);
    setContratistas(res.filtros.contratistas);
    setCodigos(res.filtros.codigos);
    setTotal(res.proyectos.length);
  }, [limit, offset, search, contratistaFiltro, codigoFiltro]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = [
    { title: "Ticket", dataIndex: "ticketCode", key: "ticketCode" },
    { title: "Nombre", dataIndex: "nombre", key: "nombre" },
    { title: "Tecnología", dataIndex: "tecnologia", key: "tecnologia" },
    {
      title: "Contratista",
      dataIndex: ["Contratistas", "nombre_contratista"],
      key: "contratista",
    },
    {
      title: "Código Ingeniería",
      dataIndex: ["CodigosIngenieria", "codigo"],
      key: "codigo",
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedKeys) => {
      setSelectedRowKeys(newSelectedKeys);
    },
  };

  const handleEnviarAPlanificar = async () => {
    const seleccionados = proyectos.filter((p) =>
      selectedRowKeys.includes(p.id)
    );

    if (seleccionados.length === 0) return;

    const contratistasUnicos = new Set(
      seleccionados.map((p) => p.Contratistas?.id)
    );
    const codigosUnicos = new Set(
      seleccionados.map((p) => p.CodigosIngenieria?.id)
    );

    if (contratistasUnicos.size > 1 || codigosUnicos.size > 1) {
      Swal.fire({
        icon: "error",
        title: "Selección inválida",
        text: "Todos los proyectos seleccionados deben tener el mismo contratista y el mismo código de ingeniería.",
      });
      return;
    }

    const listaProyectos = seleccionados
      .map((p) => `• ${p.ticketCode} - ${p.nombre}`)
      .join("\n");

    Swal.fire({
      icon: "info",
      title: "Confirmación",
      html: `<pre style="text-align:left">${listaProyectos}</pre>`,
      confirmButtonText: "Enviar a Planificar",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        descargarExcelFormatoPlanificacion(selectedRowKeys);

        // Segunda ventana: recordatorio
        Swal.fire({
          icon: "warning",
          title: "¿Ya enviaste el archivo a Soporte y Gestión?",
          html: `
          <p>Recuerda:</p>
          <ul style="text-align:left">
            <li>📤 Enviar el archivo generado a Soporte y Gestión.</li>
            <li>✏️ Cambiar el nombre del archivo según el formato requerido.</li>
            <li>📝 Modificar la justificación de cada proyecto antes de enviarlo.</li>
          </ul>
        `,
          confirmButtonText: "Sí, ya lo hice",
          showCancelButton: true,
          cancelButtonText: "Cancelar",
        }).then((secondResult) => {
          if (secondResult.isConfirmed) {
            // Tercer paso: confirmación final para cambiar estado
            Swal.fire({
              icon: "question",
              title: "¿Deseas cambiar el estado de los proyectos?",
              text: "Esta acción actualizará el estado de los proyectos seleccionados a 'En Planificación'.",
              showCancelButton: true,
              confirmButtonText: "Sí, cambiar estado",
              cancelButtonText: "Cancelar",
            }).then(async (finalResult) => {
              if (finalResult.isConfirmed) {
                Swal.fire({
                  title: "Cargando...",
                  text: "Por favor espera.",
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading();
                  },
                });
                const response = await cambiarEstadoProyectosMultiples(
                  selectedRowKeys
                );
                setSelectedRowKeys([]);
                Swal.fire({
                  icon: "success",
                  title: "¡Proyecto Asignado!",
                  text:
                    response.message ||
                    "El proyecto fue enviado a ejecución correctamente.",
                  timer: 2500, // Se cierra solo después de 2.5 segundos
                  showConfirmButton: false,
                });
                navigate("/lista-proyectos-planificacion");
              }
            });
          }
        });
      }
    });
  };

  return (
    <MainLayout>
      <h1>Lista de Proyectos Pendientes de Planificación</h1>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="Buscar por nombre o ticket"
              onSearch={(value) => setSearch(value)}
              enterButton
              allowClear
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Filtrar por contratista"
              style={{ width: "100%" }}
              allowClear
              onChange={(value) => setContratistaFiltro(value)}
            >
              {contratistas.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.nombre_contratista}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Select
              placeholder="Filtrar por código"
              style={{ width: "100%" }}
              allowClear
              onChange={(value) => setCodigoFiltro(value)}
            >
              {codigos.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.codigo}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Button
          type="primary"
          disabled={selectedRowKeys.length === 0}
          onClick={handleEnviarAPlanificar}
          style={{ width: "200px", maxWidth: "100%" }}
        >
          Enviar a Planificar
        </Button>

        <Table
          dataSource={proyectos}
          columns={columns}
          rowKey="id"
          pagination={false}
          rowSelection={rowSelection}
        />

        <Pagination
          current={offset / limit + 1}
          pageSize={limit}
          total={total}
          onChange={(page, pageSize) => {
            setLimit(pageSize);
            setOffset((page - 1) * pageSize);
          }}
          showSizeChanger
        />
      </Space>
    </MainLayout>
  );
}
