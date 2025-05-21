import apiClient from "./apiClient";

export const fetchSupervisoresClaro = async () => {
  const response = await apiClient.get("/user/list-supervisores");
  return response.data;
};
