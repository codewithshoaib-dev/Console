import { create } from "zustand";
import apiClient from "../api/ApiClient";

let requestId = 0;

export const useConsoleDashboard = create((set, get) => ({
  recentLogs: [],
  recentImports: [],
  recentContacts: [],
  recentMembers: [],
  metrics: [],
  loading: false,
  error: null,

  workspaceCache: {},

  fetchDashboardData: async (workspaceId) => {
    if (!workspaceId) return;
    if (get().loading) return;

    const cached = get().workspaceCache[workspaceId];
    if (cached) {
      set({ ...cached });
      return;
    }

    const currentRequest = ++requestId;
    set({ loading: true, error: null });

    try {
      const { data } = await apiClient.get(
        `/api/admin/dashboard/${workspaceId}/`
      );
      if (currentRequest !== requestId) return;

      const newData = {
        recentLogs: data.recent.logs,
        recentImports: data.recent.imports,
        recentContacts: data.recent.contacts,
        recentMembers: data.recent.members,
        metrics: data.metrics,
        loading: false,
      };

      set((state) => ({
        ...newData,
        workspaceCache: { ...state.workspaceCache, [workspaceId]: newData },
      }));
    } catch (err) {
      if (currentRequest !== requestId) return;
      set({
        loading: false,
        error: err?.response?.data || err?.message || "Failed to load data",
      });
    }
  },
  reset: () =>  {
    set({
      recentLogs: [],
      recentImports: [],
      recentContacts: [],
      recentMembers: [],
      metrics: [],
      loading: false,
      error: null,
      workspaceCache: {},
    });}
}));
