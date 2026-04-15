import { useState, useEffect } from "react";
import apiClient from "../api/ApiClient";
import { useLifecycleStore } from "../stores/useLifeCycle";
import { useUIStore } from "../stores/useUIStore";
import { Copy, RefreshCw, X } from "lucide-react";

export default function InviteModal() {
  const [inviteLink, setInviteLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { addToast, closeModal } = useUIStore();
  const { workspaceId } = useLifecycleStore();

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeModal]);

  const createInvite = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.post(
        `/api/workspace/${workspaceId}/members/invite/`,
      );
      setInviteLink(data.invite_link);
      setCopied(false);
    } catch {
      addToast({ message: "Failed to create invite.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    addToast({ message: "Invite link copied", type: "success" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-background/40 backdrop-blur-sm"
        onClick={closeModal}
      />

      <div className="relative bg-card border border-border rounded-xl w-full max-w-md p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-heading text-lg">Invite Member</h2>
          <button
            name="close-invite-modal"
            onClick={closeModal}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Generate a secure invite link to onboard a new member into this
          workspace.
        </p>

        {!inviteLink ? (
          <button
            name="generate-invite"
            onClick={createInvite}
            disabled={loading}
            className="bg-primary/80 py-1.5 text-heading w-full"
          >
            {loading ? "Generating..." : "Generate Invite Link"}
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input readOnly value={inviteLink} className="input flex-1" />
              <button
                name="copy-invite"
                onClick={copyToClipboard}
                className="text-accent px-3"
              >
                <Copy size={16} />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {copied
                  ? "Copied to clipboard"
                  : "Anyone with this link can join"}
              </span>

              <button
                name="regenerate-invite"
                onClick={createInvite}
                className="flex items-center gap-1 hover:text-foreground"
              >
                <RefreshCw size={14} />
                Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
