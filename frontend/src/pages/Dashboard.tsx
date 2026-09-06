import { useEffect, useMemo, useState } from "react";
import IncidentTable, {
  type IncidentRow,
} from "../components/IncidentTable";
import StatCard from "../components/StatCard";
import {
  getIncidents,
  type Incident,
} from "../services/api";

interface DashboardProps {
  onNavigate: (page: string) => void;
  onIncidentClick: (incidentId: string) => void;
}

interface ServiceHealth {
  service: string;
  activeIncidents: number;
  criticalIncidents: number;
  highIncidents: number;
  status: "healthy" | "attention" | "critical";
}

export default function Dashboard({
  onNavigate,
  onIncidentClick,
}: DashboardProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadIncidents() {
    try {
      setLoading(true);
      setError("");

      const data = await getIncidents();
      setIncidents(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load incidents"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncidents();
  }, []);

  /* =========================================================
     INCIDENT STATISTICS
     ========================================================= */

  const stats = useMemo(() => {
    const openIncidents = incidents.filter(
      (incident) =>
        incident.status === "open" ||
        incident.status === "investigating"
    ).length;

    const highSeverity = incidents.filter(
      (incident) =>
        incident.severity === "high"
    ).length;

    const critical = incidents.filter(
      (incident) =>
        incident.severity === "critical"
    ).length;

    const confidenceValues = incidents
      .map((incident) => incident.confidence)
      .filter(
        (value): value is number =>
          value !== null && value !== undefined
      );

    const averageConfidence =
      confidenceValues.length > 0
        ? Math.round(
            (confidenceValues.reduce(
              (sum, value) => sum + value,
              0
            ) /
              confidenceValues.length) *
              100
          )
        : 0;

    return {
      openIncidents,
      highSeverity,
      critical,
      averageConfidence,
    };
  }, [incidents]);

  /* =========================================================
     RECENT INCIDENTS
     ========================================================= */

  const recentIncidents: IncidentRow[] = incidents
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )
    .slice(0, 6)
    .map((incident) => ({
      incident_id: incident.incident_id,
      title: incident.title,
      service: incident.service,
      environment: incident.environment,
      severity: incident.severity,
      status: incident.status,
      confidence: incident.confidence,
      created_at: incident.created_at,
    }));

  /* =========================================================
     INCIDENT TREND
     Last 7 calendar days based on existing incident data
     ========================================================= */

  const incidentTrend = useMemo(() => {
    const days: {
      key: string;
      label: string;
      count: number;
    }[] = [];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(today.getDate() - i);

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      const count = incidents.filter((incident) => {
        const created = new Date(incident.created_at);

        const createdKey = [
          created.getFullYear(),
          String(created.getMonth() + 1).padStart(2, "0"),
          String(created.getDate()).padStart(2, "0"),
        ].join("-");

        return createdKey === key;
      }).length;

      days.push({
        key,
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        count,
      });
    }

    return days;
  }, [incidents]);

  const trendMax = Math.max(
    ...incidentTrend.map((day) => day.count),
    1
  );

  /* =========================================================
     SERVICE HEALTH
     Derived from active incidents only.
     No fake latency/error-rate data.
     ========================================================= */

  const serviceHealth = useMemo<ServiceHealth[]>(() => {
    const serviceMap = new Map<string, ServiceHealth>();

    incidents.forEach((incident) => {
      const serviceName = incident.service?.trim();

      if (!serviceName) {
        return;
      }

      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, {
          service: serviceName,
          activeIncidents: 0,
          criticalIncidents: 0,
          highIncidents: 0,
          status: "healthy",
        });
      }

      const service = serviceMap.get(serviceName)!;

      const isActive =
        incident.status === "open" ||
        incident.status === "investigating";

      if (!isActive) {
        return;
      }

      service.activeIncidents += 1;

      if (incident.severity === "critical") {
        service.criticalIncidents += 1;
      }

      if (incident.severity === "high") {
        service.highIncidents += 1;
      }
    });

    serviceMap.forEach((service) => {
      if (service.criticalIncidents > 0) {
        service.status = "critical";
      } else if (
        service.highIncidents > 0 ||
        service.activeIncidents > 0
      ) {
        service.status = "attention";
      } else {
        service.status = "healthy";
      }
    });

    return Array.from(serviceMap.values())
      .sort((a, b) => {
        const priority = {
          critical: 0,
          attention: 1,
          healthy: 2,
        };

        return priority[a.status] - priority[b.status];
      })
      .slice(0, 5);
  }, [incidents]);

  return (
    <div className="dashboard-page">

      {/* =====================================================
          DASHBOARD HEADER
          ===================================================== */}

      <div className="dashboard-toolbar">
        <div>
          <div className="section-eyebrow">
            PRODUCTION OVERVIEW
          </div>

          <h2 className="page-section-title">
            System Operations
          </h2>

          <p className="page-section-description">
            Monitor active incidents, service health and AI-assisted
            triage activity.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={loadIncidents}
            disabled={loading}
          >
            Refresh
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => onNavigate("triage")}
          >
            + New Triage
          </button>
        </div>
      </div>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="dashboard-error">
          <strong>Unable to load incident data.</strong>
          <span>{error}</span>
        </div>
      )}

      {/* =====================================================
          KPI CARDS
          ===================================================== */}

      <div className="stats-grid">
        <StatCard
          title="Open Incidents"
          value={loading ? "—" : stats.openIncidents}
          description="Active incidents requiring attention"
          icon="incident"
          trend="Live"
          trendType="neutral"
        />

        <StatCard
          title="High Severity"
          value={loading ? "—" : stats.highSeverity}
          description="High-impact incidents currently open"
          icon="activity"
          trend="Monitor"
          trendType="negative"
        />

        <StatCard
          title="Critical"
          value={loading ? "—" : stats.critical}
          description="Critical incidents requiring immediate action"
          icon="shield"
          trend={
            stats.critical > 0
              ? "Attention"
              : "Clear"
          }
          trendType={
            stats.critical > 0
              ? "negative"
              : "positive"
          }
        />

        <StatCard
          title="AI Confidence"
          value={
            loading
              ? "—"
              : `${stats.averageConfidence}%`
          }
          description="Average confidence across triaged incidents"
          icon="triage"
          trend="AI assisted"
          trendType="positive"
        />
      </div>

      {/* =====================================================
          EXISTING INCIDENT + OPERATIONS SECTION
          ===================================================== */}

      <div className="dashboard-main-grid">
        <div className="dashboard-primary-column">
          <IncidentTable
            incidents={recentIncidents}
            onIncidentClick={onIncidentClick}
            onViewAll={() => onNavigate("incidents")}
          />
        </div>

        <aside className="dashboard-side-column">

          {/* OPERATIONS SNAPSHOT */}

          <section className="panel operations-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  Operations Snapshot
                </div>

                <div className="panel-subtitle">
                  Current incident distribution
                </div>
              </div>
            </div>

            <div className="operations-list">

              <div className="operation-item">
                <div className="operation-label">
                  <span className="status-dot online" />
                  Open
                </div>

                <strong>
                  {loading ? "—" : stats.openIncidents}
                </strong>
              </div>

              <div className="operation-item">
                <div className="operation-label">
                  <span className="severity-dot severity-dot-high" />
                  High
                </div>

                <strong>
                  {loading ? "—" : stats.highSeverity}
                </strong>
              </div>

              <div className="operation-item">
                <div className="operation-label">
                  <span className="severity-dot severity-dot-critical" />
                  Critical
                </div>

                <strong>
                  {loading ? "—" : stats.critical}
                </strong>
              </div>

              <div className="operation-item">
                <div className="operation-label">
                  <span className="status-dot online" />
                  AI Coverage
                </div>

                <strong>
                  {loading
                    ? "—"
                    : `${incidents.filter(
                        (incident) =>
                          incident.confidence !== null &&
                          incident.confidence !== undefined
                      ).length}/${incidents.length}`}
                </strong>
              </div>

            </div>
          </section>

          {/* QUICK ACTIONS */}

          <section className="panel quick-actions-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  Quick Actions
                </div>

                <div className="panel-subtitle">
                  Common SRE workflows
                </div>
              </div>
            </div>

            <div className="quick-actions">

              <button
                type="button"
                onClick={() => onNavigate("triage")}
              >
                <span>Run AI Triage</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("runbooks")}
              >
                <span>Browse Runbooks</span>
                <span>→</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate("knowledge")}
              >
                <span>Search Knowledge</span>
                <span>→</span>
              </button>

            </div>
          </section>

        </aside>
      </div>

      {/* =====================================================
          NEW OPERATIONS ANALYTICS
          ===================================================== */}

      <div className="dashboard-analytics-grid">

        {/* ===================================================
            INCIDENT TREND
            =================================================== */}

        <section className="panel analytics-panel">

          <div className="panel-header">
            <div>
              <div className="panel-title">
                Incident Trend
              </div>

              <div className="panel-subtitle">
                Incident activity over the last 7 days
              </div>
            </div>

            <div className="analytics-period">
              7 DAYS
            </div>
          </div>

          <div className="trend-chart">

            <div className="trend-y-axis">
              <span>{trendMax}</span>
              <span>
                {Math.max(Math.ceil(trendMax / 2), 0)}
              </span>
              <span>0</span>
            </div>

            <div className="trend-chart-area">

              <div className="trend-grid-line trend-grid-top" />
              <div className="trend-grid-line trend-grid-middle" />
              <div className="trend-grid-line trend-grid-bottom" />

              <div className="trend-bars">
                {incidentTrend.map((day) => {
                  const height =
                    day.count === 0
                      ? 3
                      : Math.max(
                          (day.count / trendMax) * 100,
                          8
                        );

                  return (
                    <div
                      className="trend-column"
                      key={day.key}
                    >
                      <div className="trend-bar-wrapper">
                        <div
                          className="trend-bar"
                          style={{
                            height: `${height}%`,
                          }}
                          title={`${day.count} incident${
                            day.count === 1 ? "" : "s"
                          }`}
                        >
                          {day.count > 0 && (
                            <span className="trend-bar-value">
                              {day.count}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="trend-label">
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

          <div className="trend-footer">
            <span>
              Total incidents:{" "}
              <strong>{incidents.length}</strong>
            </span>

            <span>
              Active now:{" "}
              <strong>{stats.openIncidents}</strong>
            </span>
          </div>

        </section>

        {/* ===================================================
            SERVICE HEALTH
            =================================================== */}

        <section className="panel analytics-panel">

          <div className="panel-header">
            <div>
              <div className="panel-title">
                Service Health
              </div>

              <div className="panel-subtitle">
                Health derived from active incidents
              </div>
            </div>

            <div className="service-health-indicator">
              <span className="status-dot online" />
              LIVE
            </div>
          </div>

          <div className="service-health-list">

            {loading ? (
              <div className="service-health-empty">
                Loading service health...
              </div>
            ) : serviceHealth.length === 0 ? (
              <div className="service-health-empty">
                <span className="status-dot online" />
                No services reporting incidents
              </div>
            ) : (
              serviceHealth.map((service) => (
                <div
                  className="service-health-row"
                  key={service.service}
                >
                  <div className="service-health-main">

                    <div
                      className={`service-health-status ${service.status}`}
                    >
                      <span />
                    </div>

                    <div className="service-health-info">
                      <div className="service-health-name">
                        {service.service}
                      </div>

                      <div className="service-health-meta">
                        {service.activeIncidents === 0
                          ? "No active incidents"
                          : `${service.activeIncidents} active incident${
                              service.activeIncidents === 1
                                ? ""
                                : "s"
                            }`}
                      </div>
                    </div>

                  </div>

                  <div
                    className={`service-health-label ${service.status}`}
                  >
                    {service.status === "critical"
                      ? "Critical"
                      : service.status === "attention"
                        ? "Attention"
                        : "Healthy"}
                  </div>
                </div>
              ))
            )}

          </div>

          <div className="service-health-footer">
            <span>
              {serviceHealth.length} services monitored
            </span>

            <span>
              Incident-based health
            </span>
          </div>

        </section>

      </div>

    </div>
  );
}