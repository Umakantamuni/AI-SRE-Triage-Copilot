import Icon from "./Icon";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navigation = [
  {
    label: "Dashboard",
    icon: "dashboard" as const,
    page: "dashboard",
  },
  {
    label: "Incidents",
    icon: "incident" as const,
    page: "incidents",
  },
  {
    label: "AI Triage",
    icon: "triage" as const,
    page: "triage",
  },
  {
    label: "Runbooks",
    icon: "runbook" as const,
    page: "runbooks",
  },
  {
    label: "Knowledge",
    icon: "knowledge" as const,
    page: "knowledge",
  },
];

export default function Sidebar({
  activePage,
  onNavigate,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Icon name="activity" size={21} />
        </div>

        <div>
          <div className="brand-title">
            SRE Triage
          </div>

          <div className="brand-subtitle">
            Copilot
          </div>
        </div>
      </div>

      <div className="sidebar-section-title">
        OPERATIONS
      </div>

      <nav className="sidebar-nav">
        {navigation.map((item) => (
          <button
            key={item.page}
            className={`nav-item ${
              activePage === item.page
                ? "active"
                : ""
            }`}
            onClick={() => onNavigate(item.page)}
          >
            <Icon
              name={item.icon}
              size={19}
            />

            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="environment-card">
        <div className="environment-header">
          <span className="status-dot online" />
          <span>Production</span>
        </div>

        <div className="environment-meta">
          All systems monitored
        </div>
      </div>

      <button
        className={`nav-item ${
          activePage === "settings"
            ? "active"
            : ""
        }`}
        onClick={() => onNavigate("settings")}
      >
        <Icon
          name="settings"
          size={19}
        />

        <span>Settings</span>
      </button>

      <div className="sidebar-footer">
        <div className="version">
          AI SRE v0.1.0
        </div>
      </div>
    </aside>
  );
}