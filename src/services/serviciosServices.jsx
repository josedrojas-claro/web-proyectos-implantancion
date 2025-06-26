import apiClient from "./apiClient";

export const fetchServiciosByContratista = async (contratistaId, busqueda) => {
  const response = await apiClient.get(`/servicios/by-contratista-for-asig/${contratistaId}`, {
    params: { q: busqueda },
  });
  return response.data;
};
///funciones para servicios Asignados
export const createServiciosAsignados = async (data) => {
  const response = await apiClient.post(`/servicios-asignado`, data);
  return response.data;
};

export const fetchServiciosAsignadosByProyecto = async (proyectoId) => {
  const response = await apiClient.get(`/servicios-asignado/${proyectoId}`);
  return response.data;
};
