import { api } from './api';
import type { ScanResponse } from '../types/scan.types';

export const scanService = {
  scanObject: async (imageFile: File, notes?: string): Promise<ScanResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (notes) {
      formData.append('notes', notes);
    }

    const { data } = await api.post('/scan', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300_000, // 5 min — modelos de visión multimodal pueden tardar
    });
    
    return data;
  }
};
