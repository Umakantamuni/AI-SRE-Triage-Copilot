import { useState } from "react";
import Icon from "../components/Icon";
import SeverityBadge from "../components/SeverityBadge";
import {
  createIncident,
  triageIncident,
  type TriageResult,
} from "../services/api";

interface AITriageProps {
  onNavigate: (page: string) => void;
  onIncidentClick: (incidentId: string) => void;
}

type Severity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export default function AITriage({
  onNavigate,
  onIncidentClick,
}: AITriageProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [service, setService] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [severity, setSeverity] =
    useState<Severity>("medium");

  const [symptoms, setSymptoms] = useState("");
  const [logs, setLogs] = useState("");

  const [triageResult, setTriageResult] =
    useState<TriageResult | null>(null);

  const [incidentId, setIncidentId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRunTriage() {
    if (!title.trim()) {
      setError("Incident title is required.");
      return;
    }

    if (!description.trim()) {
      setError("Incident description is required.");
      return;
    }

    if (!service.trim()) {
      setError("Service name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setTriageResult(null);
      setIncidentId(null);

      const createdIncident = await createIncident({
        title: title.trim(),
        description: description.trim(),
        service: service.trim(),
        environment,
        severity,
        symptoms: symptoms
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        logs: logs
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      });

      setIncidentId(createdIncident.incident_id);

      const result = await triageIncident(
        createdIncident.incident_id
      );

      setTriageResult(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to run AI triage."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setTitle("");
    setDescription("");
    setService("");
    setEnvironment("production");
    setSeverity("medium");
    setSymptoms("");
    setLogs("");
    setTriageResult(null);
    setIncidentId(null);
    setError("");
  }

  return (
    <div className="ai-triage-page">
      {/* HEADER */}

      <div className="ai-triage-toolbar">
        <div>
          <div className="section-eyebrow">
            AI OPERATIONS
          </div>

          <h1>AI Incident Triage</h1>

          <p>
            Analyze production incidents using AI-assisted
            severity assessment, root cause analysis and
            recommended remediation.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => onNavigate("incidents")}
          >
            <Icon name="arrow-left" size={16} />
            Incidents
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* MAIN GRID */}

      <div className="ai-triage-grid">
        {/* INPUT PANEL */}

        <section className="panel ai-triage-input-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                Incident Context
              </div>

              <div className="panel-subtitle">
                Provide the operational context required for
                AI analysis.
              </div>
            </div>

            <div className="ai-status-label">
              <span className="status-dot" />
              AI READY
            </div>
          </div>

          <div className="triage-form">
            {/* TITLE */}

            <div className="form-field form-field-full">
              <label htmlFor="incident-title">
                Incident Title
              </label>

              <input
                id="incident-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Production API latency spike"
              />
            </div>

            {/* DESCRIPTION */}

            <div className="form-field form-field-full">
              <label htmlFor="incident-description">
                Description
              </label>

              <textarea
                id="incident-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe what happened, when it started and what users are experiencing..."
                rows={5}
              />
            </div>

            {/* SERVICE */}

            <div className="form-field">
              <label htmlFor="incident-service">
                Service
              </label>

              <input
                id="incident-service"
                type="text"
                value={service}
                onChange={(event) =>
                  setService(event.target.value)
                }
                placeholder="e.g. payment-api"
              />
            </div>

            {/* ENVIRONMENT */}

            <div className="form-field">
              <label htmlFor="incident-environment">
                Environment
              </label>

              <select
                id="incident-environment"
                value={environment}
                onChange={(event) =>
                  setEnvironment(event.target.value)
                }
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

            {/* SEVERITY */}

            <div className="form-field">
              <label htmlFor="incident-severity">
                Initial Severity
              </label>

              <select
                id="incident-severity"
                value={severity}
                onChange={(event) =>
                  setSeverity(
                    event.target.value as Severity
                  )
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">
                  Critical
                </option>
              </select>
            </div>

            {/* SYMPTOMS */}

            <div className="form-field form-field-full">
              <label htmlFor="incident-symptoms">
                Symptoms
              </label>

              <textarea
                id="incident-symptoms"
                value={symptoms}
                onChange={(event) =>
                  setSymptoms(event.target.value)
                }
                placeholder={
                  "Enter one symptom per line\nHigh API latency\nHTTP 5xx errors increased\nDatabase connections exhausted"
                }
                rows={5}
              />

              <span className="field-hint">
                Enter one symptom per line.
              </span>
            </div>

            {/* LOGS */}

            <div className="form-field form-field-full">
              <label htmlFor="incident-logs">
                Logs / Error Messages
              </label>

              <textarea
                id="incident-logs"
                value={logs}
                onChange={(event) =>
                  setLogs(event.target.value)
                }
                placeholder={
                  "Paste relevant log lines or error messages here..."
                }
                rows={8}
              />

              <span className="field-hint">
                Include timestamps, error codes and relevant
                service messages where available.
              </span>
            </div>

            {/* ERROR */}

            {error && (
              <div className="triage-error">
                <Icon name="alert" size={17} />

                <span>{error}</span>
              </div>
            )}

            {/* ACTION */}

            <div className="triage-submit-row">
              <div className="triage-submit-info">
                <strong>Ready for AI analysis?</strong>

                <span>
                  The incident will be created and analyzed by
                  the SRE triage engine.
                </span>
              </div>

              <button
                type="button"
                className="primary-button triage-run-button"
                onClick={handleRunTriage}
                disabled={loading}
              >
                <Icon
                  name={loading ? "refresh" : "sparkles"}
                  size={17}
                />

                {loading
                  ? "Analyzing..."
                  : "Run AI Triage"}
              </button>
            </div>
          </div>
        </section>

        {/* RESULTS */}

        <section className="ai-triage-results">
          {!triageResult && !loading && (
            <div className="panel triage-empty-panel">
              <div className="triage-empty-icon">
                <Icon name="sparkles" size={28} />
              </div>

              <h2>AI Analysis Workspace</h2>

              <p>
                Submit an incident to generate an AI-assisted
                assessment including probable root cause,
                evidence and recommended actions.
              </p>

              <div className="triage-capabilities">
                <div>
                  <Icon name="shield" size={16} />
                  <span>Severity Assessment</span>
                </div>

                <div>
                  <Icon name="search" size={16} />
                  <span>Root Cause Analysis</span>
                </div>

                <div>
                  <Icon name="check" size={16} />
                  <span>Recommended Actions</span>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="panel triage-loading-panel">
              <div className="triage-loading-icon">
                <Icon name="sparkles" size={28} />
              </div>

              <h2>Analyzing Incident</h2>

              <p>
                AI is evaluating the incident context,
                symptoms and logs.
              </p>

              <div className="triage-loading-steps">
                <div className="active">
                  <span />
                  Processing incident context
                </div>

                <div>
                  <span />
                  Evaluating severity
                </div>

                <div>
                  <span />
                  Identifying probable root cause
                </div>

                <div>
                  <span />
                  Generating remediation guidance
                </div>
              </div>
            </div>
          )}

          {triageResult && (
            <>
              {/* RESULT HEADER */}

              <div className="panel triage-result-header">
                <div>
                  <div className="section-eyebrow">
                    AI TRIAGE RESULT
                  </div>

                  <h2>Incident Analysis</h2>

                  {incidentId && (
                    <button
                      type="button"
                      className="incident-id result-incident-id"
                      onClick={() =>
                        onIncidentClick(incidentId)
                      }
                    >
                      {incidentId}
                    </button>
                  )}
                </div>

                <div className="triage-confidence-badge">
                  <span>Confidence</span>

                  <strong>
                    {Math.round(
                      triageResult.confidence * 100
                    )}
                    %
                  </strong>
                </div>
              </div>

              {/* SEVERITY + ROOT CAUSE */}

              <div className="triage-result-grid">
                <div className="panel triage-severity-panel">
                  <div className="panel-title">
                    Assessed Severity
                  </div>

                  <div className="triage-severity-value">
                    <SeverityBadge
                      severity={triageResult.severity}
                    />
                  </div>

                  <p>
                    {triageResult.severity_reason}
                  </p>
                </div>

                <div className="panel root-cause-panel">
                  <div className="panel-title">
                    Probable Root Cause
                  </div>

                  <div className="root-cause-status">
                    AI assessment
                  </div>

                  <div className="root-cause-content">
                    {triageResult.probable_root_cause}
                  </div>
                </div>
              </div>

              {/* SUMMARY */}

              <div className="panel incident-summary-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">
                      Incident Summary
                    </div>

                    <div className="panel-subtitle">
                      AI-generated operational summary
                    </div>
                  </div>
                </div>

                <div className="incident-summary-content">
                  {triageResult.incident_summary}
                </div>
              </div>

              {/* EVIDENCE */}

              <div className="panel triage-list-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">
                      Evidence
                    </div>

                    <div className="panel-subtitle">
                      Signals supporting the AI assessment
                    </div>
                  </div>
                </div>

                {triageResult.evidence.length === 0 ? (
                  <div className="detail-empty">
                    No supporting evidence returned.
                  </div>
                ) : (
                  <ol className="detail-list ordered">
                    {triageResult.evidence.map(
                      (item, index) => (
                        <li key={`${item}-${index}`}>
                          <span className="evidence-number">
                            {index + 1}
                          </span>

                          <span>{item}</span>
                        </li>
                      )
                    )}
                  </ol>
                )}
              </div>

              {/* RECOMMENDED ACTIONS */}

              <div className="panel triage-list-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">
                      Recommended Actions
                    </div>

                    <div className="panel-subtitle">
                      Suggested actions for the incident
                      commander
                    </div>
                  </div>
                </div>

                {triageResult.recommended_actions
                  .length === 0 ? (
                  <div className="detail-empty">
                    No recommended actions returned.
                  </div>
                ) : (
                  <ol className="detail-list ordered">
                    {triageResult.recommended_actions.map(
                      (item, index) => (
                        <li key={`${item}-${index}`}>
                          <span className="action-number">
                            {index + 1}
                          </span>

                          <span>{item}</span>
                        </li>
                      )
                    )}
                  </ol>
                )}
              </div>

              {/* RESOLUTION */}

              <div className="panel triage-list-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">
                      Resolution Steps
                    </div>

                    <div className="panel-subtitle">
                      Suggested recovery sequence
                    </div>
                  </div>
                </div>

                {triageResult.resolution_steps
                  .length === 0 ? (
                  <div className="detail-empty">
                    No resolution steps returned.
                  </div>
                ) : (
                  <ol className="detail-list ordered">
                    {triageResult.resolution_steps.map(
                      (item, index) => (
                        <li key={`${item}-${index}`}>
                          <span className="action-number">
                            {index + 1}
                          </span>

                          <span>{item}</span>
                        </li>
                      )
                    )}
                  </ol>
                )}
              </div>

              {/* CONFIDENCE */}

              <div className="panel confidence-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-title">
                      AI Confidence
                    </div>

                    <div className="panel-subtitle">
                      Confidence score returned by the triage
                      engine
                    </div>
                  </div>

                  <strong className="detail-confidence-value">
                    {Math.round(
                      triageResult.confidence * 100
                    )}
                    %
                  </strong>
                </div>

                <div className="detail-confidence">
                  <div className="detail-confidence-bar">
                    <div
                      className="detail-confidence-fill"
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            triageResult.confidence * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* OPEN INCIDENT */}

              {incidentId && (
                <div className="triage-final-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      onIncidentClick(incidentId)
                    }
                  >
                    Open Full Incident
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    onClick={handleReset}
                  >
                    Start New Triage
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}