import apiClient from "./apiClient";

export const fetchSupervisoresClaro = async () => {
  const response = await apiClient.get("/user/list-supervisores");
  return response.data;
};

export const fetchSupervisoresContratista = async () => {
  const response = await apiClient.get("/user/list-supervisores-contratistas");
  return response.data;
};
