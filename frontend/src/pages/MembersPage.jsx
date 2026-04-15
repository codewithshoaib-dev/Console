import { useMembers } from "../stores/useMembers";
import { useLifecycleStore } from "../stores/useLifeCycle";
import { useEffect, useState } from "react";
import PageSkeleton from "../components/skeletons/PageSkeleton";
import SearchInput from "../components/ui/SearchInput";
import { Trash2, Pencil } from "lucide-react";
import { EditMemberModal } from "../components/EditMemberModal";
import DeleteModal from "../components/ui/DeleteModal";
import Pagination from "../components/Pagination";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "../utils/useDebounce";
import { useUIStore } from "../stores/useUIStore";

export default function MembersPage() {
  const { list, load, loading, count, totalPages } = useMembers();
  const { workspaceId } = useLifecycleStore();
  const [editing, setEditing] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") || 1);

  const [search, setSearch] = useState(params.get("search") || "");

  const debouncedSearch = useDebounce(search, 800);
  const onRemove = useMembers((s) => s.remove);

   const openModal = useUIStore((s) => s.openModal);

  const openDeleteModal = (id) => {
    setSelectedMemberId(id);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (!workspaceId) return;

    setParams({ page: "1", search: debouncedSearch });
  }, [debouncedSearch, workspaceId]);

  useEffect(() => {
    if (!workspaceId) {
      return;
    }
    const currentSearch = params.get("search") || "";
    const currentPage = Number(params.get("page") || 1);
    load(currentPage, currentSearch);
  }, [workspaceId, params]);

  const filtered = list;

 
  const onPageChange = (newPage) => {
    if (typeof newPage !== "number") {
      console.error("INVALID PAGE:", newPage);
      return;
    }
    setParams({
      page: String(newPage),
      search: params.get("search") || "",
    });

  };

  if (loading) return <PageSkeleton />;

  return (
    <>
      {isModalOpen && (
        <DeleteModal
          text="Are you sure you want to delete this member?"
          onDelete={() => {
            onRemove(selectedMemberId);
            setIsModalOpen(false);
          }}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      <div className="p-4 sm:p-6 bg-background space-y-4 sm:space-y-6 overflow-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-heading font-bold">Members</h1>
            <p className="text-sm sm:text-subheading text-foreground/70">
              Manage all workspace members and their roles
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <SearchInput
              search={search}
              setSearch={setSearch}
              searchName={"search-members"}
              placeholder={"Search members..."}
            />
            <button
              onClick={() => openModal("invite-member")}
              name="invite-member"
              className="px-4 py-2 bg-primary/80 text-foreground text-sm rounded-lg hover:bg-primary"
            >
              Invite
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-sm text-foreground/70 text-center py-12">
            No members found
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {filtered.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                      {m.username[0].toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium truncate">{m.username}</p>
                      <p className="text-xs text-foreground/60 capitalize">
                        {m.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">

                    <button
                      name="edit-member"
                      onClick={() => setEditing(m)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="size-4" />
                    </button>

                    <button
                      name="remove-member"
                      onClick={() => openDeleteModal(m.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Pagination
              page={page}
              total_Count={count}
              onPageChange={onPageChange}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>

      {editing && (
        <EditMemberModal member={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}
