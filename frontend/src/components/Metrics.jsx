import { Users, Activity, Database, AlertTriangle } from "lucide-react";
import { useConsoleDashboard } from "../stores/useConsoleDashboard";
import { KPICard, COLORS } from "./ui/KPICard"

export default function Metrics() {
  const metrics = useConsoleDashboard((s) => s.metrics);

  const items = [
    {
      label: "Active users",
      value: metrics?.active_users_7d ?? 0,
      change: `${metrics?.change_in_active_users ?? 0}%`,
      positive: metrics?.change_in_active_users_positive || false,
      color: COLORS.indigo,
      sparkData: metrics?.active_users_trend ?? [0, 0, 0, 0, 0],
    },
    {
      label: "Contacts added",
      value: metrics?.contacts_7d ?? 0,
      change: `${metrics?.change_in_contacts ?? 0}%`,
      positive: metrics?.change_in_contacts_positive || false,
      color: COLORS.sky,
      sparkData: metrics?.contacts_trend ?? [0, 0, 0, 0, 0],
    },
    {
      label: "Rows processed",
      value: metrics?.rows_processed_7d,
      change: `${metrics?.change_in_processed_rows ?? 0}%`,
      positive: metrics?.change_in_processed_rows_positive || false,
      color: COLORS.emerald,
      sparkData: metrics?.rows_processed_trend ?? [0, 0, 0, 0, 0],
    },
    {
      label: "Failed actions",
      value: metrics?.failed_actions_7d ?? 0,
      change: `${metrics?.change_in_failed_actions ?? 0}%`,
      positive: metrics?.change_in_failed_actions_positive || false,
      color: COLORS.rose,
      sparkData: metrics?.failed_actions_trend ?? [0, 0, 0, 0, 0],
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4 ">
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
