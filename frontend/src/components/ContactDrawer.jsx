import { useState, useEffect } from "react";
import { X, Mail, Building2, Trash2, Edit3, Calendar } from "lucide-react";
import Avatar from "./Avatar";
import formatTime from "../utils/formatTime";
import { useUIStore } from "..//stores/useUIStore";
import { useContacts } from "../stores/useContacts";
import DeleteModal from "./ui/DeleteModal";

function DetailRow({ icon, label, value, isEditing, onChange, name }) {
  if (!value && !isEditing) return null;

  return (
    <div className="group flex flex-col gap-1 rounded-lg p-2 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {icon}
        {label}
      </div>
      <div className="pl-6">
        {isEditing ? (
          <input
            name={name}
            value={value || ""}
            onChange={onChange}
            className="w-full bg-transparent text-sm font-medium text-foreground border-b border-border focus:outline-none focus:border-primary"
          />
        ) : (
          <div className="text-sm font-medium text-foreground break-all">
            {value}
          </div>
        )}
      </div>
    </div>
  );
}

export function ContactDrawer() {
  const contact = useUIStore((s) => s.modal?.payload.contact);
  const onClose = useUIStore((s) => s.closeModal);
  const isSuccess = useUIStore((s) => s.success_true);
  const onDelete = useContacts((s) => s.delete);
  const onUpdate = useContacts((s) => s.update);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(contact);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDeleteModal = (id) => {
    setSelectedContactId(id);
    setIsModalOpen(true);
  };

  useEffect(() => {
    setForm(contact);
    setIsEditing(false);
  }, [contact]);

  useEffect(() => {
    if (isSuccess) {
      onClose();
      useUIStore.getState().setSuccess(false);
    }
  }, [isSuccess]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onUpdate(form.id, form);
    setIsEditing(false);
  };

  if (!contact) return null;

  return (
    <>
       {isModalOpen && (
            <DeleteModal
              text="Are you sure you want to reject this contact?"
              onDelete={() => {
                onDelete(selectedContactId);
                setIsModalOpen(false);
              }}
              onClose={() => setIsModalOpen(false)}
            />
          )}
    <div className="absolute inset-0 z-100 flex justify-end">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="sticky top-0 h-[90vh] w-full max-w-sm border-l border-border bg-card shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-border p-6">
          <div className="flex items-start justify-between">
            <Avatar
              name={contact.name}
              large
              className="ring-2 ring-border ring-offset-2 ring-offset-background"
            />
            <div className="flex gap-1">
              <button
                onClick={onClose}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          <div>
            {isEditing ? (
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                className="w-full text-xl font-bold tracking-tight text-foreground border-b border-border focus:outline-none focus:border-primary"
              />
            ) : (
              <h2 className="text-xl font-bold tracking-tight text-foreground leading-tight">
                {contact.name}
              </h2>
            )}
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Contact
            </span>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  name="save"
                  onClick={handleSave}
                  className="flex-1 rounded-md bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold"
                >
                  Save
                </button>
                <button
                  name="cancel"
                  onClick={() => {
                    setForm(contact);
                    setIsEditing(false);
                  }}
                  className="flex-1 rounded-md border border-border px-3 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                name="edit"
                onClick={() => setIsEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-muted"
              >
                <Edit3 className="size-3.5" />
                Edit Profile
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="space-y-1">
            <DetailRow
              icon={<Mail className="size-3.5" />}
              label="Email Address"
              name="email"
              value={form.email}
              isEditing={isEditing}
              onChange={handleChange}
            />
            <DetailRow
              icon={<Building2 className="size-3.5" />}
              label="Company / Organization"
              name="company"
              value={form.company}
              isEditing={isEditing}
              onChange={handleChange}
            />
          </div>

          <div className="mt-auto border-t border-border/50 pt-4 px-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Calendar className="size-3" />
              <span>Added on {formatTime(contact.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border p-4 bg-muted/30">
          <button
            name="delete"
            onClick={() => openDeleteModal(contact.id)}
            className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="size-4" />
            DELETE CONTACT
          </button>
        </footer>
      </div>
    </div>
    </>
  );
}
