import { create } from "zustand";

export const useSelectionStore = create((set, get) => ({
  // 1. EL ESTADO: El array que guarda TODAS las selecciones
  selectedRowKeys: [],

  // 2. LAS ACCIONES: Funciones para modificar el estado

  // Esta es la acción "inteligente" que resuelve tu problema
  toggleSelection: (newKeysOnCurrentPage, dataSourceOnCurrentPage) => {
    // Obtenemos los IDs de los items de la página actual
    const currentPageKeys = dataSourceOnCurrentPage.map((item) => item.id);

    // Obtenemos las selecciones de OTRAS páginas que ya teníamos guardadas
    const keysOnOtherPages = get().selectedRowKeys.filter(
      (key) => !currentPageKeys.includes(key)
    );

    // Unimos las selecciones de otras páginas con las nuevas de la página actual
    set({ selectedRowKeys: [...keysOnOtherPages, ...newKeysOnCurrentPage] });
  },

  // Una acción simple para limpiar todo
  clearSelection: () => set({ selectedRowKeys: [] }),
}));
