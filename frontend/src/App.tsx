import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import IncidentDetail from "./pages/IncidentDetail";
import AITriage from "./pages/AITriage";
import Runbooks from "./pages/Runbooks";
import Knowledge from "./pages/Knowledge";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

import {
  getHealth,
  isAuthenticated,
  logout,
} from "./services/api";


const pageMeta: Record<
  string,
  {
    title: string;
    subtitle: string;
  }
> = {
  dashboard: {
    title: "Dashboard",
    subtitle:
      "Enterprise SRE incident operations console",
  },

  incidents: {
    title: "Incidents",
    subtitle:
      "Monitor and investigate production incidents",
  },

  triage: {
    title: "AI Triage",
    subtitle:
      "AI-assisted incident analysis and root cause investigation",
  },

  runbooks: {
    title: "Runbooks",
    subtitle:
      "Operational procedures and recovery guidance",
  },

  knowledge: {
    title: "Knowledge",
    subtitle:
      "Search incidents, runbooks and operational knowledge",
  },

  settings: {
    title: "Settings",
    subtitle:
      "SRE platform configuration",
  },

  incidentDetail: {
    title: "Incident Detail",
    subtitle:
      "Incident investigation and AI analysis",
  },
};


function App() {
  const [activePage, setActivePage] =
    useState("dashboard");

  const [selectedIncidentId, setSelectedIncidentId] =
    useState<string | null>(null);

  const [backendOnline, setBackendOnline] =
    useState(false);

  const [authenticated, setAuthenticated] =
    useState(isAuthenticated());


  async function checkBackend() {
    try {
      await getHealth();
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  }


  useEffect(() => {
    if (!authenticated) {
      return;
    }

    checkBackend();

    const interval = window.setInterval(
      checkBackend,
      30000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [authenticated]);


  useEffect(() => {
    function handleAuthExpired() {
      setAuthenticated(false);
      setActivePage("dashboard");
      setSelectedIncidentId(null);
    }

    function handleLogout() {
      setAuthenticated(false);
      setActivePage("dashboard");
      setSelectedIncidentId(null);
    }

    window.addEventListener(
      "auth-expired",
      handleAuthExpired
    );

    window.addEventListener(
      "auth-logout",
      handleLogout
    );

    return () => {
      window.removeEventListener(
        "auth-expired",
        handleAuthExpired
      );

      window.removeEventListener(
        "auth-logout",
        handleLogout
      );
    };
  }, []);


  function handleLogin() {
    setAuthenticated(true);
    setActivePage("dashboard");
  }


  function handleLogout() {
    logout();
  }


  function handleNavigate(page: string) {
    setActivePage(page);
  }


  function handleIncidentClick(
    incidentId: string
  ) {
    setSelectedIncidentId(incidentId);
    setActivePage("incidentDetail");
  }


  function handleBackFromIncident() {
    setSelectedIncidentId(null);
    setActivePage("dashboard");
  }


  if (!authenticated) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }


  function renderPage() {
    switch (activePage) {

      case "dashboard":
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onIncidentClick={handleIncidentClick}
          />
        );


      case "incidents":
        return (
          <Incidents
            onNavigate={handleNavigate}
            onIncidentClick={handleIncidentClick}
          />
        );


      case "triage":
        return (
          <AITriage
            onNavigate={handleNavigate}
            onIncidentClick={handleIncidentClick}
          />
        );


      case "runbooks":
        return (
          <Runbooks
            onNavigate={handleNavigate}
          />
        );


      case "knowledge":
        return (
          <Knowledge
            onNavigate={handleNavigate}
          />
        );


      case "settings":
        return (
          <Settings
            onNavigate={handleNavigate}
          />
        );


      case "incidentDetail":

        if (!selectedIncidentId) {
          return (
            <div className="placeholder-page">
              <div className="placeholder-card">

                <div className="section-eyebrow">
                  INVESTIGATION
                </div>

                <h2>
                  No Incident Selected
                </h2>

                <p>
                  Select an incident from the
                  dashboard to begin investigation.
                </p>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setActivePage("dashboard")
                  }
                >
                  Back to Dashboard
                </button>

              </div>
            </div>
          );
        }


        return (
          <IncidentDetail
            incidentId={selectedIncidentId}
            onBack={handleBackFromIncident}
          />
        );


      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onIncidentClick={handleIncidentClick}
          />
        );
    }
  }


  const meta =
    pageMeta[activePage] ??
    pageMeta.dashboard;


  return (
    <div className="app-shell">

      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      <main className="main-content">

        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          backendOnline={backendOnline}
          onRefresh={checkBackend}
          onNavigate={handleNavigate}
        />

        <div className="page-content">
          {renderPage()}
        </div>

      </main>

    </div>
  );
}


export default App;