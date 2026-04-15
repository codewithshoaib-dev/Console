import { Outlet } from "react-router-dom";
import ResponsiveSidebar from "../components/ResponsiveSidebar";
import Topbar from "../components/Topbar";
import {  useEffect, } from "react";

import { CreateContactDrawer } from "../components/CreateContactDrawer";
import { ContactDrawer } from "../components/ContactDrawer";

import { useUIStore } from "../stores/useUIStore";
import { handleAxiosError } from "../utils/handleAxiosError";

import { CreateWorkspaceModal } from "../components/CreateWorkspaceModal";

import { useLifecycleStore } from "../stores/useLifeCycle";
import DEMO_ACCOUNTS from "../utils/demoAccounts";

import ErrorScreen from "../components/ErrorScreen";

import DashLoader from "../components/DashLoader";

import ToastContainer  from "../components/Toast";

import InviteModal from "../components/InviteModal";

export default function ConsoleLayout() {
 
   const { modal, closeModal } = useUIStore();

     const establishSession = useLifecycleStore((s) => s.establishSession);

     const sessionStatus = useLifecycleStore((s) => s.sessionStatus);
     const error = useLifecycleStore((s) => s.error)

    function login() {
      const acc_id = localStorage.getItem("demo_account");
      const acc = DEMO_ACCOUNTS.find(acc => acc.id === acc_id) || DEMO_ACCOUNTS[1]
      establishSession({ username: acc.username, password: acc.password });
    }

 useEffect(() => {
      login()
      }, []);

      const handleSwitch = async (acc) => {
        establishSession({ username: acc.username, password: acc.password });
        localStorage.setItem("demo_account", acc.id);
      };


if (sessionStatus === "error"){
  return <ErrorScreen error={handleAxiosError(error)} onRetry={() => login()} />;
}

if (sessionStatus !== "ready") {
  return <DashLoader sessionStatus={sessionStatus} />;
}
  return (
    <div className="flex h-svh bg-background text-foreground">
      <ResponsiveSidebar />

      <main className="flex-1 flex flex-col">
        <Topbar handleSwitch={handleSwitch} />
        <div id="scroll-container" className="flex-1 overflow-y-auto relative grid custom-scrollbar">
          <ToastContainer />
          <div
            className={`grid-in-cell relative z-10 ${
              modal === null ? "pointer-events-none" : " "
            }`}
          >
            {modal?.type === "invite-member" && <InviteModal />}
            {modal?.type === "create-contact" && <CreateContactDrawer />}
            {modal?.type === "active-contact" && <ContactDrawer />}
            {modal?.type === "create-workspace" && (
              <CreateWorkspaceModal onClose={closeModal} />
            )}
          </div>
          <div className="grid-in-cell">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
