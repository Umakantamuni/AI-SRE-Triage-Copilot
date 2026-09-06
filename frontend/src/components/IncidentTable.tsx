import Icon from "./Icon";
import SeverityBadge from "./SeverityBadge";
import StatusBadge from "./StatusBadge";

export interface IncidentRow {
  incident_id: string;
  title: string;
  service: string;
  environment: string;
  severity: string;
  status: string;
  confidence?: number | null;
  created_at: string;
}

interface IncidentTableProps {
  incidents: IncidentRow[];
  onIncidentClick?: (incidentId: string) => void;
  onViewAll?: () => void;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatConfidence(confidence?: number | null) {
  if (confidence === null || confidence === undefined) {
    return "—";
  }

  return `${Math.round(confidence * 100)}%`;
}

function serviceIcon(service: string) {
  const normalized = service.toLowerCase();

  if (
    normalized.includes("db") ||
    normalized.includes("database") ||
    normalized.includes("postgres") ||
    normalized.includes("mysql")
  ) {
    return "database" as const;
  }

  return "server" as const;
}

export default function IncidentTable({
  incidents,
  onIncidentClick,
  onViewAll,
}: IncidentTableProps) {
  return (
    <section className="panel incident-table-panel">
      <div className="panel-header">
        <div>
          <div className="panel-title">Recent Incidents</div>
          <div className="panel-subtitle">
            Latest production incidents requiring attention
          </div>
        </div>

        <button
          className="text-button"
          onClick={onViewAll}
          type="button"
        >
          View all
          <Icon name="arrow" size={15} />
        </button>
      </div>

      {incidents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon name="shield" size={24} />
          </div>
          <strong>No incidents found</strong>
          <span>
            No incidents are currently available from the SRE API.
          </span>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="incident-table">
            <thead>
              <tr>
                <th>INCIDENT</th>
                <th>SERVICE</th>
                <th>SEVERITY</th>
                <th>STATUS</th>
                <th>AI CONFIDENCE</th>
                <th>CREATED</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {incidents.map((incident) => (
                <tr
                  key={incident.incident_id}
                  className="incident-row"
                  onClick={() =>
                    onIncidentClick?.(incident.incident_id)
                  }
                >
                  <td>
                    <div className="incident-cell">
                      <div className="incident-service-icon">
                        <Icon
                          name={serviceIcon(incident.service)}
                          size={16}
                        />
                      </div>

                      <div className="incident-info">
                        <button
                          type="button"
                          className="incident-id"
                          onClick={(event) => {
                            event.stopPropagation();
                            onIncidentClick?.(
                              incident.incident_id
                            );
                          }}
                        >
                          {incident.incident_id}
                        </button>

                        <span className="incident-title">
                          {incident.title}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="service-cell">
                      <span>{incident.service}</span>
                      <small>{incident.environment}</small>
                    </div>
                  </td>

                  <td>
                    <SeverityBadge severity={incident.severity} />
                  </td>

                  <td>
                    <StatusBadge status={incident.status} />
                  </td>

                  <td>
                    <div className="confidence-cell">
                      <div className="confidence-bar">
                        <div
                          className="confidence-fill"
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(
                                100,
                                (incident.confidence ?? 0) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>

                      <span>
                        {formatConfidence(incident.confidence)}
                      </span>
                    </div>
                  </td>

                  <td>
                    <span className="created-cell">
                      {formatDate(incident.created_at)}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="row-action"
                      title="Open incident"
                      onClick={(event) => {
                        event.stopPropagation();
                        onIncidentClick?.(
                          incident.incident_id
                        );
                      }}
                    >
                      <Icon name="chevron" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}