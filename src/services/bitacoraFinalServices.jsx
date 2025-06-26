import apiClient from "./apiClient";

// Función para obtener la bitácora final por proyecto
export const fetchBitacoraFinal = async (proyectoId) => {
  const response = await apiClient.get(`/bitacora-final/${proyectoId}`);
  return response.data;
};

//funcion para crear una nueva bitácora final
export const patchFirmaBitacora = async (bitacoraData) => {
  const response = await apiClient.patch(`/bitacora-final/firma-version-final`, bitacoraData);
  return response.data;
};

//funcion para descargar la bitácora final en pdf
// Descargar PDF de la bitácora final
export const descargarPdfBitacora = async (proyectoId) => {
  const response = await apiClient.get(`/bitacora-final/pdf-proyecto/${proyectoId}`, {
    responseType: "blob",
  });

  // 1. Obtener nombre desde Content-Disposition
  const disposition = response.headers["content-disposition"];

  let fileName = `bitacora_proyecto_${proyectoId}.pdf`;

  if (disposition && disposition.includes("filename=")) {
    const fileNameMatch = disposition.match(/filename="?([^"]+)"?/);
    if (fileNameMatch?.[1]) {
      fileName = fileNameMatch[1];
    }
  }

  // 2. Descargar el PDF con nombre correcto
  const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// funcion para hacer el cambio de estado de la bitácora final
export const cambioEstadoGeneral = async (proyectoId, bitacoraData) => {
  const response = await apiClient.post(`/bitacora-final/cambio-estado-general/${proyectoId}`, bitacoraData);
  return response.data;
};
