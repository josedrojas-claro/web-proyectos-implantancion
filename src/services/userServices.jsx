import apiClient from "./apiClient";

export const fetchSupervisoresClaro = async () => {
  const response = await apiClient.get("/user/list-supervisores");
  return response.data;
};

export const fetchSupervisoresContratista = async () => {
  const response = await apiClient.get("/user/list-supervisores-contratistas");
  return response.data;
};

export const fetchLiquidadores = async () => {
  const response = await apiClient.get("/user/lista-liquidadores");
  return response.data;
};

export const fecthListaUsuarios = async ({ limit, offset, search } = {}) => {
  const response = await apiClient.get("/userdata/lista-usuarios", {
    params: {
      limit,
      offset,
      search,
    },
  });

  return response.data;
};

export const habilitarDesabilitarUser = async (id) => {
  const response = await apiClient.patch(`/userdata/${id}/toggle-habilitado/`);
  return response.data;
};

export const crearUsuario = async (data) => {
  const response = await apiClient.post(`/userdata/`, data);
  return response.data;
};

export const updateUsuario = async (id, data) => {
  const response = await apiClient.put(`/userdata/editar-usuario/${id}`, data);
  return response.data;
};
