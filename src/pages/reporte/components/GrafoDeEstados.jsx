// GrafoDeEstados.js
import React, { useMemo } from "react";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import { Card } from "antd";

// Importa el CSS para este componente específico
import "reactflow/dist/style.css";

export default function GrafoDeEstados({ data }) {
  // Usamos useMemo para no recalcular esto en cada render
  const { nodes, edges } = useMemo(() => {
    if (!data || data.length === 0) {
      return { nodes: [], edges: [] };
    }

    // 1. Creamos los nodos (los estados únicos)
    const allStates = new Set();
    data.forEach((item) => {
      allStates.add(item.desdeEstado);
      allStates.add(item.haciaEstado);
    });

    const initialNodes = Array.from(allStates).map((state, index) => ({
      id: state,
      data: { label: state },
      // Damos una posición inicial, el layout automático los acomodará
      position: { x: (index % 4) * 200, y: Math.floor(index / 4) * 120 },
    }));

    // 2. Creamos las aristas (las transiciones)
    const initialEdges = data.map((item, index) => ({
      id: `e${index}`,
      source: item.desdeEstado,
      target: item.haciaEstado,
      // Mostramos el tiempo promedio en la etiqueta de la flecha
      label: `${item.tiempoPromedioHoras} hrs (${item.cantidadTransiciones})`,
      type: "smoothstep",
      markerEnd: { type: "arrowclosed" },
    }));

    return { nodes: initialNodes, edges: initialEdges };
  }, [data]);

  return (
    <Card title="Grafo de Transiciones de Estado">
      <div style={{ height: "70vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView // Esta opción hace zoom para que todo el grafo quepa en la pantalla
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </Card>
  );
}
