import apiClient from "../apiClient";

export const fetchContratista = async () => {
  const response = await apiClient.get("/contratista");
  return response.data;
};

export const fetchListaContratista = async ({ limit, offset, search } = {}) => {
  const response = await apiClient.get("/contratista/lista-completa", {
    params: {
      limit,
      offset,
      search,
    },
  });
  return response.data; // This will return the object with { totalItems, data, ... }
};

export const createContratista = async (data) => {
  const response = await apiClient.post("/contratista", data);
  return response.data;
};

export const deleteContratista = async (id) => {
  const response = await apiClient.delete(`/contratista/${id}`);
  return response.data;
};

export const updateContratista = async (id, data) => {
  const response = await apiClient.patch(`/contratista/${id}`, data);
  return response.data;
};
