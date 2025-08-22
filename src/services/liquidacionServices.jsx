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

///funcion para descargar excel de solpeds
export const exportarSolpedsExcel = async () => {
  try {
    // ✨ 1. Hacemos la petición GET con la configuración especial
    const response = await apiClient.get("/solpeds/exportexcel", {
      responseType: "blob", // ¡Esta es la clave!
    });

    // ✨ 2. Creamos un Blob y una URL en la memoria del navegador
    const blob = new Blob([response.data], {
      type: response.headers["content-type"],
    });
    const url = window.URL.createObjectURL(blob);

    // ✨ 3. Extraemos el nombre del archivo de las cabeceras de la respuesta
    const contentDisposition = response.headers["content-disposition"];
    let filename = "solpeds.xlsx"; // Nombre por defecto
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }

    // ✨ 4. Creamos un enlace <a> virtual para iniciar la descarga
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // ✨ 5. Limpiamos, eliminando el enlace y la URL de la memoria
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
    // Aquí podrías mostrar una notificación de error al usuario
    throw error;
  }
};

//funcion para subir excel de sap con PO
export const subirExcelSapConPo = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
      "/solpeds/subir-excel-sap-con-po",
      formData
    );
    return response.data;
  } catch (error) {
    console.error("Error al subir Excel de SAP con PO:", error);
    throw error;
  }
};
