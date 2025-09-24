import apiClient from "./apiClient";

// Función para obtener la bitácora final por proyecto
export const fetchBitacoraFinal = async (proyectoId) => {
  const response = await apiClient.get(`/bitacora-final/${proyectoId}`);
  return response.data;
};

//funcion para crear una nueva bitácora final
export const patchFirmaBitacora = async (bitacoraData) => {
  const response = await apiClient.patch(
    `/bitacora-final/firma-version-final`,
    bitacoraData
  );
  return response.data;
};

//funcion para descargar la bitácora final en pdf
// Descargar PDF de la bitácora final
export const descargarPdfBitacora = async (proyectoId) => {
  const response = await apiClient.get(
    `/bitacora-final/pdf-proyecto/${proyectoId}`,
    {
      responseType: "blob",
    }
  );

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
  const url = window.URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// funcion para hacer el cambio de estado de la bitácora final
export const cambioEstadoGeneral = async (proyectoId, bitacoraData) => {
  const response = await apiClient.post(
    `/bitacora-final/cambio-estado-general/${proyectoId}`,
    bitacoraData
  );
  return response.data;
};

//funcion para hacer el cambio de estado de en RDO a en planificacion
export const cambioEstadoLiquidacion = async (proyectoId) => {
  const response = await apiClient.post(
    `/proyecto/cambio-estado-liquidacion/${proyectoId}`
  );
  return response.data;
};

//funcino para sacar los datos de excel para el RDO final
export const descargarRdoExcel = async (proyectoId) => {
  const response = await apiClient.get(
    `/bitacora-final/excel-for-rdo/${proyectoId}`,
    {
      responseType: "blob", // MUY IMPORTANTE
    }
  );

  // Crear un link temporal y simular click
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Recuperar nombre de Content-Disposition si quieres
  const contentDisposition = response.headers["content-disposition"];
  let fileName = "rdo.xlsx";
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      fileName = decodeURIComponent(match[1]);
    }
  }

  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

//funcion para descargar excel previo a planificacion para los adicionales
export const descargarExcelPrevioPlanificacion = async (proyectoId) => {
  const response = await apiClient.get(
    `/bitacora-final/formato-previo-planificacion/${proyectoId}`,
    {
      responseType: "blob", // MUY IMPORTANTE
    }
  );

  // Crear un link temporal y simular click
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Recuperar nombre de Content-Disposition si quieres
  const contentDisposition = response.headers["content-disposition"];
  let fileName = "rdo.xlsx";
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      fileName = decodeURIComponent(match[1]);
    }
  }

  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const descargarExcelFormatoPlanificacion = async (proyectoId) => {
  const response = await apiClient.get(
    `/bitacora-final/formato-planificacion/${proyectoId}`,
    {
      responseType: "blob", // MUY IMPORTANTE
    }
  );

  // Crear un link temporal y simular click
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Recuperar nombre de Content-Disposition si quieres
  const contentDisposition = response.headers["content-disposition"];
  let fileName = "rdo.xlsx";
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      fileName = decodeURIComponent(match[1]);
    }
  }

  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
