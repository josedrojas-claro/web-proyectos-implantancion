import React, { useState } from "react";
import { Table, Card, Typography, Button, Space, Input, Alert } from "antd";
import { ExperimentOutlined, BuildOutlined } from "@ant-design/icons";
import { cargarSolpedsMasivos } from "../../../services/liquidacionServices";

import Swal from "sweetalert2";
const { Title } = Typography;
const { TextArea } = Input;

const ProcesoMasivoSolpeds = () => {
  const [inputText, setInputText] = useState("");
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✨ El cerebro de la operación: Parsea el texto y lo agrupa por ticket
  const handleProcesar = () => {
    if (!inputText.trim()) {
      return;
    }
    setLoading(true);

    const lineas = inputText.trim().split("\n");
    const dataMap = new Map();

    // ✨ Expresión regular para encontrar un ticket de 6 o 7 dígitos y capturar el resto del texto
    const ticketRegex = /(?<ticket>\d{6,7})\s(?<subtec>.*)/;

    lineas.forEach((linea, index) => {
      // Divide por 2 o más espacios (robusto para tabulaciones y espacios)
      const columnas = linea.split(/\t/);
      console.log("Columnas:", columnas.length);
      if (columnas.length >= 6) {
        const descripcionCompleta = columnas[1];
        const match = descripcionCompleta.match(ticketRegex);

        if (match && match.groups) {
          const { ticket, subtec } = match.groups;

          const subtecFinal = subtec.trim().split(/\s+/).slice(0, 1).join(" ");

          const item = {
            key: `${ticket}-${index}`, // Key única para cada fila
            elementoPEP: columnas[0],
            descripcion: descripcionCompleta,
            monto: parseFloat(columnas[2].replace(",", "")), // Limpia comas y convierte a número
            moneda: columnas[3],
            grafo: columnas[4],
            numeroSOLPED: columnas[5],
            subtec: subtecFinal,
          };

          // Agrupa los items por ticket en el mapa
          if (dataMap.has(ticket)) {
            dataMap.get(ticket).items.push(item);
          } else {
            dataMap.set(ticket, {
              key: ticket,
              ticketCode: ticket,
              items: [item],
            });
          }
        }
      }
    });

    setParsedData(Array.from(dataMap.values()));
    setLoading(false);
  };

  // ✨ Columnas para la tabla interior (el detalle de cada ticket)
  const expandedColumns = [
    { title: "Elemento PEP", dataIndex: "elementoPEP", key: "elementoPEP" },
    { title: "Monto", dataIndex: "monto", key: "monto", align: "right" },
    { title: "Moneda", dataIndex: "moneda", key: "moneda" },
    { title: "Grafo", dataIndex: "grafo", key: "grafo" },
    { title: "N° SOLPED", dataIndex: "numeroSOLPED", key: "numeroSOLPED" },
    { title: "Subtec", dataIndex: "subtec", key: "subtec" },
    {
      title: "Descripción Completa",
      dataIndex: "descripcion",
      key: "descripcion",
    },
  ];

  // ✨ Columnas para la tabla principal (un resumen por ticket)
  const mainColumns = [
    {
      title: "Ticket",
      dataIndex: "ticketCode",
      key: "ticketCode",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Cantidad de Items",
      dataIndex: "items",
      key: "count",
      render: (items) => items.length,
    },
  ];

  const handleCargarSolpedsMasivos = async () => {
    // 1. Confirmación con el usuario
    const confirmacion = await Swal.fire({
      title: "¿Confirmar y Guardar?",
      text: `Se van a guardar los datos de ${parsedData.length} ticket(s) en la base de datos.`,
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
      // 2. Llamada al servicio, pasando el estado 'parsedData' directamente
      const response = await cargarSolpedsMasivos(parsedData);

      // 1. Mostrar mensaje de éxito
      await Swal.fire({
        title: "Resultado de carga",
        text: response.message,
        icon: response.data.length > 0 ? "success" : "warning",
        confirmButtonText: "OK",
      });

      if (response.advertencias && response.advertencias.length > 0) {
        const htmlAdvertencias = response.advertencias
          .map((a) => {
            return `<li><strong>${a.ticketCode}</strong>: ${a.mensaje}</li>`;
          })
          .join("");

        await Swal.fire({
          title: "Advertencias",
          html: `<ul style="text-align:left;">${htmlAdvertencias}</ul>`,
          icon: "info",
          confirmButtonText: "Entendido",
        });
      }
      setInputText("");
      setParsedData([]);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Ocurrió un error al guardar los datos.";
      await Swal.fire("Error", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={4}>Procesador de Datos SOLPED</Title>
        <Alert
          message="Instrucciones"
          description="Copie y pegue los datos directamente desde la fuente. El sistema agrupará automáticamente la información por el 'ticket' de 6 o 7 dígitos encontrado en la segunda columna."
          type="info"
          showIcon
        />
        <TextArea
          rows={10}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Pegue aquí los datos..."
        />
        <Button
          type="primary"
          onClick={handleProcesar}
          loading={loading}
          icon={<ExperimentOutlined />}
        >
          Procesar Datos
        </Button>

        {parsedData.length > 0 && (
          <Card type="inner" title="Resultados Agrupados por Ticket">
            <Table
              columns={mainColumns}
              dataSource={parsedData}
              // ✨ La magia de la tabla anidada sucede aquí
              expandable={{
                expandedRowRender: (record) => (
                  <Table
                    columns={expandedColumns}
                    dataSource={record.items}
                    pagination={false}
                    size="small"
                  />
                ),
                rowExpandable: (record) => record.items.length > 0,
              }}
            />
            <Button
              type="primary"
              onClick={handleCargarSolpedsMasivos}
              loading={loading}
              icon={<BuildOutlined />}
            >
              Enviar datos
            </Button>
          </Card>
        )}
      </Space>
    </Card>
  );
};

export default ProcesoMasivoSolpeds;
