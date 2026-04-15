import { useState, useEffect, useRef } from "react";
import { useLogs } from "../stores/useLogs";
import formatTime from "../utils/formatTime";
import PageSkeleton from "../components/skeletons/PageSkeleton";
import { useLifecycleStore } from "../stores/useLifeCycle";

const timeRanges = [
  { label: "Last 15 minutes", value: "15m" },
  { label: "Last hour", value: "1h" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
];

export default function AuditLogsPage() {
  const { logs, loading, load, init, next } = useLogs();
  const containerRef = useRef(null);
  const { workspaceId } = useLifecycleStore();

  const [filterUser, setFilterUser] = useState("All");
  const [status, setStatus] = useState("All");
  const [timeRange, setTimeRange] = useState("");
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) =>
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  function resolveTimeRange(value) {
    const now = new Date();
    const fromDate = new Date(now);

    if (value.endsWith("m"))
      fromDate.setMinutes(now.getMinutes() - parseInt(value));
    if (value.endsWith("h"))
      fromDate.setHours(now.getHours() - parseInt(value));
    if (value.endsWith("d")) fromDate.setDate(now.getDate() - parseInt(value));

    return {
      from: fromDate.toISOString(),
      to: now.toISOString(),
    };
  }

const resolvedTime = !timeRange
  ? { from: undefined, to: undefined }
  : timeRange === "custom"
    ? {
        from: customFrom || undefined,
        to: customTo || undefined,
      }
    : resolveTimeRange(timeRange);


  const filters = {
    user: filterUser !== "All" ? filterUser : undefined,
    status: status !== "All" ? status : undefined,
    from_date: resolvedTime.from,
    to_date: resolvedTime.to,
  };

  useEffect(() => {
    if (workspaceId) init(workspaceId, filters);
  }, [workspaceId, filterUser, status, timeRange]);

  function onScroll() {
    const el = containerRef.current;
    if (!el || loading || !next) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      load();
    }
  }

  if (loading && logs.length === 0) return <PageSkeleton />;

  return (
    <div className="max-w-7xl max-h-[85svh] mx-auto p-4 md:p-6 bg-background text-foreground">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">
            Audit Logs
          </h1>
          <p className="text-sm text-muted-foreground">
            Track actions across your organization for investigation and
            compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-0">
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="w-44 h-9 px-3 text-xs font-medium rounded-md border border-border bg-card"
          >
            <option value="All">All Users</option>
            {Array.from(new Set(logs.map((l) => l.user))).map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-36 h-9 px-3 text-xs font-medium rounded-md border border-border bg-card"
          >
            <option value="All">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-9 px-3 text-xs font-medium rounded-md border border-border bg-card"
          >
            <option value="">All time</option>
            {timeRanges.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

        </div>
      </header>

      <div
        ref={containerRef}
        onScroll={onScroll}
        className="space-y-3 h-[60svh] lg:h-[70vh] overflow-y-auto"
      >
        {logs.map((log) => {
          const isExpanded = !!expandedRows[log.id];
          const isError = log.status !== "success";

          return (
            <div
              key={log.id}
              className={`group relative rounded-lg border px-4 py-3 transition ${
                isError
                  ? "border-destructive/30 bg-destructive/10"
                  : "border-border bg-card"
              }`}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleRow(log.id)}
              >
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {log.action.replaceAll("_", " ")}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{log.user}</span> 
                    :
                    {log.actor_role && <span>{log.actor_role}</span>}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatTime(log.timestamp)}
                </span>
              </div>

              {isExpanded && (
                <div className="mt-3 text-xs text-muted-foreground border-t border-border pt-2 flex flex-col gap-1">
                  <div>
                    <strong>Status:</strong> {log.status}
                  </div>
                  {log.model_name && log.object_id && (
                    <div>
                      <strong>Target:</strong> {log.model_name} #{log.object_id}
                    </div>
                  )}
                  {log.ip_address && (
                    <div>
                      <strong>IP:</strong> {log.ip_address}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            Loading more…
          </div>
        )}

        {!next && logs.length > 0 && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            End of log stream
          </div>
        )}
        {logs.length === 0 && (
          <div className="py-4 text-center text-xs text-muted-foreground">
            No logs found.
          </div>
        )}
      </div>
    </div>
  );
}
