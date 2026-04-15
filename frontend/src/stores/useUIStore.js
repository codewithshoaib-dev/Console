import { create } from "zustand";

const MAX_TOASTS = 5;

export const useUIStore = create((set, get) => ({
  modal: null,
  toasts: [],
  success_true: false,
  isSidebarOpen: false,

  openModal: (type, payload = null) => {
    set({ modal: { type, payload } });
  },

  closeModal: () => set({ modal: null }),

  // Add a toast
  addToast: (payload) => {
    const id = Date.now();
    const newToast = { id, ...payload };

    set((state) => ({
      toasts: [newToast, ...state.toasts].slice(0, MAX_TOASTS),
    }));

    const duration = payload?.duration ?? 3000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  setSuccess: (value) => set({ success_true: value }),

  // Sidebar toggle methods
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
