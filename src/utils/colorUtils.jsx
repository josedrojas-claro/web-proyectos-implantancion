// src/utils/colorUtils.js

export const getEstadoColor = (estado) => {
  const estadoColores = {
    "En planificación": "#795548",
    "Pendiente asignación": "#FF9800",
    Asignado: "#2196F3",
    Replanteo: "#d8c40eff",
    Ejecucion: "#4CAF50",
    "En RDO": "#009688",
    Finalizado: "#9E9E9E",
    Ticket: "#0D7575",
    "Validacion Documentos": "#9C27B0",
    "Con SOLPED": "#4E342E",
    "Con PO": "#00838F",
    "Con PO-Ejecutado": "#1d5c54ff",
    Liquidacion: "#BF360C",
    "Con Correlativo": "#33691E",
    DTA: "#3E2723",
    "Alcances Preliminares": "#3F51B5", // Nuevo estado y color
    "Gestion Reserva": "#6c3fb5ff",
    "Gestion Reserva-Retiro": "#8460beff",
    Cancelado: "#f02f21ff",
  };

  // Devuelve el color correspondiente o uno por defecto si no lo encuentra.
  return estadoColores[estado] || "#BDBDBD";
};

// Puedes agregar más funciones relacionadas con colores aquí en el futuro.
