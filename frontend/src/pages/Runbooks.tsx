import { useMemo, useState } from "react";
import Icon from "../components/Icon";

interface RunbooksProps {
  onNavigate: (page: string) => void;
}

interface Runbook {
  id: string;
  title: string;
  description: string;
  service: string;
  category: string;
  severity: string;
  steps: string[];
}

const runbooks: Runbook[] = [
  {
    id: "RB-001",
    title: "API High Latency",
    description:
      "Investigate and recover services experiencing elevated API response latency.",
    service: "API Gateway",
    category: "Performance",
    severity: "High",
    steps: [
      "Check API latency and request rate metrics.",
      "Identify affected endpoints.",
      "Check downstream service latency.",
      "Review application and gateway logs.",
      "Validate database response time.",
      "Scale affected service if required.",
      "Verify latency has returned to normal.",
    ],
  },
  {
    id: "RB-002",
    title: "HTTP 5xx Error Spike",
    description:
      "Investigate sudden increases in HTTP 5xx responses from production services.",
    service: "Application",
    category: "Availability",
    severity: "Critical",
    steps: [
      "Confirm the 5xx spike in monitoring.",
      "Identify affected service and endpoints.",
      "Inspect recent deployments.",
      "Review application error logs.",
      "Check dependency and database health.",
      "Rollback deployment if a release is responsible.",
      "Confirm error rate has stabilized.",
    ],
  },
  {
    id: "RB-003",
    title: "Database Connection Exhaustion",
    description:
      "Recover production database services when connection pools are exhausted.",
    service: "PostgreSQL",
    category: "Database",
    severity: "Critical",
    steps: [
      "Check active database connections.",
      "Identify connection-heavy applications.",
      "Review connection pool configuration.",
      "Check for long-running queries.",
      "Terminate confirmed stale sessions if required.",
      "Scale database resources when appropriate.",
      "Verify application connectivity.",
    ],
  },
  {
    id: "RB-004",
    title: "Service Unavailable",
    description:
      "Troubleshoot a production service that is unavailable or failing health checks.",
    service: "Kubernetes",
    category: "Availability",
    severity: "Critical",
    steps: [
      "Check service health and availability.",
      "Inspect pod and container status.",
      "Review recent deployment activity.",
      "Inspect container logs.",
      "Check resource exhaustion.",
      "Restart or rollback affected workloads.",
      "Verify health checks and traffic recovery.",
    ],
  },
  {
    id: "RB-005",
    title: "Deployment Failure",
    description:
      "Investigate and recover a failed production application deployment.",
    service: "CI/CD",
    category: "Deployment",
    severity: "High",
    steps: [
      "Review deployment pipeline logs.",
      "Identify the failed deployment stage.",
      "Check image and artifact availability.",
      "Validate configuration and secrets.",
      "Compare with the previous successful deployment.",
      "Rollback when necessary.",
      "Verify application health after recovery.",
    ],
  },
];

export default function Runbooks({
  onNavigate,
}: RunbooksProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [service, setService] = useState("all");
  const [selectedRunbook, setSelectedRunbook] =
    useState<Runbook | null>(null);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(runbooks.map((runbook) => runbook.category))
      ).sort(),
    []
  );

  const services = useMemo(
    () =>
      Array.from(
        new Set(runbooks.map((runbook) => runbook.service))
      ).sort(),
    []
  );

  const filteredRunbooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return runbooks.filter((runbook) => {
      if (
        category !== "all" &&
        runbook.category !== category
      ) {
        return false;
      }

      if (
        service !== "all" &&
        runbook.service !== service
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        runbook.id,
        runbook.title,
        runbook.description,
        runbook.service,
        runbook.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [search, category, service]);

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setService("all");
  }

  if (selectedRunbook) {
    return (
      <div className="runbooks-page">
        <div className="runbooks-toolbar">
          <div>
            <div className="section-eyebrow">
              OPERATIONAL RUNBOOK
            </div>

            <h1>{selectedRunbook.title}</h1>

            <p>{selectedRunbook.description}</p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() => setSelectedRunbook(null)}
          >
            <Icon name="arrow-left" size={16} />
            Back to Runbooks
          </button>
        </div>

        <div className="runbook-detail-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  Runbook Overview
                </div>

                <div className="panel-subtitle">
                  Operational recovery guidance
                </div>
              </div>
            </div>

            <div className="runbook-meta-grid">
              <div className="runbook-meta-item">
                <span>RUNBOOK ID</span>
                <strong>{selectedRunbook.id}</strong>
              </div>

              <div className="runbook-meta-item">
                <span>SERVICE</span>
                <strong>{selectedRunbook.service}</strong>
              </div>

              <div className="runbook-meta-item">
                <span>CATEGORY</span>
                <strong>{selectedRunbook.category}</strong>
              </div>

              <div className="runbook-meta-item">
                <span>SEVERITY</span>
                <strong>{selectedRunbook.severity}</strong>
              </div>
            </div>
          </section>

          <section className="panel runbook-steps-panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  Recovery Procedure
                </div>

                <div className="panel-subtitle">
                  Follow the steps in sequence
                </div>
              </div>
            </div>

            <ol className="runbook-steps">
              {selectedRunbook.steps.map(
                (step, index) => (
                  <li key={`${step}-${index}`}>
                    <span className="runbook-step-number">
                      {index + 1}
                    </span>

                    <div>
                      <strong>
                        Step {index + 1}
                      </strong>

                      <p>{step}</p>
                    </div>
                  </li>
                )
              )}
            </ol>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">
                  Verification
                </div>

                <div className="panel-subtitle">
                  Confirm service recovery before closing
                  the incident
                </div>
              </div>
            </div>

            <div className="runbook-verification">
              <div>
                <Icon name="check" size={18} />
                <span>
                  Confirm service health checks are passing.
                </span>
              </div>

              <div>
                <Icon name="check" size={18} />
                <span>
                  Confirm error rate has returned to normal.
                </span>
              </div>

              <div>
                <Icon name="check" size={18} />
                <span>
                  Confirm latency and throughput are stable.
                </span>
              </div>

              <div>
                <Icon name="check" size={18} />
                <span>
                  Document actions taken during recovery.
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="runbooks-page">
      <div className="runbooks-toolbar">
        <div>
          <div className="section-eyebrow">
            OPERATIONS
          </div>

          <h1>Runbooks</h1>

          <p>
            Operational procedures for investigation,
            recovery and service verification.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => onNavigate("incidents")}
        >
          <Icon name="arrow-left" size={16} />
          Incidents
        </button>
      </div>

      <section className="panel runbook-filter-panel">
        <div className="incident-filters">
          <div className="filter-search">
            <Icon name="search" size={17} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search runbooks..."
            />
          </div>

          <select
            className="filter-select"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            <option value="all">
              All Categories
            </option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={service}
            onChange={(event) =>
              setService(event.target.value)
            }
          >
            <option value="all">
              All Services
            </option>

            {services.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          {(search ||
            category !== "all" ||
            service !== "all") && (
            <button
              type="button"
              className="text-button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="incident-results-summary">
          <span>
            <strong>
              {filteredRunbooks.length}
            </strong>{" "}
            runbooks available
          </span>
        </div>
      </section>

      <section className="runbook-grid">
        {filteredRunbooks.map((runbook) => (
          <article
            key={runbook.id}
            className="panel runbook-card"
          >
            <div className="runbook-card-top">
              <span className="runbook-id">
                {runbook.id}
              </span>

              <span className="runbook-severity">
                {runbook.severity}
              </span>
            </div>

            <h2>{runbook.title}</h2>

            <p>{runbook.description}</p>

            <div className="runbook-card-meta">
              <span>{runbook.service}</span>
              <span>{runbook.category}</span>
            </div>

            <button
              type="button"
              className="text-button runbook-open-button"
              onClick={() =>
                setSelectedRunbook(runbook)
              }
            >
              Open Runbook
              <Icon name="arrow" size={15} />
            </button>
          </article>
        ))}

        {filteredRunbooks.length === 0 && (
          <div className="panel">
            <div className="empty-state">
              <div className="empty-state-icon">
                <Icon name="search" size={24} />
              </div>

              <strong>
                No runbooks found
              </strong>

              <span>
                Try changing your search or filters.
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}