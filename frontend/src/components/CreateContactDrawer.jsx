import { useState , useEffect} from "react";
import { X , UserPlus, Info} from "lucide-react";
import { useUIStore } from "../stores/useUIStore";
import { useContacts } from "../stores/useContacts";

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  required,
  nameAttr,
  type = "text",
}) {
  return (
    <div className="group flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 transition-colors group-focus-within:text-primary">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
      <input
        type={type}
        name={nameAttr}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm ring-offset-background transition-all placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
      />
    </div>
  );
}

export function CreateContactDrawer() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const isSuccess = useUIStore((s) => s.success_true);
  const onClose = useUIStore((s) => s.closeModal);
  
  const onCreate = useContacts((s) => s.create);

  useEffect(() => {
    if (isSuccess) {
      onClose();
      useUIStore.getState().setSuccess(false);
    }
  }, [isSuccess]);

  const canSubmit = name.trim() && email.trim();

  return (
    <div className="absolute inset-0 z-100 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <aside className="sticky top-0 flex h-[90vh] w-full max-w-md flex-col border-l border-border bg-card shadow-2xl animate-slide-in-right">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                New contact
              </h2>
              <p className="text-xs text-muted-foreground">
                Add a Contact Manually
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <form
            className="flex flex-col gap-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <FormField
              label="Full Name"
              required
              value={name}
              onChange={setName}
              placeholder="e.g. Jane Doe"
              nameAttr="contact-name"
            />

            <FormField
              label="Email Address"
              required
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="jane@company.com"
              nameAttr="contact-email"
            />

            <FormField
              label="Company"
              value={company}
              onChange={setCompany}
              placeholder="Acme Inc."
              nameAttr="contact-company"
            />
          </form>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() =>
              onCreate({
                name: name.trim(),
                email: email.trim(),
                company: company.trim() || null,
              })
            }
            className="inline-flex h-9 items-center text-heading justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:grayscale-[0.5] disabled:cursor-default"
          >
            Create contact
          </button>
        </footer>
      </aside>
    </div>
  );
}