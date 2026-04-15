import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import DashLoader from './components/DashLoader';

import ConsoleLayout from './pages/ConsoleLayout';

const Console = lazy(() => import("./pages/Console"));

const MembersPage = lazy(() => import("./pages/MembersPage"));

const AuditLogsPage = lazy(() => import("./pages/AuditLogsPage"));

const ImportsPage = lazy(() => import("./pages/ImportsPage"));

const ContactsPage = lazy(() => import("./pages/ContactsPage"));

import InviteSignupform from "./pages/InviteSignupform";

const ImportPreviewPage = lazy(() => import("./pages/ImportsPreview"));

import NotFound from "./pages/NotFound";
function App() {
  
   function LazyConsole({ children }) {
     return <Suspense fallback={<DashLoader />}>{children}</Suspense>;
   }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ConsoleLayout />}>
          <Route
            index
            element={
              <LazyConsole>
                <Console />
              </LazyConsole>
            }
          />

          <Route
            path="members"
            element={
              <LazyConsole>
                <MembersPage />
              </LazyConsole>
            }
          />

          <Route
            path="audit_logs"
            element={
              <LazyConsole>
                <AuditLogsPage />
              </LazyConsole>
            }
          />

          <Route
            path="imports"
            element={
              <LazyConsole>
                <ImportsPage />
              </LazyConsole>
            }
          />
          <Route
            path="imports/preview/:session_id"
            element={<ImportPreviewPage />}
          />
          <Route
            path="contacts"
            element={
              <LazyConsole>
                <ContactsPage />
              </LazyConsole>
            }
          />
        </Route>

        <Route
          path="/invite/:token"
          element={
              <InviteSignupform />
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
