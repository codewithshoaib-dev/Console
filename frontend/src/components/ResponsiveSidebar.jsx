import {
  ChevronLeft,
  ChevronRight,
  Users,
  Layers,
  Import,
  X,
  ChevronDown,
  LayoutDashboard,
  Logs,
  Contact,
} from "lucide-react";

import { useWorkspace } from "../stores/useWorkspace";
import { Link, useLocation } from "react-router-dom";

import { useLifecycleStore } from "../stores/useLifeCycle";

import { useRef, useState } from "react";

import WorkspaceSkeleton from "./skeletons/WorkspaceSkeleton";

import { useUIStore } from "../stores/useUIStore";

const HOVER_DELAY = 200;

export default function ResponsiveSidebar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const isOpen = useUIStore((s) => s.isSidebarOpen);
  const onClose = useUIStore((s) => s.closeSidebar);
  const location = useLocation();

  const [workspacesOpen, setWorkspacesOpen] = useState(false);

  const { workspaces, current, isLoading } = useWorkspace();

  const onSwitch = useLifecycleStore((s) => s.switchWorkspace);

  const hoverTimer = useRef(null);

  const expanded = isOpen;

  const isNavItemActive = (path) => {
    const currentPath = location.pathname;

    if (path === "") {
      // Dashboard: match workspace root path
      return (
        currentPath.endsWith(current?.id) || currentPath.split("/").length === 3
      );
    }

    return currentPath.includes(path);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
    fixed inset-y-0 left-0 z-50
    ${expanded ? "w-60" : "w-20"}
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0
    lg:sticky
   border-r border-border bg-background
    flex flex-col
    transition-all duration-300
    custom-scrollbar
  `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {expanded && <span className="text-lg font-semibold">Console</span>}

          <button
            name="sidebar-close"
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-muted"
          >
            <X size={18} />
          </button>

          <button
            name="sidebar-collapse"
            onClick={toggleSidebar}
            className="hidden lg:inline-flex p-2 rounded-md hover:bg-muted"
            aria-pressed={isOpen}
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto  overflow-x-hidden px-2 py-3 space-y-1">
          {/* Workspaces */}
          <button
            name="nav-workspaces"
            onClick={() => expanded && setWorkspacesOpen((v) => !v)}
            className="w-full flex items-center justify-between rounded-xl p-3 text-foreground hover:text-primary/80 hover:bg-muted transition"
          >
            <div className="flex items-center gap-3">
              <Layers size={18} />

              <span
                className={`text-sm font-medium transition-[max-width,opacity] ${
                  expanded ? "max-w-full opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                Workspaces
              </span>
            </div>

            {expanded && (
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  workspacesOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          <div
            className={`
              ml-8 mt-1 space-y-1
              overflow-x-hidden
              transition-[max-height,opacity] duration-300 ease-out
              ${
                workspacesOpen && expanded
                  ? "max-h-64 opacity-100"
                  : "max-h-0 opacity-0 pointer-events-none"
              }
            `}
          >
            {isLoading ? (
              <WorkspaceSkeleton expanded={expanded} />
            ) : (
              workspaces.map((w) => (
                <button
                  key={w.id}
                  name="workspace"
                  onClick={() => {
                    onSwitch(w.id);
                    onClose();
                  }}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm transition-all
                ${
                  current?.id === w.id
                    ? "bg-accent text-accent-foreground font-medium shadow-sm ring-1 ring-accent/40 translate-x-px"
                    : "bg-accent/25 text-accent-foreground/80 hover:bg-accent/40 hover:text-accent-foreground"
                }`}
                >
                  {w.name}
                </button>
              ))
            )}
          </div>

          {/* Other nav items */}
          {[
            { name: "Dashboard", icon: LayoutDashboard, to: "" },
            { name: "Members", icon: Users, to: "members" },
            { name: "Imports", icon: Import, to: "imports" },
            { name: "Contacts", icon: Contact, to: "contacts" },
            { name: "Audit Logs", icon: Logs, to: "audit_logs" },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.to}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              name={`nav-${item.name.toLowerCase()}`}
              className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-200 group relative ${
                isNavItemActive(item.to)
                  ? "bg-primary/10 text-primary font-semibold shadow-sm"
                  : "text-foreground hover:bg-muted hover:text-primary"
              }`}
            >
              {/* Active indicator bar */}
              {isNavItemActive(item.to) && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
              )}

              <item.icon
                size={18}
                color={isNavItemActive(item.to) ? "#8b5cf6" : "currentColor"}
              />
              <span
                className={`whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ${
                  expanded ? "max-w-30 opacity-100" : "max-w-0 opacity-0"
                } text-sm font-medium`}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
