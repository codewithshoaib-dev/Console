import { create } from "zustand";

import { useConsoleDashboard } from "./useConsoleDashboard";
import { useContacts } from "./useContacts";
import { useImports } from "./useImports";
import { useAuth } from "./useAuth";
import { useLogs } from "./useLogs";
import { useMembers } from "./useMembers";
import { useWorkspace } from "./useWorkspace";


async function bootstrapWorkspace(workspaceId) {
  await Promise.all([
    useContacts.getState().init(workspaceId),
    useImports.getState().init(workspaceId),
    useLogs.getState().init(workspaceId),
    useMembers.getState().init(workspaceId),
  ]);
}

export const useLifecycleStore = create((set, get) => ({
  sessionStatus: "booting", // 'booting' | 'authenticating' | 'ready' | 'error'
  error: null,

  workspaceId: null,

  async establishSession({ username, password }) {
    resetSessionLevel();

    set({ sessionStatus: "authenticating", error: null });

    try {
      await useAuth.getState().login(username, password);
    } catch (err) {
      set({ sessionStatus: "error", error: err });
      return;
    }

    set({ sessionStatus: "loadingWorkspaces" });

    let workspaceId;

    try {
      await useWorkspace.getState().load();
      const workspace = useWorkspace.getState().current;
      if (!workspace) throw new Error("No workspace found after login");
      workspaceId = workspace.id;
      set({ workspaceId: workspaceId });
    } catch (err) {
      set({ sessionStatus: "error", error: err });
      return;
    }
    try {
        await bootstrapWorkspace(workspaceId);
      } catch (err) {
              console.log(err);
        set({ sessionStatus: "error", error: err });
        return;
      }

    set({ sessionStatus: "ready" });
  },

  async switchWorkspace(workspaceId) {
    const { workspaceId: current } = get();
    if (workspaceId === current) return;

    resetRouteData();

    set({ workspaceId });
    useWorkspace.getState().switch(workspaceId);
  },
}));

// --------------------
// Reset helpers
// --------------------
function resetRouteData() {
  safeReset(useConsoleDashboard);
  safeReset(useContacts);
  safeReset(useImports);
  safeReset(useLogs);
  safeReset(useMembers);
}

function resetWorkspaceLevel() {
  resetRouteData();
  safeReset(useWorkspace);
}

function resetSessionLevel() {
  resetWorkspaceLevel();
  safeReset(useAuth);
}

// --------------------
// Safe reset wrapper
// --------------------
function safeReset(store) {
  try {
    store.getState().reset?.();
  } catch (err) {
    console.warn("Error resetting store:", err);
  }
}
