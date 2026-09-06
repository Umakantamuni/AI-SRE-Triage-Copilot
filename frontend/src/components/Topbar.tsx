import { useEffect, useRef, useState } from "react";
import { logout } from "../services/api";

interface TopbarProps {
  title: string;
  subtitle: string;
  backendOnline: boolean;
  onRefresh: () => void;
  onNavigate?: (page: string) => void;
}

function getUserFromToken(): {
  username: string;
  role: string;
} {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return {
      username: "User",
      role: "Viewer",
    };
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    return {
      username:
        payload.username ||
        payload.sub ||
        "User",

      role:
        payload.role ||
        "Viewer",
    };
  } catch {
    return {
      username: "User",
      role: "Viewer",
    };
  }
}

function formatRole(role: string): string {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

export default function Topbar({
  title,
  subtitle,
  backendOnline,
  onRefresh,
  onNavigate,
}: TopbarProps) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [user, setUser] = useState(
    getUserFromToken()
  );

  const menuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleStorageChange() {
      setUser(getUserFromToken());
    }

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function handleLogout() {
    setMenuOpen(false);
    logout();
  }

  function handleSettings() {
    setMenuOpen(false);

    if (onNavigate) {
      onNavigate("settings");
    }
  }

  const displayName =
    user.username === "1"
      ? "SRE Admin"
      : user.username;

  const initials =
    displayName
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") || "U";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <h1 className="topbar-title">
            {title}
          </h1>

          <p className="topbar-subtitle">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="topbar-right">
        <div className="backend-status">
          <span
            className={`status-dot ${
              backendOnline
                ? "status-online"
                : "status-offline"
            }`}
          />

          <span>
            {backendOnline
              ? "Backend Online"
              : "Backend Offline"}
          </span>
        </div>

        <button
          type="button"
          className="topbar-refresh"
          onClick={onRefresh}
          title="Refresh backend status"
        >
          ↻
        </button>

        <div
          className="user-menu-container"
          ref={menuRef}
        >
          <button
            type="button"
            className="user-menu-trigger"
            onClick={() =>
              setMenuOpen((open) => !open)
            }
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <div className="user-avatar">
              {initials}
            </div>

            <div className="user-info">
              <span className="user-name">
                {displayName}
              </span>

              <span className="user-role">
                {formatRole(user.role)}
              </span>
            </div>

            <span
              className={`user-chevron ${
                menuOpen
                  ? "user-chevron-open"
                  : ""
              }`}
            >
              ▾
            </span>
          </button>

          {menuOpen && (
            <div
              className="user-dropdown"
              role="menu"
            >
              <div className="dropdown-user-header">
                <div className="dropdown-avatar">
                  {initials}
                </div>

                <div>
                  <div className="dropdown-user-name">
                    {displayName}
                  </div>

                  <div className="dropdown-user-role">
                    {formatRole(user.role)}
                  </div>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item"
                onClick={handleSettings}
                role="menuitem"
              >
                <span className="dropdown-icon">
                  ⚙
                </span>

                <span>Settings</span>
              </button>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item dropdown-logout"
                onClick={handleLogout}
                role="menuitem"
              >
                <span className="dropdown-icon">
                  ↪
                </span>

                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}