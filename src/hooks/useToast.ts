import { create } from 'zustand';

interface ToastState {
  message: string;
  visible: boolean;
  type: 'success' | 'error' | 'info';
  show: (message: string, type?: 'success' | 'error' | 'info') => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: '',
  visible: false,
  type: 'success',
  show: (message, type = 'success') => set({ message, visible: true, type }),
  hide: () => set({ visible: false }),
}));
