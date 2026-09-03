import { create } from 'zustand';

interface UndoToastState {
  message: string;
  visible: boolean;
  onUndo: (() => void) | null;
  show: (message: string, onUndo: () => void) => void;
  hide: () => void;
  performUndo: () => void;
}

export const useUndoToast = create<UndoToastState>((set, get) => ({
  message: '',
  visible: false,
  onUndo: null,
  show: (message, onUndo) => set({ message, visible: true, onUndo }),
  hide: () => set({ visible: false, onUndo: null }),
  performUndo: () => {
    const { onUndo } = get();
    if (onUndo) onUndo();
    set({ visible: false, onUndo: null });
  },
}));
