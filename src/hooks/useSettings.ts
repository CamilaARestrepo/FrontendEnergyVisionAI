/**
 * Hook para gestionar la configuración del proveedor de IA.
 *
 * Encapsula: GET settings, PUT settings, y POST settings/test.
 * Invalida el caché de TanStack Query tras actualizar.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import type { SettingsResponse, SettingsUpdate, SettingsTestResponse } from '@/types/settings.types';

export const SETTINGS_QUERY_KEY = 'settings';

/** Lee la configuración actual del proveedor de IA. */
export function useSettings() {
  return useQuery<SettingsResponse>({
    queryKey: [SETTINGS_QUERY_KEY],
    queryFn: settingsService.getSettings,
    staleTime: 60_000, // 1 minuto — la config no cambia frecuentemente
  });
}

/** Guarda y activa un proveedor de IA. */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation<{ status: string; message: string }, Error, SettingsUpdate>({
    mutationFn: settingsService.updateSettings,
    onSuccess: () => {
      // Invalidar para recargar el proveedor activo en la UI
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
    },
  });
}

/** Prueba la conexión al proveedor especificado (llamada REAL al modelo). */
export function useTestConnection() {
  return useMutation<SettingsTestResponse, Error, SettingsUpdate>({
    mutationFn: settingsService.testConnection,
  });
}
