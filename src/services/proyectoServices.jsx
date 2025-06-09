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
  const response = await apiClient.patch(`/proyecto/para-lideres-asignar`, data);
  return response.data;
};

//consulta para traer lista de proyectos para replanteo
export const fetchListaProyectosReplanteo = async () => {
  const response = await apiClient.get("/proyecto/para-supervisor");
  return response.data;
};

//consutal para traer lista de proyectos para ejecucion diaria
export const fetchListaProyectosEjecucion = async () => {
  const response = await apiClient.get("/proyecto/proyectos-replanteo-ejecucion-all");
  return response.data;
};

///cargar supervisor contrasta
export const updateAsignarSupervisorContratista = async (data) => {
  const response = await apiClient.patch(`/proyecto/cargar-supervisor-contrata`, data);
  return response.data;
};
