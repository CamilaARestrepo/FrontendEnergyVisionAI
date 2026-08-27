import { api } from './api';
import type { SettingsResponse, SettingsUpdate, SettingsTestResponse } from '../types/settings.types';

export const settingsService = {
  getSettings: async (): Promise<SettingsResponse> => {
    const { data } = await api.get('/settings');
    return data;
  },

  updateSettings: async (settings: SettingsUpdate): Promise<{ status: string; message: string }> => {
    const { data } = await api.put('/settings', settings);
    return data;
  },

  testConnection: async (settings: SettingsUpdate): Promise<SettingsTestResponse> => {
    const { data } = await api.post('/settings/test', settings);
    return data;
  }
};
