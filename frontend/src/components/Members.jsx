import { useConsoleDashboard } from "../stores/useConsoleDashboard";
import { Link } from "react-router-dom";
import { User2, Mail, CalendarCheck } from "lucide-react";
import formatTime from "../utils/formatTime";
import { useUIStore } from "../stores/useUIStore";

export default function Members() {
  const recentMembers = useConsoleDashboard((s) => s.recentMembers);

  const openModal = useUIStore((s) => s.openModal);

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-heading text-lg font-semibold">Members</h2>
      </div>

      {recentMembers.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No members in this workspace
          </p>
          <button
            onClick={() => openModal("invite-member")}
            name="invite-member-empty"
            className="mt-3 inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Invite member
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {recentMembers.map((m) => (
            <li key={m.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/20 text-muted-foreground text-xs font-semibold">
                  {m.user__username[0].toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0 gap-1">
                  <span className="truncate text-sm font-medium">
                    {m.user__username}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {m.user__email || "No email"}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarCheck className="w-3 h-3" /> Joined{" "}
                    {formatTime(m.joined_at) || "N/A"}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs px-2 py-0.5 rounded-full capitalize flex items-center gap-1 ${
                  m.role === "owner"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/30 text-muted-foreground"
                }`}
              >
                {m.role === "owner" && <User2 className="w-3 h-3" />}
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="pt-2 border-t border-border flex items-end justify-between mt-auto">
        <button
          onClick={() => openModal("invite-member")}
          name="invite-member"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
        >
          Invite
        </button>

        <Link
          to={"members"}
          name="view-members"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all members
        </Link>
      </div>
    </div>
  );
}
