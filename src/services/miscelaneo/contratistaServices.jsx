import apiClient from "../apiClient";

export const fetchContratista = async () => {
  const response = await apiClient.get("/contratista");
  return response.data;
};

export const createSitio = async (data) => {
  const response = await apiClient.post("/contratista", data);
  return response.data;
};

export const deleteSitio = async (id) => {
  const response = await apiClient.delete(`/contratista/${id}`);
  return response.data;
};

export const updateSitio = async (id, data) => {
  const response = await apiClient.patch(`/contratista/${id}`, data);
  return response.data;
};
