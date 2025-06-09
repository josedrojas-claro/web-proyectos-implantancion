import apiClient from "./apiClient";

export const fetchMateriales = async () => {
  const response = await apiClient.get("/materiales");
  return response.data;
};

///funciones para materiales Asignados
export const createMaterialesAsignados = async (data) => {
  const response = await apiClient.post(`/materiales-asignado`, data);
  return response.data;
};

export const fetchMaterialesAsignadosByProyecto = async (proyectoId) => {
  const response = await apiClient.get(`/materiales-asignado/${proyectoId}`);
  return response.data;
};
