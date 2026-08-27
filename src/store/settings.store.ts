import { create } from 'zustand';

interface SettingsUIState {
  isSettingsModalOpen: boolean;
  selectedProviderForm: string | null;
  
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  selectForm: (provider: string | null) => void;
}

export const useSettingsStore = create<SettingsUIState>((set) => ({
  isSettingsModalOpen: false,
  selectedProviderForm: null,

  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false, selectedProviderForm: null }),
  selectForm: (provider) => set({ selectedProviderForm: provider }),
}));
