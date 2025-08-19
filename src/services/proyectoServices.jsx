import apiClient from "./apiClient";

export const fetchProyectosLideres = async () => {
  const response = await apiClient.get("/proyecto/para-lideres");
  return response.data;
};

export const createProyecto = async (data) => {
  const response = await apiClient.post("/proyecto", data);
  return response.data;
};

export const deleteProyecto = async (id) => {
  const response = await apiClient.delete(`/proyecto/${id}`);
  return response.data;
};

export const updateProyecto = async (id, data) => {
  const response = await apiClient.patch(`/proyecto/${id}`, data);
  return response.data;
};

export const updateAsignarSupervisor = async (data) => {
  const response = await apiClient.patch(
    `/proyecto/para-lideres-asignar`,
    data
  );
  return response.data;
};

//consulta para traer lista de proyectos para replanteo
export const fetchListaProyectosReplanteo = async () => {
  const response = await apiClient.get("/proyecto/para-supervisor");
  return response.data;
};

//consutal para traer lista de proyectos para ejecucion diaria
export const fetchListaProyectosEjecucion = async () => {
  const response = await apiClient.get(
    "/proyecto/proyectos-replanteo-ejecucion-all"
  );
  return response.data;
};

// consulta proyectos que estan en RDO o conciliacion de materiales
export const fetchListaProyectosRdoConci = async () => {
  const response = await apiClient.get("/proyecto/proyectos-Rdo");
  return response.data;
};

///cargar supervisor contrasta
export const updateAsignarSupervisorContratista = async (data) => {
  const response = await apiClient.patch(
    `/proyecto/cargar-supervisor-contrata`,
    data
  );
  return response.data;
};

///estapa para cargar los proyectos generales
// utils para query string
export const fetchProyectosGenerales = async (params = {}) => {
  // Elimina claves nulas/vacías
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      (entry) => entry[1] !== undefined && entry[1] !== null && entry[1] !== ""
    )
  );
  const queryString = new URLSearchParams(cleanParams).toString();
  const response = await apiClient.get(
    `/proyecto/proyectos-generales?${queryString}`
  );
  return response.data;
};

//historial para los proyectos
export const fetchHistorialProyectos = async (id) => {
  const response = await apiClient.get(`/historial-casos-proyectos/${id}`);
  return response.data;
};

//reporte lista de horas retraso
export const fetchListaHorasRetraso = async (
  page = 1,
  pageSize = 15,
  searchTerm = ""
) => {
  // Codificamos el término de búsqueda para que sea seguro en una URL
  const encodedSearchTerm = encodeURIComponent(searchTerm);

  const response = await apiClient.get(
    `/proyecto/reporte-de-dias-por-proyecto?page=${page}&pageSize=${pageSize}&search=${encodedSearchTerm}`
  );
  return response.data;
};
// estadistica de proyectos horas retraso
export const fetchEstadisticaHorasRetraso = async () => {
  const response = await apiClient.get(
    `/proyecto/reporte-de-dias-por-proyecto/estadisticas`
  );
  return response.data;
};

// promedio en tiempo entre cada estado, cuando le dura a las personas en cambiar de estado
export const fetchTiempoTrancision = async () => {
  const response = await apiClient.get(
    `/proyecto/reporte-de-dias-por-proyecto/estadisticas/transiciones`
  );
  return response.data;
};

///estados proyectos
export const fetchEstadosProyectos = async () => {
  const response = await apiClient.get(`/estadoproyecto`);
  return response.data;
};

export const createEstadoProyecto = async (data) => {
  const response = await apiClient.post("/estadoproyecto", data);
  return response.data;
};

export const updateEstadoProyectos = async (id, data) => {
  const response = await apiClient.patch(`/estadoproyecto/${id}`, data);
  return response.data;
};

export const deleteEstadoProyecto = async (id) => {
  const response = await apiClient.delete(`/estadoproyecto/${id}`);
  return response.data;
};

//funciones especiales para editar el historial de proyectos, cancelado y borrado
export const cancelarProyecto = async (data) => {
  const response = await apiClient.patch(
    `/proyecto/cambiar-estado/cancelar-proyectos/`,
    data
  );
  return response.data;
};

export const pausarProyecto = async (data) => {
  const response = await apiClient.patch(
    `/proyecto/cambiar-estado/pausar-proyectos/`,
    data
  );
  return response.data;
};

//funciones para planificar proyects
export const fetchProyectosEnPlanificacion = async ({
  limit,
  offset,
  estados,
  search,
} = {}) => {
  const response = await apiClient.get("/proyecto/proyectos-en-planificacion", {
    params: {
      limit,
      offset,
      estados,
      search,
    },
  });

  return response.data;
};

//funcion para cambiar de estado
export const cambiarEstadoProyecto = async (id) => {
  const response = await apiClient.patch(`/proyecto/${id}/avanzar-estado`);
  return response.data;
};
