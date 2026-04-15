import { create } from "zustand";
import apiClient from "../api/ApiClient";

export const useAuth = create((set, get) => ({
  accessToken: null,
  initialized: false,
  refreshing: false,
  queue: [],
  loading: false,
  error: null,

  setAccessToken: (token) => {
    set({ accessToken: token });
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await apiClient.post("api/login/", {
        username,
        password,
      });
      set({ loading: false, error: null, accessToken: data.access });
      return data;
    } catch (err) {
      set({ loading: false, error: err });
      throw err
    }
  },

  refreshAccess: async () => {
    const { refreshing, queue } = get();

    if (refreshing) {
      return new Promise((resolve, reject) => {
        set({ queue: [...queue, { resolve, reject }] });
      });
    }

    set({ refreshing: true });

    try {
      const { data } = await apiClient.post("api/refresh/");
      set({ accessToken: data.access });

      get().queue.forEach((p) => p.resolve(data.access));
      set({ queue: [] });

      return data.access;
    } catch (err) {
      get().queue.forEach((p) => p.reject(err));
      set({ queue: [], accessToken: null });
      throw err;
    } finally {
      set({ refreshing: false });
    }
  },

  initAuth: async ({ username, password }) => {
    if (get().initialized) return;

    try {
      await get().refreshAccess();
      set({ initialized: true });
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          await get().login(username, password);
          set({ initialized: true });
        } catch (loginErr) {
          set({ initialized: true, accessToken: null });
        }
      } else {
        set({ initialized: true });
      }
    }
  },

  reset: () => {
    set({
      accessToken: null,
      initialized: false,
      refreshing: false,
      queue: [],
      loading: false,
      error: null,
    });
  },
}));
