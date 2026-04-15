import { create } from "zustand";
import apiClient from "../api/ApiClient";


export const useImportRows = create((set, get) => ({
  cache: {}, // { [sessionId]: { all: {page, rows, meta}, invalid: {...} } }
  rows: [],
  meta: { count: 0, total_pages: 0, valid_rows: 0, invalid_rows: 0 },
  loading: false,
  error: null,

  fetchRows: async (workspaceId, sessionId, { page = 1, invalidOnly = false } = {}) => {
    if (!workspaceId || !sessionId) return;

    const cacheKey = invalidOnly ? "invalid" : "all";

    // Return cached if available for same page
    const cached = get().cache[sessionId]?.[cacheKey];
    if (cached && cached.page === page) {
      set({ rows: cached.rows, meta: cached.meta, loading: false });
      return;
    }

    set({ loading: true });

    try {
      const res = await apiClient.get(
        `api/workspaces/${workspaceId}/imports/${sessionId}/rows/`,
        { params: { page, invalidOnly } },
      );

      const newRows = res.data.results;
      const newMeta = {
        count: res.data.count,
        total_pages: res.data.total_pages,
        valid_rows: res.data.meta.valid_rows ?? 0,
        invalid_rows: res.data.meta.invalid_rows ?? 0,
      };

      // Update store
      set({ rows: newRows, meta: newMeta, loading: false });

      // Update cache: only one page per toggle
      set((state) => ({
        cache: {
          ...state.cache,
          [sessionId]: {
            ...(state.cache[sessionId] || {}),
            [cacheKey]: { page, rows: newRows, meta: newMeta },
          },
        },
      }));
    } catch (err) {
      console.error("Failed to fetch import rows:", err);
      set({ loading: false, error : err?.response?.data?.error || "Failed to fetch import rows"});
    }
  },
}));
