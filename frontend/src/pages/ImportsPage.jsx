import { useEffect, useState } from "react";
import { Upload, FileText, X, AlertTriangle } from "lucide-react";
import { useImports } from "../stores/useImports";
import { useLifecycleStore } from "../stores/useLifeCycle";
import formatTime from "../utils/formatTime";
import PageSkeleton from "../components/skeletons/PageSkeleton";
import { Link, useSearchParams } from "react-router-dom";
import DeleteModal from "../components/ui/DeleteModal";
import Pagination from "../components/Pagination";

export default function ImportsPage() {
   const { workspaceId } = useLifecycleStore();
  const [ isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

    const [params, setParams] = useSearchParams();
   const page = Number(params.get("page") || 1);

  useEffect(() => {
    if (!workspaceId) return;
    const currentPage = Number(params.get("page") || 1);
    useImports.getState().load(currentPage);
  }, [workspaceId, params])

  const { imports, loading } = useImports();
  const onUpload = useImports((s) => s.upload);
  const onCommit = useImports((s) => s.commit);
  const onReject = useImports((s) => s.reject);
 const { totalPages, count } = useImports();

  const openDeleteModal = (id) => {
    setSelectedSessionId(id);
    setIsModalOpen(true);
  };
   const onPageChange = (newPage) => {
     if (typeof newPage !== "number") {
       console.error("INVALID PAGE:", newPage);
       return;
     }
     setParams({ page: String(newPage) });
   };


  if (loading) return <PageSkeleton />;

  return (
    <>
          {isModalOpen && (
            <DeleteModal
              text="Are you sure you want to reject this session?"
              onDelete={() => {
                onReject(selectedSessionId);
                setIsModalOpen(false);
              }}
              onClose={() => setIsModalOpen(false)}
            />
          )}
    <div className="p-4 sm:p-6 flex flex-col gap-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-heading text-lg">Imports</h1>
          <p className="text-muted-foreground text-sm">
            Review, validate, and commit imported data
          </p>
        </div>
        <ImportUploader onUpload={onUpload} />
      </header>

      <section className="surface-card border border-border rounded-xl">
        <div className="border-b border-border px-4 py-3 text-sm font-medium text-subheading">
          Import history
        </div>

        <div className="divide-y divide-border">
          {imports.length === 0 && <EmptyState />}

          {imports.map((session) => (
            <ImportRow
              key={session.id}
              session={session}
              // onOpen={() => setActiveSessionId(session.id)}
              onCommit={onCommit}
              onReject={openDeleteModal}
            />
          ))}
        </div>
         <Pagination
                  page={page}
                  total_Count={count}
                  onPageChange={onPageChange}
                  totalPages={totalPages}
                />
      </section>
    </div>
    </>
  );
}

function ImportUploader({ onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleChange = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file, setProgress);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <label className="relative flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 text-sm font-semibold text-primary hover:bg-primary/10">
      <Upload className="size-4" />
      <span>{uploading ? `Uploading ${progress}%` : "Import"}</span>
      <input
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => handleChange(e.target.files[0])}
      />
      {uploading && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      )}
    </label>
  );
}

function ImportRow({ session, onCommit, onReject }) {
  const isPreview = session.status === "preview";

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
          <FileText className="size-5 text-muted-foreground" />
        </div>

        <Link
          to={{ pathname: `preview/${session.id}` }}
          className="flex flex-col min-w-0"
        >
          <div className="text-sm font-semibold text-foreground truncate">
            {session.original_filename || "Untitled"}
          </div>

          <div className="text-xs text-muted-foreground">
            {session.row_count} rows • {session.invalid_rows} invalid
          </div>

          <div className="text-xs text-muted-foreground">
            {formatTime(session.created_at)}
          </div>
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3 md:justify-end">
        <StatusBadge status={session.status} />

        <div className="flex gap-2">
          {isPreview ? (
            <>
              <button
                name="commit-import"
                onClick={() => onCommit(session.id)}
                className="px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-md hover:bg-primary/5"
              >
                Commit
              </button>
              <button
                name="reject-import"
                onClick={() => onReject(session.id)}
                className="px-3 py-1.5 text-xs font-semibold text-destructive border border-destructive/30 rounded-md hover:bg-destructive/5"
              >
                Reject
              </button>
            </>
          ) : (
            <Link
              to={{ pathname: `preview/${session.id}` }}
              name="view-import"
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border rounded-md hover:text-foreground"
            >
              Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}



function StatusBadge({ status }) {
  const map = {
    preview: "text-amber-600",
    committed: "text-emerald-600",
    rejected: "text-rose-600",
  };

  return (
    <span className={`text-xs font-medium capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-12 text-center text-sm text-muted-foreground">
      No imports yet. Upload a CSV to get started.
    </div>
  );
}
