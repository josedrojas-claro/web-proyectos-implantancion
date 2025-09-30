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

//funcion para borrar los materiales del replanteo, no borrar los planificados al igual que los servicios
export const deleteMaterialesReplanteo = async (data) => {
  const response = await apiClient.delete(
    `/materiales-asignado/replanteo/array-bulk`,
    {
      data,
    }
  );
  return response.data;
};

//funcion para crear los materiales replanteo en la etapa de replanteo
export const createMaterialesReplanteo = async (data, proyectoId) => {
  const response = await apiClient.post(
    `/materiales-asignado/replanteo/${proyectoId}`,
    data
  );
  return response.data;
};

//funcion para editar los materiales replanteados se puede utilizar en general
export const updateMaterialesReplanteo = async (proyectoId, data) => {
  const response = await apiClient.patch(
    `/materiales-asignado/${proyectoId}`,
    data
  );
  return response.data;
};

//funcion para obtener un excel para planificar
export const obtenerExcelPlanificacion = async (proyectoId) => {
  const response = await apiClient.get(
    `/materiales-asignado/excel/reserva/${proyectoId}`,
    {
      responseType: "blob",
    }
  );
  return response;
};

export const sincronizarInventario = async (file) => {
  // 1. Crear un objeto FormData. Es la forma estándar de enviar archivos.
  const formData = new FormData();

  formData.append("inventario", file);

  const response = await apiClient.post("/inventario-material/sync", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

//funcion para mostar inventario por codigo de material
export const fetchInventarioPorCodigo = async (codigo) => {
  const response = await apiClient.get(`/inventario-material/stock/${codigo}`);
  return response.data;
};

//get materiales para gestion de replanteo
export const fetchMaterialesGestionReplanteo = async (proyectoId) => {
  const response = await apiClient.get(
    `/materiales-asignado/material-gestion-reserva/${proyectoId}`
  );
  return response.data;
};

//get materiales para vs de replanteados vs planificados
export const fetchMaterialesReplanteadosVsPlanificados = async (proyectoId) => {
  const response = await apiClient.get(
    `/materiales-asignado/material-gestion-reserva-planificados-vs-replanteados/${proyectoId}`
  );
  return response.data;
};

//funcion para cargar el retiro de materiales
export const createMaterialGestionReserva = async (retiros) => {
  const response = await apiClient.post(
    `/materiales-asignado/material-gestion-reserva`,
    { retiros }
  );
  return response.data;
};

//funcion para ver todo el inventario para reasignar
export const fetchInventarioParaReasignar = async ({
  limit,
  offset,
  search,
} = {}) => {
  const response = await apiClient.get(
    `/inventario-material/stock-para-reasignar`,
    {
      params: {
        limit,
        offset,
        search,
      },
    }
  );
  return response.data;
};

//funcion para consultar fecha de sincronizacion
export const fetchFechaSincronizacion = async () => {
  const response = await apiClient.get(
    `/inventario-material/fecha-ultima-async`
  );
  return response.data;
};

//funcion para reasingar material desde la gestion de reserva segun inventario
export const reasignarMaterialDesdeInventario = async (id, data) => {
  const response = await apiClient.patch(
    `/materiales-asignado/reasignar-material/${id}`,
    data
  );
  return response.data;
};

//funcion para realizar rollback
export const rollbackMaterialGestionReserva = async (id) => {
  const response = await apiClient.patch(
    `/materiales-asignado/rollback-material/${id}`
  );
  return response.data;
};

//funcion para enviar un materiaal a asignar al contratista
export const asignarMaterialContratista = async (data) => {
  const response = await apiClient.post(
    `/materiales-asignado/asignar-materiales-contratista`,
    data
  );
  return response.data;
};

//funcion para ver la lista de reserva por proyecto esto es solo para los materiales
export const fetchMaterialesReservaPorProyecto = async (proyectoId) => {
  const response = await apiClient.get(`/reservas/by-proyecto/${proyectoId}`);
  return response.data;
};

//funcion para actualizar los datos de la reserva
export const updateDataReserva = async (id, data) => {
  const response = await apiClient.patch(`/reservas/${id}`, data);
  return response.data;
};

//funcion para camiar o editar la reserva para x proyecto
export const crearYAsignarReservaApi = async (materialAsignadoId, data) => {
  const response = await apiClient.post(
    `/reservas/crear-y-asignar-reserva/${materialAsignadoId}`,
    data
  );
  return response.data;
};

//funcion para editar valores de lo servicios asignados se usara para hacer el vs  de planificado vs replanteado
export const updateMaterialesAsignados = async (id, data) => {
  const response = await apiClient.patch(`/materiales-asignado/${id}`, data);
  return response.data;
};

//funcion para descargar tabla con reserva o con materiales de contratista
export const obtenerExcelReservaContratisa = async (proyectoId) => {
  const response = await apiClient.get(
    `/materiales-asignado/excel-materiales-reserva-contratista/${proyectoId}`,
    {
      responseType: "blob",
    }
  );
  return response;
};

//funcion para confirmar material y enviar a retirar
export const confirmarEnvioARetiro = async (proyectoId) => {
  const response = await apiClient.post(
    `/materiales-asignado/proyectos/${proyectoId}/confirmar-reserva-retiro`
  );
  return response.data;
};

//funcion para hacer borrado de del amacen seleccioando
export const deleteAlmacenSeleccionado = async (
  idAlmacen,
  materialAsignadoId
) => {
  const response = await apiClient.delete(
    `/materiales-asignado/borrado-de-almacen/${idAlmacen}/${materialAsignadoId}`
  );
  return response.data;
};

//funcion para etapa de conciliacion de materiales
//get materiales para gestion de replanteo
export const fetchMaterialesConciliacion = async (proyectoId) => {
  const response = await apiClient.get(
    `/materiales-asignado/material-gestion-reserva-vs-ejecutado/${proyectoId}`
  );
  return response.data;
};

//funcion para descargar excel de conciliacion
export const descargarExcelFormatoConciliacion = async (proyectoId) => {
  const response = await apiClient.get(
    `/materiales-asignado/formato-conciliacion-materiales/${proyectoId}`,
    {
      responseType: "blob", // MUY IMPORTANTE
    }
  );

  // Crear un link temporal y simular click
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  // Recuperar nombre de Content-Disposition si quieres
  const contentDisposition = response.headers["content-disposition"];
  let fileName = "rdo.xlsx";
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      fileName = decodeURIComponent(match[1]);
    }
  }

  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
