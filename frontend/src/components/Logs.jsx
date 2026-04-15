import { useConsoleDashboard } from "../stores/useConsoleDashboard";
import formatTime from "../utils/formatTime";
import { Link } from "react-router-dom";

function actionLabel(action) {
  return action.replaceAll("_", " ");
}

function actionTone(action) {
  if (action.includes("rejected") || action.includes("failed"))
    return "bg-red-500";
  if (action.includes("committed")) return "bg-success";
  if (action.includes("uploaded")) return "bg-primary";
  return "bg-muted-foreground";
}

export default function AuditLog() {
  const recentLogs = useConsoleDashboard((s) => s.recentLogs);

  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-foreground">
          Audit stream
        </p>
        <span className="text-xs text-muted-foreground">Last activity</span>
      </div>

      {recentLogs.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">
          No audit activity recorded
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {recentLogs.map((log) => (
            <li
              key={log.id}
              className="group rounded-md px-2 py-2 hover:bg-muted/40 transition"
            >
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${actionTone(log.action)}`}
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {actionLabel(log.action)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {log.user__username || "system"}
                  </p>
                </div>

                <span className="text-xs text-muted-foreground">
                  {formatTime(log.timestamp)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {recentLogs.length !== 0 && (
        <div className="pt-2 border-t border-border text-right">
          <Link
            to="audit_logs"
            name="view-all-logs"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition"
          >
            View full audit →
          </Link>
        </div>
      )}
    </div>
  );
}
