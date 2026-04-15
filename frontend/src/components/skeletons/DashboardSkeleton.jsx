export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonSectionCard />
        <SkeletonSectionCard />
      </div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-border bg-background p-5 animate-pulse">
      <div className="flex flex-col justify-between h-full min-h-stat-card">
        <div className="h-3 w-1/2 bg-muted rounded" />
        <div className="space-y-2 mt-6">
          <div className="h-6 w-2/3 bg-muted rounded" />
          <div className="h-3 w-1/3 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

function SkeletonSectionCard() {
  return (
    <div className="rounded-xl border border-border bg-background p-6 animate-pulse min-h-section-card">
      <div className="space-y-5">
        <div className="h-4 w-1/3 bg-muted rounded" />

        <div className="space-y-3">
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-5/6 bg-muted rounded" />
          <div className="h-3 w-2/3 bg-muted rounded" />
        </div>

        <div className="h-chart-skeleton bg-muted rounded" />
      </div>
    </div>
  );
}
