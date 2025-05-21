import apiClient from "./apiClient";

export const fetchProyectosLideres = async () => {
  const response = await apiClient.get("/proyecto/para-lideres");
  return response.data;
};

export const createProyecto = async (data) => {
  const response = await apiClient.post("/proyecto", data);
  return response.data;
};

export const deleteProyecto = async (id) => {
  const response = await apiClient.delete(`/proyecto/${id}`);
  return response.data;
};

export const updateProyecto = async (id, data) => {
  const response = await apiClient.patch(`/proyecto/${id}`, data);
  return response.data;
};

export const updateAsignarSupervisor = async (data) => {
  const response = await apiClient.patch(`/proyecto/para-lideres-asignar`, data);
  return response.data;
};
