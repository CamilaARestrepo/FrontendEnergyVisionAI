import { create } from 'zustand';
import type { ScanResponse } from '../types/scan.types';

interface ScanState {
  currentFile: File | null;
  previewUrl: string | null;
  lastResult: ScanResponse | null;
  isScanning: boolean;

  setFile: (file: File | null) => void;
  setScanningState: (scanning: boolean) => void;
  setScanResult: (result: ScanResponse | null) => void;
  clearResult: () => void;  // Limpia solo el resultado (mantiene archivo)
  clearScan: () => void;    // Limpia todo
}

export const useScanStore = create<ScanState>((set) => ({
  currentFile: null,
  previewUrl: null,
  lastResult: null,
  isScanning: false,

  setFile: (file) =>
    set((state) => {
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
      return {
        currentFile: file,
        previewUrl: file ? URL.createObjectURL(file) : null,
      };
    }),

  // Alias retrocompatible para no romper el ImageUploader existente
  setFileList: (file: File | null) =>
    set((state) => {
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
      return {
        currentFile: file,
        previewUrl: file ? URL.createObjectURL(file) : null,
      };
    }),


  setScanningState: (isScanning) => set({ isScanning }),

  setScanResult: (lastResult) => set({ lastResult }),

  clearResult: () => set({ lastResult: null }),

  clearScan: () =>
    set((state) => {
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
      return { currentFile: null, previewUrl: null, lastResult: null, isScanning: false };
    }),
}));

