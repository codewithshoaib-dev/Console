import { create } from "zustand";
import apiClient from "../api/ApiClient";

let requestId = 0;

export const useLogs = create((set, get) => ({
  logs: [],
  next: null,
  loading: false,
  error: null,
  workspaceId: null,
  filters: null,

  init: async (workspaceId, filters = {}) => {
    if (!workspaceId) return;

    set({
      workspaceId,
      filters,
      logs: [],
      next: null,
      error: null,
    });

    await get().load(true);
  },

  load: async (initial = false) => {
    const { loading, workspaceId, next, filters } = get();
    if (!workspaceId) return;
    if (loading) return;
    if (!initial && !next) return;

    const currentRequest = ++requestId;

    set({ loading: true, error: null });

    try {
      const url = initial ? `/api/workspaces/${workspaceId}/logs/` : next;

      const { data } = await apiClient.get(url, {
        params: initial ? filters : {},
      });

      if (currentRequest !== requestId) return;

      set((state) => ({
        logs: initial ? data.results : [...state.logs, ...data.results],
        next: data.next,
        loading: false,
      }));
    } catch (err) {
      if (currentRequest !== requestId) return;

      set({
        loading: false,
        error: err?.response?.data || err?.message || "Failed to load logs",
      });
    }
  },

  reset: () => {
    set({
      logs: [],
      next: null,
      loading: false,
      error: null,
      workspaceId: null,
      filters: null,
    });
  },
}));
