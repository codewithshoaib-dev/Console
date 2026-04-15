const STATUS_MAP = {
  booting: "Initializing system core...",
  authenticating: "Verifying credentials...",
  loadingWorkspaces: "Fetching your workspaces...",
};

export default function DashLoader({ sessionStatus }) {
  const message = STATUS_MAP[sessionStatus] || "Preparing your dashboard...";

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground transition-colors duration-500">
      <div className="relative size-20">
        {/* Outer Path - subtle contrast against background */}
        <div className="absolute inset-0 rounded-full border-[3px] border-primary/10" />

        {/* Primary Spinner - Uses your Primary color */}
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary border-r-primary/30 animate-spin" />

        {/* Secondary Inner Ring - Uses Accent if defined, else subtle Primary */}
        <div className="absolute inset-2 rounded-full border-t-2 border-l-2 border-transparent border-t-primary/60 border-l-primary/20 animate-[spin_2s_linear_infinite_reverse]" />

        {/* The Core - Adapts to Light/Dark via opacity */}
        <div className="absolute inset-6 rounded-full bg-accent/15 backdrop-blur-sm flex items-center justify-center border border-accent/30">
          <div className="size-1.5 rounded-full bg-accent shadow-[0_0_12px_rgba(var(--accent-rgb),0.8)] animate-pulse" />
        </div>

        {/* Dynamic Glow - Softer in light mode, deeper in dark mode */}
        <div className="absolute -inset-4 bg-accent/10 blur-2xl rounded-full opacity-35" />
      </div>

      {/* Text Content */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/80 animate-pulse">
          {sessionStatus === "booting" ? "System" : "Security"}
        </p>

        <div className="h-8 overflow-hidden">
          <p
            key={sessionStatus}
            className="text-foreground/90 text-lg font-medium animate-fadeInUP"
          >
            {message}
          </p>
        </div>

        {/* Semantic Progress Decoration */}
        <div className="flex gap-1.5 mt-3">
          <div
            className={`h-1 w-6 rounded-full transition-all duration-300 ${sessionStatus === "booting" ? "bg-accent w-10" : "bg-accent/20"}
`}
          />
          <div
            className={`h-1 w-6 rounded-full transition-all duration-300 ${sessionStatus === "authenticating" ? "bg-accent w-10" : "bg-accent/20"}`}
          />
          <div
            className={`h-1 w-6 rounded-full transition-all duration-300 ${sessionStatus === "loadingWorkspaces" ? "bg-accent w-10" : "bg-accent/20"}`}
          />
        </div>
      </div>
    </div>
  );
}
