import apiClient from "./apiClient";

export const fetchServiciosByContratista = async (contratistaId, busqueda) => {
  const response = await apiClient.get(
    `/servicios/by-contratista-for-asig/${contratistaId}`,
    {
      params: { q: busqueda },
    }
  );
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
  const response = await apiClient.get(
    `/aprobacion-servicio-material/proyecto-servicio/${proyectoId}`
  );
  return response.data;
};

//funcion para aprobar, lo vamos adejar aqui para aprobar servicio y materiales pero es el mismo entpint al infla como para no estar repiendo
export const updateSerMateAproRecha = async (id, data) => {
  const response = await apiClient.patch(
    `/aprobacion-servicio-material/${id}`,
    data
  );
  return response.data;
};

//funcion general para traer todos los servicios
export const fetchServiciosPorArray = async (data, contratistaId) => {
  const response = await apiClient.post(`/servicios/array-servicios`, {
    data,
    contratistaId,
  });
  return response.data;
};

//funciones para los servicios asignados
export const createServiciosPlanificacion = async (data, proyectoId) => {
  const response = await apiClient.post(
    `/servicios-asignado/planificacion/${proyectoId}`,
    data
  );
  return response.data;
};

//funcion para los servicios replanteo
export const createServiciosReplanteo = async (data, proyectoId) => {
  const response = await apiClient.post(
    `/servicios-asignado/replanteo/${proyectoId}`,
    data
  );
  return response.data;
};

//funcion sera para la planficacion pero podria ser usuado para uso general todo los items que esten con ese nombre tabla servicios_asignados
export const deleteServiciosAsignados = async (data) => {
  const response = await apiClient.delete(`/servicios-asignado/array-bulk`, {
    data,
  });
  return response.data;
};

//funcion para borrar servicios replanteo
export const deleteServiciosReplanteo = async (data) => {
  const response = await apiClient.delete(
    `/servicios-asignado/replanteo/array-bulk`,
    {
      data,
    }
  );
  return response.data;
};

//funcion para editar valores de servicios asignados, mas especificamente los de replanteo
export const updateServiciosAsignados = async (id, data) => {
  const response = await apiClient.patch(`/servicios-asignado/${id}`, data);
  return response.data;
};

///funcion para realizar cambio de servicio uno por otro en la etapa de servicios asigandos,
// se pudria usar el enpoint anterior pero este esta echo para tener los serviciosEjecucion la actualizacion
export const updateServiciosAsignadosEjecucion = async (id, serviciosId) => {
  const response = await apiClient.patch(
    `/servicios-asignado/cambiar-servicio/${id}`,
    { serviciosId }
  );
  return response.data;
};

//funcion para lista de servicios generales
export const fecthListaServicios = async ({ limit, offset, search } = {}) => {
  const response = await apiClient.get("/servicios/lista-servicios", {
    params: {
      limit,
      offset,
      search,
    },
  });

  return response.data;
};

//funccion para crear servicio nuevo
export const nuevoServicio = async (data) => {
  const response = await apiClient.post(`/servicios`, data);
  return response.data;
};

export const actualizarServicio = async (id, data) => {
  const response = await apiClient.patch(`/servicios/${id}`, data);
  return response.data;
};

export const deleteServicio = async (id) => {
  const response = await apiClient.delete(`/servicios/${id}`);
  return response.data;
};
