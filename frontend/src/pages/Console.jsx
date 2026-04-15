import { useWorkspace } from "../stores/useWorkspace";
import { useEffect } from "react";


import Metrics from "../components/Metrics";
import Members from "../components/Members";
import Imports from "../components/Imports";
import Logs from "../components/Logs";
import DashboardSkeleton from "../components/skeletons/DashboardSkeleton";

import { useConsoleDashboard } from "../stores/useConsoleDashboard";

export default function Console() {
 
  const current = useWorkspace((s) => s.current);
 
 

 const fetchDashboardData = useConsoleDashboard((s) => s.fetchDashboardData);
 const loading = useConsoleDashboard((s) => s.loading);

 

   useEffect(() => {
     if (!current?.id) return;
     fetchDashboardData(current.id);
   }, [current?.id]);

  if (loading) return <DashboardSkeleton/>
  return (
    <div className="grid gap-5 overflow-auto grid-cols-1 p-4">
      <div className="space-y-1 pb-3 border-b border-border">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Overview
        </p>
        <p className="text-sm text-foreground">
          System-wide metrics for recent activity
        </p>
      </div>

      <Metrics />

      <div className="flex items-center gap-3 pt-2">
        <span className="h-px flex-1 bg-border" />
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Recent activity
        </p>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Imports />
        <Members />
      </div>

      <Logs />
    </div>
  );
}
