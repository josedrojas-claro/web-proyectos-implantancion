import apiClient from "../apiClient";

export const fetchTecnologias = async () => {
  const response = await apiClient.get("/tecnologias");
  return response.data;
};

export const createTecnologia = async (data) => {
  const response = await apiClient.post("/tecnologias", data);
  return response.data;
};

export const deleteTecnologia = async (id) => {
  const response = await apiClient.delete(`/tecnologias/${id}`);
  return response.data;
};

export const updateTecnologia = async (id, data) => {
  const response = await apiClient.patch(`/tecnologias/${id}`, data);
  return response.data;
};
