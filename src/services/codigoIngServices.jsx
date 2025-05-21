import apiClient from "./apiClient";

export const fetchCodigoIng = async () => {
  const response = await apiClient.get("/codingenieria");
  return response.data;
};

export const createCodigoIng = async (data) => {
  const response = await apiClient.post("/codingenieria", data);
  return response.data;
};

export const deleteCodigoIng = async (id) => {
  const response = await apiClient.delete(`/codingenieria/${id}`);
  return response.data;
};

export const updateCodigoIng = async (id, data) => {
  const response = await apiClient.patch(`/codingenieria/${id}`, data);
  return response.data;
};
