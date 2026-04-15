import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useUIStore } from "../stores/useUIStore";
export default function ProfileButton({ active }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { addToast } = useUIStore();

  // Close the panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref]);

  return (
    <div className="relative" ref={ref}>
      <button
        name="account-info"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center rounded-full bg-card p-1 hover:bg-card/80 transition-colors"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-accent/30 text-[10px] font-bold text-accent uppercase">
          {active.label.charAt(0)}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-4 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-accent/30 text-sm font-bold text-accent uppercase">
                {active.label.charAt(0)}
              </div>
              <div>
                <p className="text-heading font-semibold">{active.label}</p>
                <p className="text-muted text-xs">{active.email}</p>
              </div>
            </div>

            <hr className="border-border/50 my-2" />

            <Link
              onClick={() => addToast({ message: "Not Implemented!" })}
              className="px-3 py-2 rounded-lg hover:bg-accent/10 text-sm font-medium transition-colors"
            >
              Account Settings
            </Link>

            <Link
              onClick={() => addToast({ message: "Not Implemented!" })}
              className="px-3 py-2 rounded-lg hover:bg-accent/10 text-sm font-medium transition-colors"
            >
              View Profile
            </Link>

            <button
              onClick={() => addToast({ message: "Can't Logout in Demo!" })}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm font-medium text-red-500 transition-colors"
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
