// src/utils/colorUtils.js

export const getEstadoColor = (estado) => {
  const estadoColores = {
    // --- 1. Fases de Inicio y Planificación (Tonos Azules y Morados) ---
    "Pendiente Planificación": "#3F51B5", // Indigo
    "Alcances Preliminares": "#5C6BC0", // Indigo más claro
    "En planificación": "#2196F3", // Azul
    "Pendiente asignación": "#03A9F4", // Azul Claro
    Asignado: "#00BCD4", // Cyan

    // --- 2. Fases de Gestión de Recursos (Tonos Morados/Púrpuras) ---
    "Gestion Reserva": "#7E57C2", // Morado Intenso
    "Gestion Reserva-Retiro": "#9575CD", // Morado más claro
    "Con SOLPED": "#673AB7", // Morado Oscuro
    "Validacion Documentos": "#9C27B0", // Púrpura

    // --- 3. Fases de Ejecución y Avance (Tonos Verdes y Amarillos) ---
    Replanteo: "#FFC107", // Ámbar/Amarillo
    Ejecucion: "#4CAF50", // Verde
    "En RDO": "#8BC34A", // Verde Claro

    // --- 4. Fases Financieras y Cierre (Tonos Teal/Marrones) ---
    "Con PO": "#009688", // Teal
    "Con PO-Ejecutado": "#00796B", // Teal Oscuro
    "En Conciliación de Materiales": "#4E342E", // Marrón Oscuro
    "Con Correlativo": "#33691E", // Verde muy oscuro
    "Pendiente Liquidación": "#e43a07ff", // Naranja Intenso/Rojo
    DTA: "#3E2723", // Marrón muy oscuro

    // --- 5. Estados Terminales (Tonos Grises y Rojos) ---
    Finalizado: "#9E9E9E", // Gris
    Cancelado: "#c20d00ff", // Rojo
    Ticket: "#0D7575", // Un color único para un estado especial
  };

  return estadoColores[estado] || "#BDBDBD"; // Color por defecto
};
