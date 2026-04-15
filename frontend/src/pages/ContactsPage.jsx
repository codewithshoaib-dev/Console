import { useState , useEffect, useRef} from "react";
import { Plus, Building2, } from "lucide-react";
import { useContacts } from "../stores/useContacts";
import { useUIStore } from "../stores/useUIStore";
import SearchInput from "../components/ui/SearchInput";
import Avatar from "../components/Avatar";
import Pagination from "../components/Pagination";
import { useLifecycleStore } from "../stores/useLifeCycle";
import { useSearchParams } from "react-router-dom";
import PageSkeleton from "../components/skeletons/PageSkeleton";
import { useDebounce } from "../utils/useDebounce";

const PAGE_SIZE = 20;

export default function ContactsPage() {
   const [params, setParams] = useSearchParams();
   const page = Number(params.get("page") || 1);
  
   const openModal = useUIStore((s) => s.openModal);

   const { fetchPage, totalPages, loading } = useContacts();
   const { workspaceId } = useLifecycleStore();

    const [search, setSearch] = useState(params.get("search") || "");

    const debouncedSearch = useDebounce(search, 800);

  useEffect(() => {
        if (!workspaceId) return;

        setParams({ page: "1", search: debouncedSearch });
      }, [debouncedSearch, workspaceId]);

 useEffect(() => {
   if (!workspaceId) return;
   const currentSearch = params.get("search") || "";
   const currentPage = Number(params.get("page") || 1);
   fetchPage(currentPage, workspaceId, currentSearch);
 }, [workspaceId, params]);

  const contacts = useContacts((s) => s.items)
  const count = useContacts((s) => s.total)
 
  const onPageChange = (newPage) => {
    if (typeof newPage !== "number") {
      console.error("INVALID PAGE:", newPage);
      return;
    }
    setParams({ page: String(newPage),
      search: params.get("search") || "", });
  };
if(loading) return <PageSkeleton />;

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-heading text-lg">Contacts</h1>
          <p className="text-muted-foreground text-sm">
            Contacts you've added or imported into this workspace
          </p>
        </div>

        <button
          name="create-contact"
          onClick={() => openModal("create-contact")}
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-md
           bg-primary px-3 py-1 sm:py-1.5 text-sm font-medium text-primary-foreground
            transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-ring"
        >
          <Plus className="size-4" />
          <span >Add</span>
        </button>
      </header>

      <SearchInput
        search={search}
        setSearch={setSearch}
        searchName={"search-contacts"}
        placeholder={"Search Contacts..."}
        width={"w-72"}
      />

      <section className="surface-card border border-border rounded-xl overflow-hidden">
        {contacts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-border bg-card">
            {contacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                onOpen={() => openModal("active-contact", { contact: contact })}
              />
            ))}
          </div>
        )}
      </section>
      <Pagination
        page={page}
        total_Count={count}
        PageSize={PAGE_SIZE}
        onPageChange={onPageChange}
        totalPages={totalPages}
      />
    </div>
  );
}



function ContactRow({ contact, onOpen }) {
  return (
    <button
      name="open-contact"
      onClick={onOpen}
      className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-color-muted transition"
    >
      <Avatar name={contact.name} />

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-subheading truncate">
          {contact.name}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {contact.email}
        </span>
      </div>

      {contact.company && (
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Building2 className="size-3" />
          <span>{contact.company}</span>
        </div>
      )}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">
      <p className="text-sm text-muted-foreground">
        No contacts yet. Import a CSV or add one manually.
      </p>
    </div>
  );
}


