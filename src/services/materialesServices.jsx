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
  const response = await apiClient.get(
    `/aprobacion-servicio-material/proyecto-material/${proyectoId}`
  );
  return response.data;
};

//funcion general para traer un array de los materiales
export const fetchMaterialesPorArray = async (data) => {
  const response = await apiClient.post(`/materiales/array-materiales`, {
    data,
  });
  return response.data;
};

//funcion para crear los materiales asiganados es para la etapa de planficiacion
export const createMaterialesPlanificacion = async (data, proyectoId) => {
  const response = await apiClient.post(
    `/materiales-asignado/planificacion/${proyectoId}`,
    data
  );
  return response.data;
};

//funcion sera para la planficacion pero podria ser usuado para uso general todo los items que esten con ese nombre tabla servicios_asignados
export const deleteMaterialesAsignados = async (data) => {
  const response = await apiClient.delete(`/materiales-asignado/array-bulk`, {
    data,
  });
  return response.data;
};
