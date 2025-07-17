import apiClient from "./apiClient";

export const fetchServiciosByContratista = async (contratistaId, busqueda) => {
  const response = await apiClient.get(`/servicios/by-contratista-for-asig/${contratistaId}`, {
    params: { q: busqueda },
  });
  return response.data;
};
///funciones para servicios Asignados
export const createServiciosAsignados = async (data) => {
  const response = await apiClient.post(`/servicios-asignado`, data);
  return response.data;
};

export const fetchServiciosAsignadosByProyecto = async (proyectoId) => {
  const response = await apiClient.get(`/servicios-asignado/${proyectoId}`);
  return response.data;
};

//funcion para aprobar o recharzar solicitudes de servicios
export const fetchServiciosSolicutudAproRecha = async (proyectoId) => {
  const response = await apiClient.get(`/aprobacion-servicio-material/proyecto-servicio/${proyectoId}`);
  return response.data;
};

//funcion para aprobar, lo vamos adejar aqui para aprobar servicio y materiales pero es el mismo entpint al infla como para no estar repiendo
export const updateSerMateAproRecha = async (id, data) => {
  const response = await apiClient.patch(`/aprobacion-servicio-material/${id}`, data);
  return response.data;
};
