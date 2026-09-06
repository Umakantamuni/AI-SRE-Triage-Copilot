import { useEffect, useMemo, useState } from "react";
import IncidentTable, {
  type IncidentRow,
} from "../components/IncidentTable";
import Icon from "../components/Icon";
import { getIncidents, type Incident } from "../services/api";

interface IncidentsProps {
  onNavigate: (page: string) => void;
  onIncidentClick: (incidentId: string) => void;
}

export default function Incidents({
  onNavigate,
  onIncidentClick,
}: IncidentsProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [service, setService] = useState("all");

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
          : "Unable to load incidents."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIncidents();
  }, []);

  const serviceOptions = useMemo(() => {
    return Array.from(
      new Set(incidents.map((incident) => incident.service))
    ).sort();
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return incidents
      .filter((incident) => {
        if (severity !== "all" && incident.severity !== severity) {
          return false;
        }

        if (status !== "all" && incident.status !== status) {
          return false;
        }

        if (service !== "all" && incident.service !== service) {
          return false;
        }

        if (!query) {
          return true;
        }

        const searchableText = [
          incident.incident_id,
          incident.title,
          incident.description,
          incident.service,
          incident.environment,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
  }, [incidents, search, severity, status, service]);

  const incidentRows: IncidentRow[] = filteredIncidents.map(
    (incident) => ({
      incident_id: incident.incident_id,
      title: incident.title,
      service: incident.service,
      environment: incident.environment,
      severity: incident.severity,
      status: incident.status,
      confidence: incident.confidence,
      created_at: incident.created_at,
    })
  );

  const hasFilters =
    search.trim() !== "" ||
    severity !== "all" ||
    status !== "all" ||
    service !== "all";

  function clearFilters() {
    setSearch("");
    setSeverity("all");
    setStatus("all");
    setService("all");
  }

  return (
    <div className="incidents-page">
      <div className="incidents-toolbar">
        <div>
          <div className="section-eyebrow">
            INCIDENT MANAGEMENT
          </div>

          <h1>All Incidents</h1>

          <p>
            Monitor, investigate and manage production incidents
            across your services.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={loadIncidents}
            disabled={loading}
          >
            <Icon name="refresh" size={16} />
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => onNavigate("triage")}
          >
            <Icon name="plus" size={16} />
            New Triage
          </button>
        </div>
      </div>

      <section className="panel incident-filters-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">
              Incident Explorer
            </div>

            <div className="panel-subtitle">
              Search and filter incidents by operational attributes
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              className="text-button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="incident-filters">
          <div className="filter-search">
            <Icon name="search" size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search incident, service, title..."
            />
          </div>

          <select
            value={severity}
            onChange={(event) =>
              setSeverity(event.target.value)
            }
            className="filter-select"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">
              Investigating
            </option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={service}
            onChange={(event) =>
              setService(event.target.value)
            }
            className="filter-select"
          >
            <option value="all">All Services</option>

            {serviceOptions.map((serviceName) => (
              <option
                key={serviceName}
                value={serviceName}
              >
                {serviceName}
              </option>
            ))}
          </select>
        </div>

        <div className="incident-results-summary">
          <span>
            Showing{" "}
            <strong>{filteredIncidents.length}</strong>{" "}
            of <strong>{incidents.length}</strong> incidents
          </span>

          {hasFilters && (
            <span className="filter-active-label">
              Filters active
            </span>
          )}
        </div>
      </section>

      {loading ? (
        <section className="panel">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Icon name="refresh" size={24} />
            </div>

            <strong>Loading incidents</strong>

            <span>
              Fetching the latest incident data from the SRE API.
            </span>
          </div>
        </section>
      ) : error ? (
        <section className="panel">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Icon name="alert" size={24} />
            </div>

            <strong>Unable to load incidents</strong>

            <span>{error}</span>

            <button
              type="button"
              className="secondary-button"
              onClick={loadIncidents}
            >
              Retry
            </button>
          </div>
        </section>
      ) : (
        <IncidentTable
          incidents={incidentRows}
          onIncidentClick={onIncidentClick}
        />
      )}
    </div>
  );
}