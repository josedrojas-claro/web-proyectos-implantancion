import apiClient from "./apiClient";

export const fetchSitios = async () => {
  const response = await apiClient.get("/sitios");
  return response.data;
};

export const createSitio = async (data) => {
  const response = await apiClient.post("/sitios", data);
  return response.data;
};

export const deleteSitio = async (id) => {
  const response = await apiClient.delete(`/sitios/${id}`);
  return response.data;
};

export const updateSitio = async (id, data) => {
  const response = await apiClient.patch(`/sitios/${id}`, data);
  return response.data;
};

//lista sitios con paguinacion
export const fecthListaSitios = async ({ limit, offset, search } = {}) => {
  const response = await apiClient.get("/sitios/lista-sitios", {
    params: {
      limit,
      offset,
      search,
    },
  });

  return response.data;
};

//lista zonificaiones
export const fecthListaZonificaiones = async () => {
  const response = await apiClient.get(`/zonificacion`);
  return response.data;
};

//lista de municipios
export const fetchListaMunicipios = async () => {
  const response = await apiClient.get(`/municipios`);
  return response.data;
};
