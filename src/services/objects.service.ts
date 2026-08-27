import { api } from './api';
import type { DetectedObject, PaginatedObjectsResponse } from '../types/object.types';
import type { ObjectsFilters } from '@/hooks/useObjects';

export const objectsService = {
  /**
   * Lista objetos con filtros, paginación y ordenamiento.
   * Nombre canónico esperado por useObjects hook.
   */
  getObjects: async (params: ObjectsFilters = {}): Promise<PaginatedObjectsResponse> => {
    const { page = 1, page_size = 20, ...rest } = params;
    const { data } = await api.get('/objects', {
      params: { page, page_size, ...rest },
    });
    return data;
  },

  /** @deprecated Usar getObjects() — mantenido para retrocompatibilidad */
  getPaginated: async (
    page: number = 1,
    pageSize: number = 20,
    category?: string,
    provider?: string,
  ): Promise<PaginatedObjectsResponse> => {
    const { data } = await api.get('/objects', {
      params: { page, page_size: pageSize, category, provider },
    });
    return data;
  },

  /** Obtiene el detalle completo de un objeto (con energy_data anidado). */
  getObjectById: async (id: number): Promise<DetectedObject> => {
    const { data } = await api.get(`/objects/${id}`);
    return data;
  },

  /** @deprecated Usar getObjectById() */
  getById: async (id: number): Promise<DetectedObject> => {
    const { data } = await api.get(`/objects/${id}`);
    return data;
  },

  /** Actualiza notas o sugerencias de reutilización de un objeto. */
  updateObject: async (id: number, payload: Partial<DetectedObject>): Promise<DetectedObject> => {
    const { data } = await api.patch(`/objects/${id}`, payload);
    return data;
  },

  /** @deprecated Usar updateObject() */
  update: async (id: number, payload: Partial<DetectedObject>): Promise<DetectedObject> => {
    const { data } = await api.patch(`/objects/${id}`, payload);
    return data;
  },

  /** Elimina un objeto del historial (cascade a energy_data). */
  deleteObject: async (id: number): Promise<void> => {
    await api.delete(`/objects/${id}`);
  },

  /** @deprecated Usar deleteObject() */
  delete: async (id: number): Promise<void> => {
    await api.delete(`/objects/${id}`);
  },

  /**
   * Exporta objetos como CSV o JSON.
   * Aplica los mismos filtros que getObjects().
   * Descarga el blob para que el llamador lo gatille como descarga.
   */
  exportObjects: async (
    format: 'csv' | 'json' = 'csv',
    filters?: ObjectsFilters,
  ): Promise<void> => {
    const { data } = await api.get('/export', {
      params: { format, ...filters },
      responseType: 'blob',
    });

    // Crear descarga automática en el navegador
    const url = URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `energyvision_export_${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /** @deprecated Usar exportObjects() */
  exportData: async (format: 'json' | 'csv' = 'csv'): Promise<Blob> => {
    const { data } = await api.get(`/export?format=${format}`, { responseType: 'blob' });
    return data;
  },
};
