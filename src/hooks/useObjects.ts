/**
 * Hook para consultar objetos detectados del historial.
 *
 * Encapsula la query de TanStack Query para /api/v1/objects con
 * soporte completo de filtros, paginación y búsqueda.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { objectsService } from '@/services/objects.service';
import type { PaginatedObjectsResponse, DetectedObject } from '@/types/object.types';

export interface ObjectsFilters {
  page?: number;
  page_size?: number;
  category?: string;
  provider?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

/** Clave de query para invalidación precisa del caché de TanStack. */
export const OBJECTS_QUERY_KEY = 'objects';

/**
 * Lista paginada y filtrable de objetos detectados.
 * Los datos se cachean y se revalidan automáticamente.
 */
export function useObjects(filters: ObjectsFilters = {}) {
  const { page = 1, page_size = 20, ...rest } = filters;

  return useQuery<PaginatedObjectsResponse>({
    queryKey: [OBJECTS_QUERY_KEY, page, page_size, rest],
    queryFn: () => objectsService.getObjects({ page, page_size, ...rest }),
    placeholderData: (prev) => prev, // Mantiene datos anteriores mientras carga nueva página
    staleTime: 30_000, // 30s — el historial no cambia muy frecuentemente
  });
}

/**
 * Detalle de un objeto por su ID.
 * Los datos incluyen energy_data anidados.
 */
export function useObject(id: number | null) {
  return useQuery<DetectedObject>({
    queryKey: [OBJECTS_QUERY_KEY, id],
    queryFn: () => objectsService.getObjectById(id!),
    enabled: id !== null,
    staleTime: 60_000,
  });
}

/**
 * Mutación para eliminar un objeto del historial.
 * Invalida la lista completa al completar.
 */
export function useDeleteObject() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id: number) => objectsService.deleteObject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OBJECTS_QUERY_KEY] });
    },
  });
}

/**
 * Exporta los objetos en el formato especificado.
 * Descarga el archivo binario directamente.
 */
export function useExportObjects() {
  return useMutation<void, Error, { format: 'csv' | 'json'; filters?: ObjectsFilters }>({
    mutationFn: ({ format, filters }) => objectsService.exportObjects(format, filters),
  });
}
