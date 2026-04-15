import {  useRef, useState } from "react";
import { useConsoleDashboard } from "../stores/useConsoleDashboard";
import { Link } from "react-router-dom";
import { useImports } from "../stores/useImports";
import DeleteModal from "./ui/DeleteModal";

export default function Imports() {
  const sessions = useConsoleDashboard((s) => s.recentImports);
  const [dragOver, setDragOver] = useState(false);

    const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const inputRef = useRef(null);
  const { upload, commit, reject } = useImports();

  const openDeleteModal = (id) => {
    setSelectedSessionId(id);
    setIsModalOpen(true);
  };
  return (
    <>
      {isModalOpen && (
        <DeleteModal
          text="Are you sure you want to reject this session?"
          onDelete={() => {
            reject(selectedSessionId);
            setIsModalOpen(false);
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-heading text-lg font-semibold">CSV Imports</h2>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            upload(e.dataTransfer.files[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 rounded-lg p-4 text-center cursor-pointer transition ${
            dragOver
              ? "border-primary bg-primary/10"
              : "border-dashed border-border"
          }`}
        >
          <input
            ref={inputRef}
            name="file"
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                upload(e.target.files[0]);
                e.target.value = "";
              }
            }}
          />
          <p className="text-sm text-muted-foreground">
            Drag a <span className="text-heading">CSV file</span> here or{" "}
            <span className="text-primary underline-offset-2 underline font-bold">
              Browse
            </span>
          </p>
        </div>

        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No imports yet
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 text-sm border-b border-border pb-2"
              >
                <div className="flex flex-col w-full">
                  <div className="flex flex-row justify-between">
                    <span className="font-medium truncate">
                      {s.original_filename || "untitled"}
                    </span>
                    {s.status !== "preview" && (
                      <span className="text-xs text-foreground">
                        Status: {s.status}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Rows: {s.row_count}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {s.status === "preview" && (
                    <>
                      <button
                        name="commit-import"
                        onClick={() => commit(s.id)}
                        className="inline-flex h-8 items-center gap-2 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        Commit
                      </button>

                      <button
                        name="reject-import"
                        onClick={() => openDeleteModal(s.id)}
                        className="inline-flex h-8 items-center gap-2 rounded-md border border-destructive/20 bg-transparent px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {sessions.length > 0 && (
          <div className="pt-2 border-t border-border text-right">
            <Link
              to={"imports"}
              name="view-all-imports"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View all imports
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
