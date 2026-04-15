import { useState } from "react";
import { useMembers } from "../stores/useMembers";
export function EditMemberModal({ member, onClose }) {
  const [role, setRole] = useState(member.role);

  const onUpdate = useMembers((s) => s.update)

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 z-10 bg-background/40"
        onClick={onClose}
      />
      <div className="bg-card border z-20 border-border rounded-xl w-full max-w-md p-6 space-y-5">
        <div>
          <h2 className="text-heading font-semibold">Edit Member</h2>
          <p className="text-sm text-foreground/70">{member.username}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            name="cancel-edit-member"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted"
          >
            Cancel
          </button>

          <button
            onClick={() => {
                if (role !== member.role) {
                    onUpdate(member.id, role);
                }
                onClose()
            }
                }
            name="save-edit-member"
            className="px-4 py-2 text-sm rounded-lg bg-primary text-foreground hover:bg-primary/90"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
