import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface UiState {
  loading: boolean;
  notifications: Notification[];
  showLoading: () => void;
  hideLoading: () => void;
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  dismissNotification: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  loading: false,
  notifications: [],
  
  showLoading: () => set({ loading: true }),
  
  hideLoading: () => set({ loading: false }),
  
  showNotification: (message, type, duration = 5000) => {
    const id = Date.now().toString();
    
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, message, type, duration }
      ]
    }));
    
    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      }, duration);
    }
  },
  
  dismissNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  }))
}));
