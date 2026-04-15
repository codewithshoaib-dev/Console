import { useImportRows } from "../stores/useImportRows";
import { useImports } from "../stores/useImports";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { useLifecycleStore } from "../stores/useLifeCycle";
import Pagination from "../components/Pagination";

export default function ImportPreviewPage() {
  const { session_id } = useParams();
  const onCommit = useImports((s) => s.commit);
  const onReject = useImports((s) => s.reject);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const invalidOnly = searchParams.get("invalid") === "1";

  const setPage = (p) => {
    setSearchParams((prev) => {
      prev.set("page", p);
      return prev;
    });
  };

  const setInvalidOnly = (v) => {
    setSearchParams((prev) => {
      if (v) prev.set("invalid", "1");
      else prev.delete("invalid");
      prev.set("page", 1);
      return prev;
    });
  };

  const workspaceId = useLifecycleStore((s) => s.workspaceId);

  const { rows, meta, loading, fetchRows } = useImportRows();

  useEffect(() => {
    if (!workspaceId || !session_id) return;
    fetchRows(workspaceId, session_id, { page, invalidOnly });
  }, [workspaceId, session_id, page, invalidOnly]);

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      <PreviewHeader meta={meta} />
      <FilterBar invalidOnly={invalidOnly} setInvalidOnly={setInvalidOnly} />

      <main className="flex-1 overflow-auto p-4">
        {loading ? <LoadingSkeleton /> : <PreviewTable rows={rows} />}
      </main>

      <PreviewFooter
        page={page}
        setPage={setPage}
        totalPages={meta.total_pages}
        onCommit={() => onCommit(session_id)}
        onReject={() => onReject(session_id)}
        hasValid={meta.valid_rows > 0}
      />
    </div>
  );
}

function PreviewHeader({ meta }) {
  return (
    <header className="md:sticky md:top-0 z-20 flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
      <Link to="/imports">
        <ChevronLeft className="text-muted-foreground" />
      </Link>
      <AlertTriangle className="text-muted-foreground" />
      <div>
        <div className="text-sm font-semibold text-heading">Import Preview</div>
        <div className="text-xs text-muted-foreground">
          {meta.valid_rows} valid · {meta.invalid_rows} invalid
        </div>
      </div>
    </header>
  );
}

function FilterBar({ invalidOnly, setInvalidOnly }) {
  return (
    <div className="md:sticky md:top-13 z-10 flex gap-2 px-4 py-2 border-b border-border bg-card">
      <button
        name="filter-all"
        onClick={() => setInvalidOnly(false)}
        className={`text-xs px-3 py-1 rounded-md font-medium ${
          !invalidOnly ? "bg-muted text-background" : "text-muted-foreground"
        }`}
      >
        All rows
      </button>
      <button
        name="filter-invalid"
        onClick={() => setInvalidOnly(true)}
        className={`text-xs px-3 py-1 rounded-md font-medium ${
          invalidOnly
            ? "bg-destructive/10 text-destructive"
            : "text-muted-foreground"
        }`}
      >
        Invalid only
      </button>
    </div>
  );
}

function PreviewTable({ rows }) {
  if (!rows.length) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No rows to display.
      </div>
    );
  }

  const headers = Object.keys(rows[0].raw_data);

  const renderValue = (value) => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const renderErrors = (errors) => {
    if (!errors || !errors.length) return "";
    return errors.join(", ");
  };

  return (
    <>
      <table className="hidden md:table w-full border-separate border-spacing-0 text-left">
        <thead className="sticky top-0 bg-card z-5">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="border-b border-border px-4 py-2 text-[11px] font-bold uppercase text-muted-foreground"
              >
                {h}
              </th>
            ))}
            <th className="border-b border-border px-4 py-2 text-[11px] font-bold uppercase text-muted-foreground">
              Errors
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`${
                row.is_valid ? "hover:bg-background/10" : "bg-destructive/20"
              }`}
            >
              {headers.map((h) => (
                <td
                  key={h}
                  className="border-b border-border px-4 py-2 text-sm font-mono truncate"
                >
                  {renderValue(row.raw_data[h])}
                </td>
              ))}
              <td className="border-b border-border px-4 py-2 text-xs text-destructive">
                {renderErrors(row.errors)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="md:hidden md:w-0 space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className={`border border-border rounded-md p-3 ${
              row.is_valid ? "" : "bg-destructive/20"
            }`}
          >
            {headers.map((h) => (
              <div key={h} className="flex justify-between py-1 text-sm">
                <span className="text-muted-foreground uppercase">{h}</span>
                <span className="font-mono">
                  {renderValue(row.raw_data[h])}
                </span>
              </div>
            ))}

            {row.errors?.length > 0 && (
              <div className="mt-2 text-xs text-destructive">
                {renderErrors(row.errors)}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}


function PreviewFooter({
  page,
  setPage,
  totalPages,
  onCommit,
  onReject,
  hasValid,
}) {
  return (
    <footer className="sticky bottom-0 z-10 border-t border-border bg-card">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3">
        <div className="flex justify-center md:justify-start order-last md:order-0">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <div className="text-xs text-destructive md:text-right">
            Only valid rows will be committed
          </div>

          <div className="flex gap-2">
            <button
              name="reject-import-footer"
              onClick={onReject}
              className="px-3 py-2 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
            >
              Reject
            </button>

            <button
              name="commit-import-footer"
              onClick={onCommit}
              disabled={!hasValid}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                hasValid
                  ? "bg-primary text-background hover:bg-primary-hover"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Commit
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-25 md:h-12 bg-muted rounded-md md:rounded-none animate-pulse"
        />
      ))}
    </div>
  );
}
