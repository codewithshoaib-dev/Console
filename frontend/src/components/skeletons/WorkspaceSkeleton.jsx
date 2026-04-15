export default function WorkspaceSkeleton({ expanded }) {
  return (
    <div className="ml-5 mt-2 space-y-3">
      {[60, 48, 72].map((w, i) => (
        <div key={i} className="flex items-center gap-3">
        
          {expanded && (
            <div
              className="h-3 rounded-md bg-muted/50 animate-pulse"
              style={{ width: `${w}%` }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
