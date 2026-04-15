import { Users, Activity, Database, AlertTriangle } from "lucide-react";
import { useConsoleDashboard } from "../stores/useConsoleDashboard";

export default function Metrics() {
  const metrics = useConsoleDashboard((s) => s.metrics);

  const items = [
    {
      label: "Active users",
      value: metrics?.active_users_7d ?? 0,
      desc: `${metrics?.contacts_7d ?? 0} contacts created`,
      icon: Users,
    },
    {
      label: "Active workspaces",
      value: metrics?.active_workspaces_7d ?? 0,
      desc: `${metrics?.owned_workspaces ?? 0} owned`,
      icon: Activity,
    },
    {
      label: "Import success",
      value: metrics ? `${Math.round(metrics.import_success_rate * 100)}%` : "0%",
      desc: `${metrics?.rows_processed_7d ?? 0} rows processed`,
      icon: Database,
    },
    {
      label: "Failed actions",
      value: metrics?.failed_actions_24h ?? 0,
      desc: "Last 24 hours",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        const isPercentage =
          typeof item.value === "string" && item.value.includes("%");

        return (
          <div
            key={index}
            className="rounded-xl border border-border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-foreground">
                {item.label}
              </h3>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold">
                {isPercentage
                  ? item.value
                  : new Intl.NumberFormat("en-US").format(Number(item.value))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
