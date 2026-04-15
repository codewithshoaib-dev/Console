import { create } from "zustand";
import apiClient from "../api/ApiClient";
import { errorToast, successToast } from "../utils/toastHelpers";

export const useImports = create((set, get) => ({
  imports: [],
  loading: false,
  error: null,
  workspaceId: null,
  page: 1,
  totalPages: 0,
  count: 0,

  init: async (workspaceId) => {
    if (!workspaceId) return;
    set({ workspaceId, page: 1 });
  },

  load: async (page) => {
    const { loading, workspaceId } = get();
    if (!workspaceId || !page) return;

    if (loading) return;

    set({ loading: true, error: null , page});

    try {
      const { data } = await apiClient.get(
        `/api/workspaces/${workspaceId}/imports/`,
        { params: { page } },
      );
      set({ imports: data.results, 
        count: data.count,
        totalPages: data.total_pages,
        loading: false });
    } catch (err) {
      set({
        error: err?.response?.data || err?.message || "Failed to load imports",
        loading: false,
      });
    }
  },

  upload: async (file, onProgress) => {
    const { workspaceId, page } = get();
    if (!file || !workspaceId) return;

    const form = new FormData();
    form.append("file", file);

    try {
      await apiClient.post(
        `/api/workspaces/${workspaceId}/imports/upload/`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (!onProgress) return;
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percentCompleted);
          },
        },
      );
      successToast("File uploaded successfully");
      await get().load(page);
    } catch (err) {
      set({
        error: err?.response?.data || err?.message || "Upload failed",
      });
      errorToast(err, "Failed to upload file");
    }
  },

  commit: async (sesionId) => {
    const { workspaceId, page } = get();
    if (!sesionId || !workspaceId) return;
    try {
      await apiClient.post(
        `/api/workspaces/${workspaceId}/imports/${sesionId}/commit/`,
      );
      successToast("File committed successfully");
      await get().load(page);
    } catch (err) {
      set({
        error: err?.response?.data?.error || err?.message || "Failed to Commit",
      });
      errorToast(err, "Failed to commit file");
    }
  },

  reject: async (sesionId) => {
    const { workspaceId, page } = get();
    if (!sesionId || !workspaceId) return;
    try {
      await apiClient.delete(
        `/api/workspaces/${workspaceId}/imports/${sesionId}/reject/`,
      );
      successToast("File rejected successfully");
      await get().load(page);
    } catch (err) {
      set({
        error: err?.response?.data?.error || err?.message || "Failed to Reject",
      });
      errorToast(err, "Failed to reject file");
    }
  },

  reset: () => {
    set({
      imports: [],
      loading: false,
      error: null,
    });
  },
}));
