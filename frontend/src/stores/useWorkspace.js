import { create } from "zustand";
import apiClient from "../api/ApiClient";
export const useWorkspace = create((set, get) => ({
  workspaces: [],
  current: null,
  loading: false,
  error: null,

  load: async () => {
    if (get().loading) return;

    set({ loading: true, error: null });

    try {
      const { data } = await apiClient.get("/api/workspaces/");

      const list = Array.isArray(data) ? data : [];

      const saved_workspace = JSON.parse(localStorage.getItem("workspace"));

      set((state) => ({
        workspaces: list,
        current: state.current ?? saved_workspace ?? list[0] ?? null,
        loading: false,
      }));
    } catch (err) {
      set({
        loading: false,
        error:
          err?.response?.data || err?.message || "Failed to load workspaces",
      });
    }
  },

  switch: (id) => {
    const ws = get().workspaces.find((w) => w.id === id);
    if (!ws) return;
    localStorage.setItem("workspace", JSON.stringify(ws));
    set({ current: ws });
  },

  reset: () => {
    set({
      workspaces: [],
      current: null,
      loading: false,
      error: null,
    });
  },
}));
