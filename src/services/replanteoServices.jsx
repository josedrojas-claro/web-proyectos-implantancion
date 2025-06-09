import apiClient from "./apiClient";

export const fetchServiciosPlantilla = async (proyectoId) => {
  const response = await apiClient.get("/plantilla-servicios/" + proyectoId);
  return response.data;
};

export const createServicioPlantilla = async (data) => {
  const response = await apiClient.post("/plantilla-servicios", data);
  return response.data;
};

export const fetchMaterialesPlantilla = async (proyectoId) => {
  const response = await apiClient.get("/plantilla-materiales/" + proyectoId);
  return response.data;
};

export const createMaterialPlantilla = async (data) => {
  const response = await apiClient.post("/plantilla-materiales", data);
  return response.data;
};
