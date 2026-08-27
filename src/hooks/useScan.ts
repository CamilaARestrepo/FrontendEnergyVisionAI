/**
 * Hook para enviar imágenes al pipeline de análisis.
 *
 * Maneja la mutación de TanStack Query, actualiza el store de Zustand
 * con el resultado, y expone estados de carga y error.
 */
import { useMutation } from '@tanstack/react-query';
import { scanService } from '@/services/scan.service';
import { useScanStore } from '@/store/scan.store';
import type { ScanResponse } from '@/types/scan.types';

interface UseScanOptions {
  onSuccess?: (data: ScanResponse) => void;
  onError?: (error: Error) => void;
}

export function useScan({ onSuccess, onError }: UseScanOptions = {}) {
  const { setScanningState, setScanResult, clearResult } = useScanStore();

  const mutation = useMutation<ScanResponse, Error, File>({
    mutationFn: (file: File) => scanService.scanObject(file),

    onMutate: () => {
      clearResult();
      setScanningState(true);
    },

    onSuccess: (data) => {
      setScanResult(data);
      setScanningState(false);
      onSuccess?.(data);
    },

    onError: (error) => {
      setScanningState(false);
      onError?.(error);
    },
  });

  return {
    scan: mutation.mutate,
    scanAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
