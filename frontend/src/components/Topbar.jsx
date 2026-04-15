import { Menu, ChevronDown, SquarePlus, ChevronUp, LucideUser2} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import ProfileButton from "./ProfileButton";

import { useUIStore } from "../stores/useUIStore";

import DEMO_ACCOUNTS from "../utils/demoAccounts";

import { useWorkspace } from "../stores/useWorkspace";

export default function Topbar({ handleSwitch }) {
   const [open, setOpen] = useState(false);
     const [activeId, setActiveId] = useState(
       () => localStorage.getItem("demo_account") ?? DEMO_ACCOUNTS[1].id
     );

   const openModal = useUIStore((s) => s.openModal);
   const current = useWorkspace((s) => s.current);
   const toggleSidebar = useUIStore((s) => s.toggleSidebar);
   const ref = useRef(null);

  

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active =
    DEMO_ACCOUNTS.find((a) => a.id === activeId) ?? DEMO_ACCOUNTS[0];


  return (
    <>
      <div className={`bg-transparent transition-colors duration-300 ease-out`}>
        <header
          className={`
        sticky top-0 z-30
        flex items-center
        border border-border
        transition-[height,colors] duration-300 ease-out
        h-18 px-6 bg-background rounded-none shadow-none"
      `}
        >
          <div className="flex items-start gap-3 min-w-0">
            <button
              name="sidebar-toggle"
              aria-label="Toggle Sidebar"
              onClick={toggleSidebar}
              className="lg:hidden mt-0.5 flex size-10 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="flex flex-col min-w-0 gap-1">
              <h1 className="truncate text-sm sm:text-base font-semibold leading-tight text-heading">
                {current.name}
              </h1>

              <div className="relative" ref={ref}>
                <button
                  name="account-switcher"
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-1 text-xs text-foreground/90 hover:text-foreground transition-colors"
                >
                  {active.label}
                  {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {open && (
                  <div className="absolute left-0 mt-3 w-56 rounded-xl border border-border bg-background shadow-lg overflow-hidden z-20">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.id}
                        name={`switch-${acc.id}`}
                        onClick={() => {
                          if (acc.id === activeId) return;
                          setOpen(false);
                          setActiveId(acc.id);
                          handleSwitch(acc);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors"
                      >
                        <span>{acc.label}</span>
                        {acc.id === activeId && (
                          <LucideUser2 size={16} className="text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto pr-1 lg:pr-6">
            <button
              onClick={() => openModal("create-workspace")}
              name="create-workspace"
              aria-label="Create Workspace"
              className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-heading transition-all hover:bg-primary hover:shadow-md active:scale-95"
            >
              <SquarePlus size={16} />
              <span className="hidden md:inline">New</span>
            </button>

            <ThemeToggle />

            <ProfileButton active={active} />
          </div>
        </header>
      </div>
    </>
  );

}
