import apiClient from "./apiClient";

export const fetchSitios = async () => {
  const response = await apiClient.get("/sitios");
  return response.data;
};

export const createSitio = async (data) => {
  const response = await apiClient.post("/sitios", data);
  return response.data;
};

export const deleteSitio = async (id) => {
  const response = await apiClient.delete(`/sitios/${id}`);
  return response.data;
};

export const updateSitio = async (id, data) => {
  const response = await apiClient.patch(`/sitios/${id}`, data);
  return response.data;
};
