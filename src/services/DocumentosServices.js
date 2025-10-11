// src/services/documentoService.js
import apiClient from "./apiClient";

// 1. Obtener documentos por proyecto
export const fetchDocumentosByProyect = async (proyectoId) => {
  const response = await apiClient.get(`/documento-proyecto/${proyectoId}`);
  return response.data;
};

// 2. Obtener documentos por PO
export const fetchDocumentosByPo = async (poId) => {
  const response = await apiClient.get(`/documento-proyecto/by-po/${poId}`);
  return response.data;
};

// 3. Descargar archivo por ID (crea enlace y lo simula)
export const descargarArchivoDesdeUrl = async (nombre, id) => {
  try {
    const response = await apiClient.get(
      `/documento-proyecto/descargar-documento/${id}`,
      {
        responseType: "blob", // 👈 importante para manejar binarios
      }
    );

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", nombre); // usa el nombre del archivo
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al descargar el archivo:", error);
    alert(
      "No se pudo descargar el archivo. Verifica que exista en el servidor."
    );
  }
};

// 4. Eliminar documento por ID
export const deleteDocumentoById = async (id) => {
  const response = await apiClient.delete(`/documento-proyecto/${id}`);
  return response.status === 201;
};

// 5. Subir documentos finales
export const subirDocumentos = async ({
  proyectoId,
  comentario,
  estado,
  archivos,
}) => {
  const formData = new FormData();
  formData.append("proyectoId", proyectoId);
  formData.append("comentario", comentario);
  formData.append("estado", estado);

  archivos.forEach((file) => {
    const sanitized = sanitizarNombreArchivo(file.name);
    formData.append("archivos", file, sanitized);
  });

  try {
    const response = await apiClient.post("/documento-proyecto", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.log("code estatus: ", error);
    if (error.response?.status === 500) {
      throw new Error("Error al subir documento o archivo muy grande");
    }
    throw new Error(
      error.response?.data?.message || "Error al subir documentos"
    );
  }
};

// Función para sanitizar nombre del archivo (similar a Flutter)
function sanitizarNombreArchivo(nombre) {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // elimina acentos
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9.\s-]/g, "")
    .replace(/\s+/g, "_");
}
