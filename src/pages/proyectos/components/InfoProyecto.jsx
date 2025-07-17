import { Card, Space } from "antd";

export default function InfoProyecto({ proyecto }) {
  const cardStyle = {
    // Estilo base para todas las tarjetas
    boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)", // Sombra más pronunciada
    transition: "0.3s", // Efecto suave al pasar el mouse
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="horizontal" size={16} align="start" wrap>
        <Card size="small" title="Datos del contratista y Planificador" style={{ ...cardStyle, width: 300 }}>
          <p>
            <strong>Fecha de Creación:</strong>{" "}
            {proyecto.createdAt ? new Date(proyecto.createdAt).toLocaleDateString("es-NI") : "—"}
          </p>
          <p>
            <strong>Planificador:</strong> {proyecto.Planificador?.UserData?.nombre ?? "—"}
          </p>
          <p>
            <strong>Contratista:</strong> {proyecto.Contratistas?.nombre_contratista ?? "—"}
          </p>
          <p>
            <strong>Rubro:</strong> {proyecto.CodigosIngenieria?.codigo ?? "—"}
          </p>
        </Card>
        <Card size="small" title="Datos del sitio" style={{ ...cardStyle, width: 320 }}>
          <p>
            <strong>Nombre del Sitio:</strong> {proyecto.Sitios?.nombre_sitio ?? "—"}
          </p>
          <p>
            <strong>Nemonico:</strong> {proyecto.Sitios?.nemonico ?? "—"}
          </p>
          <p>
            <strong>Municipio:</strong> {proyecto.Sitios?.Municipio?.municipio ?? "—"}
          </p>
          <p>
            <strong>Zonificación:</strong> {proyecto.Sitios?.Zonificaciones?.nombreZonificacion ?? "—"}
          </p>
        </Card>
        <Card size="small" title="Supervisores" style={{ ...cardStyle, width: 450 }}>
          <p>
            <strong>Supervisor Claro:</strong> {proyecto.Supervisor?.UserData?.nombre ?? "—"}
            {" -- Carnet: "}
            {proyecto.Supervisor?.UserData?.carnet ?? "—"}
          </p>
          <p>
            <strong>Supervisor Contratista:</strong> {proyecto.SupervisorContratista?.UserData?.nombre ?? "—"} Carnet:{" "}
            {proyecto.SupervisorContratista?.UserData?.carnet ?? "—"}
          </p>
          <p>
            <strong>Cliente Final:</strong> {proyecto.BitacoraFinalProyecto?.[0]?.nombreOperaciones ?? "—"} Carnet:{" "}
            {proyecto.BitacoraFinalProyecto?.[0]?.carnet ?? "—"}
          </p>
        </Card>
      </Space>
    </div>
  );
}
