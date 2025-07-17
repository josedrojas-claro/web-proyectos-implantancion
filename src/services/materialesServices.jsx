import apiClient from "./apiClient";

export const fetchMateriales = async () => {
  const response = await apiClient.get("/materiales");
  return response.data;
};

//funcion para buscar con filtro desde el backend
export const fetchMaterialesByFiltro = async (busqueda) => {
  const response = await apiClient.get("/materiales/filtro", {
    params: { q: busqueda },
  });
  return response.data;
};

///funciones para materiales Asignados
export const createMaterialesAsignados = async (data) => {
  const response = await apiClient.post(`/materiales-asignado`, data);
  return response.data;
};

export const fetchMaterialesAsignadosByProyecto = async (proyectoId) => {
  const response = await apiClient.get(`/materiales-asignado/${proyectoId}`);
  return response.data;
};

//funcion para aprobar o recharzar solicitudes de servicios
export const fetchMaterialesSolicutudAproRecha = async (proyectoId) => {
  const response = await apiClient.get(`/aprobacion-servicio-material/proyecto-material/${proyectoId}`);
  return response.data;
};
