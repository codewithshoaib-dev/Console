import { useState } from "react";
import { Loader2, Plus, X } from "lucide-react"; 
import apiClient from "../api/ApiClient";
import { useUIStore } from "../stores/useUIStore";
import { successToast, errorToast } from "../utils/toastHelpers";

export function CreateWorkspaceModal() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onClose = useUIStore((s) => s.closeModal);


  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await apiClient.post("/api/workspaces/create/", { name });
      setName("");
      successToast( "Workspace created successfully");
      onClose();
    } catch (err) {
      errorToast(err, "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-card p-6 shadow-2xl transition-all border border-border animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Plus className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              New Workspace
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Workspace Name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering Team"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            />
            <p className="text-[0.8rem] text-muted-foreground">
              This is the name of your shared environment.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted h-10 px-4 py-2 border border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all bg-primary text-heading hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm shadow-primary/20"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
