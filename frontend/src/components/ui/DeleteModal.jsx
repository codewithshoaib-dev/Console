import { X } from "lucide-react";


export default function DeleteModal({ text, onDelete, onClose }) {
  
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-background/50">
      <div className="bg-surface rounded-lg shadow-lg w-96 max-w-full p-6 relative">
        <button
          name="close"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-subheading mb-4">
          Confirm Deletion
        </h2>

        <p className="text-heading mb-6">{text}</p>

        <div className="flex justify-end gap-3">
          <button
            name="cancel"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-border text-foreground/80 hover:text-foreground transition"
          >
            Cancel
          </button>
          <button
            name="delete"
            onClick={onDelete}
            className="px-4 py-2 rounded-md bg-destructive/80 text-foreground hover:bg-destructive transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
