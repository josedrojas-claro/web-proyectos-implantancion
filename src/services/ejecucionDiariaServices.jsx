import apiClient from "./apiClient";

// Función para obtener la ejecución diaria
export const fetchEjecucionDiaria = async (proyectoId) => {
  const response = await apiClient.get(
    `/ejecucion-diaria/aprobacion-rechazo/${proyectoId}`
  );
  return response.data;
};

//funcion para crear ejecucion diaria
//esta funcion envia tanto la creacion de ejecucion como los servicios y materiales al backend
export const createEjecucionDiaria = async (
  proyectoId,
  comentario,
  userId,
  porcenEjecucion,
  servicios,
  materiales
) => {
  const response = await apiClient.post(
    "/ejecucion-diaria/crear-ejecucion-completa",
    {
      proyectoId,
      comentario,
      userId,
      porcenEjecucion,
      servicios,
      materiales,
    }
  );
  return response.data;
};

//funcion para obtener los servicios en ejecucion diaria
export const fetchServiciosEjecucionDiaria = async (proyectoId) => {
  const response = await apiClient.get(`/servicio-ejecucion/${proyectoId}`);
  return response.data;
};

// Funcion para obtener los materiales en ejecucion diaria
export const fetchMaterialesEjecucionDiaria = async (proyectoId) => {
  const response = await apiClient.get(`/material-ejecucion/${proyectoId}`);
  return response.data;
};

//funcion para aprobar o rechar ejecución diaria
export const aprobarRechazarEjecucionDiaria = async (ejecucionId, data) => {
  const response = await apiClient.patch(
    `/ejecucion-diaria/aprobacion-rechazo/${ejecucionId}`,
    data
  );

  return response.data;
};
