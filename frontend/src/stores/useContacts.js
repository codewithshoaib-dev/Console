import { create } from "zustand";
import apiClient from "../api/ApiClient";
import { errorToast, successToast } from "../utils/toastHelpers";

export const useContacts = create((set, get) => ({
  workspaceId: null,
  items: [],
  page: 1,
  total: 0,
  loading: false,
  error: null,
  totalPages: 0,

  init: async (workspaceId) => {
    if (!workspaceId) return;
    set({ workspaceId, page: 1 });
  },

  fetchPage: async (page, workspaceId, search = "") => {
    if (!workspaceId) return;
    if (get().loading) return;

    set({ loading: true, error: null, page });

    try {
      const { data } = await apiClient.get(
        `/api/workspaces/${workspaceId}/contacts/`,
        { params: { page, search } },
      );

      set({
        items: Array.isArray(data.results) ? data.results : [],
        total: data.count,
        totalPages: data.total_pages,
        loading : false,
      });
    } catch (err) {
      set({
        error: err?.response?.data || err?.message || "Failed to load contacts",
        loading: false
      });
    }
  },

  create: async ( payload ) => {
    const { workspaceId, page } = get();
    if (!workspaceId) return;

    try {
      await apiClient.post(
        `/api/workspaces/${workspaceId}/contacts/create/`,
        payload,
      );
      successToast("Contact created successfully");
      await get().fetchPage(page, workspaceId);
    } catch (err) {
      set({
        error:
          err?.response?.data || err?.message || "Failed to create contact",
      });
      errorToast(err, "Failed to create contact");
    }
  },

  update: async (contactId,  form ) => {
    const { workspaceId, page } = get();
    if (!contactId || !workspaceId) return;
    console.log(form)

    try {
      await apiClient.patch(
        `/api/workspaces/${workspaceId}/contacts/${contactId}/`,
         form  ,
      );
      successToast("Contact updated successfully");
      await get().fetchPage(page, workspaceId);
    } catch (err) {
      set({
        error:
          err?.response?.data?.error ||
          err?.message ||
          "Failed to update contact",
      });
      errorToast(err, "Failed to update contact");
    }
  },

  delete: async (contactId) => {
    const { workspaceId, page } = get();
    if (!contactId || !workspaceId) return;

    try {
      await apiClient.delete(
        `/api/workspaces/${workspaceId}/contacts/${contactId}/`,
      );
      successToast("Contact deleted successfully");
      await get().fetchPage(page, workspaceId);
    } catch (err) {
      set({
        error:
          err?.response?.data?.error ||
          err?.message ||
          "Failed to delete contact",
      });
      errorToast(err, "Failed to delete contact");
    }
  },

  reset: () => {
    set({
      workspaceId: null,
      items: [],
      page: 1,
      total: 0,
      status: "idle",
      error: null,
    });
  },
}));
