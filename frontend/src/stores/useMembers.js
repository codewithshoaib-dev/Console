import { create } from "zustand";
import apiClient from "../api/ApiClient";
import { errorToast, successToast } from "../utils/toastHelpers";

export const useMembers = create((set, get) => ({
  list: [],
  loading: false,
  error: null,
  workspaceId: null,
  count: 0,
  page: 1,
  totalPages: 0,

  init: async (workspaceId) => {
    if (!workspaceId) return;
    set({ workspaceId, page: 1 });
  },

  load: async (page, search = "") => {
    const { workspaceId, loading } = get();
    if (!workspaceId || !page) return;

    if (loading) return;

    set({ loading: true, error: null, page });

    try {
      const { data } = await apiClient.get(
        `/api/workspaces/${workspaceId}/members/`,
        { params: { page, search } },
      );
      set({
        list: data.results,
        loading: false,
        count: data.count,
        totalPages: data.total_pages,
      });
    } catch (err) {
      set({
        loading: false,
        error: err?.response?.data || err?.message,
      });
    }
  },

  add: async (userId, role) => {
    const { workspaceId, page } = get();
    if (!workspaceId || !userId || !role) return;

    try {
      await apiClient.post(`/api/workspaces/${workspaceId}/members/`, {
        userId,
        role,
      });
      successToast("Member added");
      await get().load(page);
    } catch (err) {
      set({ error: err?.response?.data || err?.message });
      errorToast(err, "Failed to add member");
    }
  },

  update: async (userId, role) => {
    const { workspaceId, page } = get();
    if (!workspaceId || !userId || !role) return;

    try {
      await apiClient.patch(
        `/api/workspaces/${workspaceId}/members/${userId}/`,
        { role },
      );
      successToast("Member role updated");
      await get().load(page);
    } catch (err) {
      set({ error: err?.response?.data || err?.message });
      errorToast(err, "Failed to update member role");
    }
  },

  remove: async (userId) => {
    const { workspaceId, page } = get();
    if (!workspaceId || !userId) return;

    try {
      await apiClient.delete(
        `/api/workspaces/${workspaceId}/members/${userId}/`,
      );
      successToast("Member removed");
      await get().load(page);
    } catch (err) {
      set({ error: err?.response?.data || err?.message });
      errorToast(err, "Failed to remove member");
    }
  },

  reset: () => {
    set({ list: [], loading: false, error: null });
  },
}));
