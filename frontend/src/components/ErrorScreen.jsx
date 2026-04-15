import {  RefreshCcw, ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function ErrorScreen({ error, onRetry }) {
  let navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="max-w-sm w-full bg-card rounded-2xl border border-border shadow-lg p-8 text-center animate-in fade-in zoom-in duration-200">
        {/* Icon Header */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive stroke-[1.5]" />
        </div>

        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Session Error
        </h2>

        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {error?.message ||
            "We couldn’t restore your session. Please try again if the issue persists."}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {/* Primary Action: Retry */}
          <button
            onClick={onRetry}
            className="group inline-flex h-10 items-center justify-center rounded-md bg-primary/70 px-4 py-2 text-sm font-medium text-subheading transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            <RefreshCcw className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            Try again
          </button>

          {/* Secondary Action: Go Back or Home */}
          <button
            onClick={() => navigate("/")}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground/60">
          Error code:{" "}
          <code className="text-[10px] uppercase">
            {error?.code || "AUTH_SESSION_EXPIRED"}
          </code>
        </p>
      </div>
    </div>
  );
}
