import apiClient from "./apiClient";

//funcion para traer todos los servicios solicitado
export const fetchServiciosSoclitados = async (id) => {
  const response = await apiClient.get(`/aprobacion-servicio-material/proyecto-servicio/${id}`);
  return response.data;
};

//funcion para traer los materiales solicitados
export const fetchMaterialesSolicitados = async (id) => {
  const response = await apiClient.get(`/aprobacion-servicio-material/proyecto-material/${id}`);
  return response.data;
};

//funcion para crear solicutud
export const createSolictudServMate = async (data) => {
  const response = await apiClient.post("/aprobacion-servicio-material/", data);
  return response.data;
};

//funcion para aprobar o rechazar solicitud
export const aprobarORechazar = async (data) => {
  const response = await apiClient.patch("/aprobacion-servicio-material/", data);
  return response.data;
};

export const deleteSolictdAproRecha = async (id) => {
  const response = await apiClient.delete(`/aprobacion-servicio-material/${id}`);
  return response.data;
};
