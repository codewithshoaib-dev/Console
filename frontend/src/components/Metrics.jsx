import { Users, Activity, Database, AlertTriangle } from "lucide-react";
import { useConsoleDashboard } from "../stores/useConsoleDashboard";
import { KPICard, COLORS } from "./ui/KPICard"

export default function Metrics() {
  const metrics = useConsoleDashboard((s) => s.metrics);

  const items = [
    {
      label: "Active users",
      value: metrics?.active_users_7d ?? 0,
      change: `${metrics?.change_in_active_users ?? 0} vs last week`,
      positive: (metrics?.change_in_active_users ?? 0) >= 0,
      color: COLORS.indigo,
      sparkData: metrics?.active_users_trend ?? [0, 0, 0, 0, 0],
    },
    {
      label: "Contacts added",
      value: metrics?.contacts_7d ?? 0,
      change: `${metrics?.contacts_total ?? 0} total`,
      positive: (metrics?.contacts_7d ?? 0) >= 0,
      color: COLORS.sky,
      sparkData: metrics?.contacts_trend ?? [0, 0, 0, 0, 0],
    },
    {
      label: "Import success",
      value: metrics
        ? `${Math.round((metrics.import_success_rate ?? 0) * 100)}%`
        : "0%",
      change: `${metrics?.rows_processed_7d ?? 0} rows processed`,
      positive: (metrics?.import_success_rate ?? 0) >= 0.8,
      color: COLORS.emerald,
      sparkData: metrics?.import_trend ?? [0, 0, 0, 0, 0],
    },
    {
      label: "Failed actions",
      value: metrics?.failed_actions_24h ?? 0,
      change: "Last 24 hours",
      positive: (metrics?.failed_actions_24h ?? 0) === 0,
      color: COLORS.rose,
      sparkData: metrics?.failed_actions_trend ?? [0, 0, 0, 0, 0],
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <KPICard
          key={index}
          label={item.label}
          value={item.value}
          change={item.change}
          positive={item.positive}
          sparkData={item.sparkData}
          color={item.color}
        />
      ))}
    </div>
  );
}
