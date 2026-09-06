import { useState } from "react";
import Icon from "../components/Icon";

interface SettingsProps {
  onNavigate: (page: string) => void;
}

export default function Settings({
  onNavigate,
}: SettingsProps) {
  const [defaultEnvironment, setDefaultEnvironment] =
    useState("production");

  const [autoRefresh, setAutoRefresh] =
    useState("30");

  const [aiEnabled, setAiEnabled] =
    useState(true);

  const [knowledgeEnabled, setKnowledgeEnabled] =
    useState(true);

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);

  const [saved, setSaved] =
    useState(false);

  function handleSave() {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <div className="settings-page">
      {/* Page Header */}
      <section className="page-hero">
        <div>
          <div className="section-eyebrow">
            PLATFORM CONFIGURATION
          </div>

          <h2>Settings</h2>

          <p>
            Configure AI triage, incident monitoring,
            knowledge retrieval and operational
            preferences.
          </p>
        </div>
      </section>

      {/* Save Notification */}
      {saved && (
        <div className="success-banner">
          <Icon
            name="shield"
            size={18}
          />

          <div>
            <strong>
              Settings saved
            </strong>

            <span>
              Your SRE platform preferences have
              been updated.
            </span>
          </div>
        </div>
      )}

      {/* Platform Status */}
      <section className="panel settings-status-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              Platform Status
            </div>

            <div className="panel-subtitle">
              Current SRE Copilot service configuration
            </div>
          </div>

          <div className="settings-status">
            <span className="status-dot online" />
            Operational
          </div>
        </div>

        <div className="settings-status-grid">
          <div className="settings-status-card">
            <div className="settings-status-icon">
              <Icon
                name="server"
                size={19}
              />
            </div>

            <div>
              <span>Backend API</span>
              <strong>Connected</strong>
            </div>
          </div>

          <div className="settings-status-card">
            <div className="settings-status-icon">
              <Icon
                name="triage"
                size={19}
              />
            </div>

            <div>
              <span>AI Triage</span>
              <strong>Enabled</strong>
            </div>
          </div>

          <div className="settings-status-card">
            <div className="settings-status-icon">
              <Icon
                name="database"
                size={19}
              />
            </div>

            <div>
              <span>Knowledge Store</span>
              <strong>Available</strong>
            </div>
          </div>

          <div className="settings-status-card">
            <div className="settings-status-icon">
              <Icon
                name="activity"
                size={19}
              />
            </div>

            <div>
              <span>System</span>
              <strong>Healthy</strong>
            </div>
          </div>
        </div>
      </section>

      {/* AI Configuration */}
      <section className="panel settings-panel">
        <div className="settings-section-header">
          <div className="settings-section-icon">
            <Icon
              name="triage"
              size={20}
            />
          </div>

          <div>
            <h3>
              AI Triage
            </h3>

            <p>
              Configure AI-assisted incident analysis
              and root cause investigation.
            </p>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <strong>
              Enable AI Triage
            </strong>

            <span>
              Automatically make AI analysis available
              when investigating incidents.
            </span>
          </div>

          <button
            type="button"
            className={`settings-toggle ${
              aiEnabled ? "active" : ""
            }`}
            onClick={() =>
              setAiEnabled(!aiEnabled)
            }
            aria-pressed={aiEnabled}
          >
            <span />
          </button>
        </div>

        <div className="settings-row">
          <div>
            <strong>
              Default Environment
            </strong>

            <span>
              Environment used as the default for new
              incident triage requests.
            </span>
          </div>

          <select
            value={defaultEnvironment}
            onChange={(event) =>
              setDefaultEnvironment(
                event.target.value
              )
            }
            className="settings-select"
          >
            <option value="production">
              Production
            </option>

            <option value="staging">
              Staging
            </option>

            <option value="development">
              Development
            </option>
          </select>
        </div>
      </section>

      {/* Incident Monitoring */}
      <section className="panel settings-panel">
        <div className="settings-section-header">
          <div className="settings-section-icon">
            <Icon
              name="activity"
              size={20}
            />
          </div>

          <div>
            <h3>
              Incident Monitoring
            </h3>

            <p>
              Configure dashboard monitoring and
              refresh behavior.
            </p>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <strong>
              Dashboard Auto Refresh
            </strong>

            <span>
              Automatically refresh incident data at
              the selected interval.
            </span>
          </div>

          <select
            value={autoRefresh}
            onChange={(event) =>
              setAutoRefresh(
                event.target.value
              )
            }
            className="settings-select"
          >
            <option value="15">
              Every 15 seconds
            </option>

            <option value="30">
              Every 30 seconds
            </option>

            <option value="60">
              Every 1 minute
            </option>

            <option value="300">
              Every 5 minutes
            </option>
          </select>
        </div>

        <div className="settings-row">
          <div>
            <strong>
              Notifications
            </strong>

            <span>
              Receive operational notifications for
              important incident activity.
            </span>
          </div>

          <button
            type="button"
            className={`settings-toggle ${
              notificationsEnabled
                ? "active"
                : ""
            }`}
            onClick={() =>
              setNotificationsEnabled(
                !notificationsEnabled
              )
            }
            aria-pressed={
              notificationsEnabled
            }
          >
            <span />
          </button>
        </div>
      </section>

      {/* Knowledge Configuration */}
      <section className="panel settings-panel">
        <div className="settings-section-header">
          <div className="settings-section-icon">
            <Icon
              name="knowledge"
              size={20}
            />
          </div>

          <div>
            <h3>
              Knowledge Retrieval
            </h3>

            <p>
              Configure operational knowledge search
              and retrieval behavior.
            </p>
          </div>
        </div>

        <div className="settings-row">
          <div>
            <strong>
              Knowledge Search
            </strong>

            <span>
              Allow the copilot to retrieve relevant
              incidents, runbooks and operational
              documentation.
            </span>
          </div>

          <button
            type="button"
            className={`settings-toggle ${
              knowledgeEnabled ? "active" : ""
            }`}
            onClick={() =>
              setKnowledgeEnabled(
                !knowledgeEnabled
              )
            }
            aria-pressed={
              knowledgeEnabled
            }
          >
            <span />
          </button>
        </div>

        <div className="settings-row">
          <div>
            <strong>
              Search Strategy
            </strong>

            <span>
              Retrieval mode used by the knowledge
              search service.
            </span>
          </div>

          <div className="settings-value">
            Semantic + Keyword
          </div>
        </div>
      </section>

      {/* Severity Configuration */}
      <section className="panel settings-panel">
        <div className="settings-section-header">
          <div className="settings-section-icon">
            <Icon
              name="incident"
              size={20}
            />
          </div>

          <div>
            <h3>
              Severity Model
            </h3>

            <p>
              Incident severity levels used across the
              SRE platform.
            </p>
          </div>
        </div>

        <div className="severity-settings">
          <div className="severity-setting critical">
            <span className="severity-indicator" />

            <div>
              <strong>
                Critical
              </strong>

              <span>
                Major production impact or service
                outage
              </span>
            </div>
          </div>

          <div className="severity-setting high">
            <span className="severity-indicator" />

            <div>
              <strong>
                High
              </strong>

              <span>
                Significant degradation requiring
                immediate attention
              </span>
            </div>
          </div>

          <div className="severity-setting medium">
            <span className="severity-indicator" />

            <div>
              <strong>
                Medium
              </strong>

              <span>
                Limited impact or degraded functionality
              </span>
            </div>
          </div>

          <div className="severity-setting low">
            <span className="severity-indicator" />

            <div>
              <strong>
                Low
              </strong>

              <span>
                Minor issue with limited operational
                impact
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* System Information */}
      <section className="panel settings-panel">
        <div className="settings-section-header">
          <div className="settings-section-icon">
            <Icon
              name="server"
              size={20}
            />
          </div>

          <div>
            <h3>
              System Information
            </h3>

            <p>
              Application and platform information.
            </p>
          </div>
        </div>

        <div className="system-info-grid">
          <div>
            <span>
              Application
            </span>

            <strong>
              AI SRE Incident Triage Copilot
            </strong>
          </div>

          <div>
            <span>
              Version
            </span>

            <strong>
              1.0.0
            </strong>
          </div>

          <div>
            <span>
              Platform
            </span>

            <strong>
              SRE Operations Console
            </strong>
          </div>

          <div>
            <span>
              AI Engine
            </span>

            <strong>
              Incident Triage Engine
            </strong>
          </div>
        </div>
      </section>

      {/* Footer Actions */}
      <div className="settings-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={() =>
            onNavigate("dashboard")
          }
        >
          Cancel
        </button>

        <button
          type="button"
          className="primary-button"
          onClick={handleSave}
        >
          <Icon
            name="shield"
            size={16}
          />

          Save Settings
        </button>
      </div>
    </div>
  );
}