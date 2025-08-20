import apiClient from "./apiClient";

//funcion para carga masiva de solpeds
export const cargarSolpedsMasivos = async (data) => {
  try {
    const response = await apiClient.post(
      "/solpeds/carga-masiva-solpeds",
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error al cargar solpeds masivos:", error);
    throw error;
  }
};

//funcion para ver solpeds por proyecto
export const verSolpedsPorProyecto = async (proyectoId) => {
  try {
    const response = await apiClient.get(
      `/solpeds/solped-by-proyecto/${proyectoId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al ver solpeds por proyecto:", error);
    throw error;
  }
};

//funcion para actualizar solpeds
export const actualizarSolped = async (solpedId, data) => {
  try {
    const response = await apiClient.patch(
      `/solpeds/editar-solped/${solpedId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar solped:", error);
    throw error;
  }
};

//funcion para eliminar solpeds
export const eliminarSolped = async (solpedId) => {
  try {
    const response = await apiClient.delete(
      `/solpeds/eliminar-solped/${solpedId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al eliminar solped:", error);
    throw error;
  }
};
