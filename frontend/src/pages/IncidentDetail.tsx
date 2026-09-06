import { useEffect, useState } from "react";

import SeverityBadge from "../components/SeverityBadge";
import StatusBadge from "../components/StatusBadge";

import {
  getIncident,
  triageIncident,
  resolveIncident,
  closeIncident,
  type Incident,
  type TriageResult,
  type ResolveIncidentPayload,
  type CloseIncidentPayload,
} from "../services/api";

interface IncidentDetailProps {
  incidentId: string;
  onBack: () => void;
}

export default function IncidentDetail({
  incidentId,
  onBack,
}: IncidentDetailProps) {
  const [incident, setIncident] =
    useState<Incident | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [triageLoading, setTriageLoading] =
    useState(false);

  const [resolveLoading, setResolveLoading] =
    useState(false);

  const [closeLoading, setCloseLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [triageResult, setTriageResult] =
    useState<TriageResult | null>(null);

  // Resolve form
  const [showResolveForm, setShowResolveForm] =
    useState(false);

  const [
    resolutionSummary,
    setResolutionSummary,
  ] = useState("");

  const [
    finalRootCause,
    setFinalRootCause,
  ] = useState("");

  const [
    customerImpact,
    setCustomerImpact,
  ] = useState("");

  const [
    preventiveActions,
    setPreventiveActions,
  ] = useState("");

  const [
    resolutionRemarks,
    setResolutionRemarks,
  ] = useState("");

  // Close form
  const [showCloseForm, setShowCloseForm] =
    useState(false);

  const [
    closeRootCause,
    setCloseRootCause,
  ] = useState("");

  const [finalVerdict, setFinalVerdict] =
    useState("");

  const [closureRemarks, setClosureRemarks] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadIncident() {
      try {
        setLoading(true);
        setError("");

        const data =
          await getIncident(incidentId);

        if (mounted) {
          setIncident(data);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load incident."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadIncident();

    return () => {
      mounted = false;
    };
  }, [incidentId]);

  async function handleRunTriage() {
    if (!incident) {
      return;
    }

    try {
      setTriageLoading(true);
      setError("");
      setTriageResult(null);

      const result =
        await triageIncident(
          incident.incident_id
        );

      setTriageResult(result);

      setIncident(
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,

            severity:
              result.severity,

            severity_reason:
              result.severity_reason,

            status:
              "investigating",

            probable_root_cause:
              result.probable_root_cause,

            confidence:
              result.confidence,

            evidence:
              result.evidence,

            recommended_actions:
              result.recommended_actions,

            resolution_steps:
              result.resolution_steps,

            incident_summary:
              result.incident_summary,

            updated_at:
              new Date().toISOString(),
          };
        }
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to run AI triage."
      );
    } finally {
      setTriageLoading(false);
    }
  }

  function openResolveForm() {
    if (!incident) {
      return;
    }

    setError("");

    setFinalRootCause(
      incident.probable_root_cause || ""
    );

    setResolutionSummary("");

    setCustomerImpact("");

    setPreventiveActions("");

    setResolutionRemarks("");

    setShowResolveForm(true);
  }

  function closeResolveForm() {
    if (resolveLoading) {
      return;
    }

    setShowResolveForm(false);
  }

  async function handleResolveIncident() {
    if (!incident) {
      return;
    }

    if (!resolutionSummary.trim()) {
      setError(
        "Resolution summary is required."
      );
      return;
    }

    const payload: ResolveIncidentPayload = {
      resolution_summary:
        resolutionSummary.trim(),
    };

    if (finalRootCause.trim()) {
      payload.final_root_cause =
        finalRootCause.trim();
    }

    if (customerImpact.trim()) {
      payload.customer_impact =
        customerImpact.trim();
    }

    if (preventiveActions.trim()) {
      payload.preventive_actions =
        preventiveActions.trim();
    }

    if (resolutionRemarks.trim()) {
      payload.resolution_remarks =
        resolutionRemarks.trim();
    }

    try {
      setResolveLoading(true);
      setError("");

      const resolvedIncident =
        await resolveIncident(
          incident.incident_id,
          payload
        );

      setIncident(
        resolvedIncident
      );

      setShowResolveForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to resolve incident."
      );
    } finally {
      setResolveLoading(false);
    }
  }

  function openCloseForm() {
    if (!incident) {
      return;
    }

    setError("");

    setCloseRootCause(
      incident.final_root_cause ||
        incident.probable_root_cause ||
        ""
    );

    setFinalVerdict(
      incident.final_verdict || ""
    );

    setClosureRemarks(
      incident.closure_remarks || ""
    );

    setShowCloseForm(true);
  }

  function closeCloseForm() {
    if (closeLoading) {
      return;
    }

    setShowCloseForm(false);
  }

  async function handleCloseIncident() {
    if (!incident) {
      return;
    }

    if (!closeRootCause.trim()) {
      setError(
        "Final root cause is required."
      );
      return;
    }

    if (!finalVerdict) {
      setError(
        "Final verdict is required."
      );
      return;
    }

    const payload: CloseIncidentPayload = {
      final_root_cause:
        closeRootCause.trim(),

      final_verdict:
        finalVerdict,
    };

    if (closureRemarks.trim()) {
      payload.closure_remarks =
        closureRemarks.trim();
    }

    try {
      setCloseLoading(true);
      setError("");

      const closedIncident =
        await closeIncident(
          incident.incident_id,
          payload
        );

      setIncident(
        closedIncident
      );

      setShowCloseForm(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to close incident."
      );
    } finally {
      setCloseLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page-state">
        <div className="loading-spinner" />

        <p>
          Loading incident...
        </p>
      </div>
    );
  }

  if (error && !incident) {
    return (
      <div className="page-state error-state">
        <h2>
          Unable to load incident
        </h2>

        <p>{error}</p>

        <button
          type="button"
          className="secondary-button"
          onClick={onBack}
        >
          Back to Incidents
        </button>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="page-state">
        <h2>
          Incident not found
        </h2>

        <button
          type="button"
          className="secondary-button"
          onClick={onBack}
        >
          Back to Incidents
        </button>
      </div>
    );
  }

  const canResolve =
    incident.status ===
    "investigating";

  const canClose =
    incident.status ===
    "resolved";

  return (
    <div className="page incident-detail-page">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="page-header">

        <div>
          <button
            type="button"
            className="back-button"
            onClick={onBack}
          >
            ← Back to Incidents
          </button>

          <div className="page-kicker">
            INCIDENT DETAIL
          </div>

          <h1>
            {incident.incident_id}
          </h1>
        </div>

        <div className="page-header-actions">

          {canResolve && (
            <button
              type="button"
              className="secondary-button"
              onClick={openResolveForm}
              disabled={resolveLoading}
            >
              Resolve Incident
            </button>
          )}

          {canClose && (
            <button
              type="button"
              className="primary-button"
              onClick={openCloseForm}
              disabled={closeLoading}
            >
              Close Incident
            </button>
          )}

          {incident.status !==
            "resolved" &&
            incident.status !==
              "closed" && (
              <button
                type="button"
                className="primary-button"
                onClick={handleRunTriage}
                disabled={
                  triageLoading
                }
              >
                {triageLoading
                  ? "Running AI Triage..."
                  : "Run AI Triage"}
              </button>
            )}

        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* ======================================================
          RESOLVE FORM
      ====================================================== */}

      {showResolveForm && (
        <section className="panel resolve-panel">

          <div className="section-header">

            <div>
              <span className="section-kicker">
                INCIDENT RESOLUTION
              </span>

              <h3>
                Resolve Incident
              </h3>
            </div>

            <span className="ai-engine-badge">
              HUMAN ACTION
            </span>

          </div>

          <div className="resolve-warning">

            <strong>
              Resolution requires operator approval.
            </strong>

            <span>
              Confirm the actual root cause and
              document the remediation before
              marking this incident as resolved.
            </span>

          </div>

          <div className="form-grid">

            <div className="form-group form-group-full">

              <label htmlFor="finalRootCause">
                Final Root Cause
              </label>

              <textarea
                id="finalRootCause"
                value={finalRootCause}
                onChange={(event) =>
                  setFinalRootCause(
                    event.target.value
                  )
                }
                placeholder="Enter the confirmed or final root cause..."
                rows={4}
              />

            </div>

            <div className="form-group form-group-full">

              <label htmlFor="resolutionSummary">
                Resolution Summary
                <span className="required-mark">
                  *
                </span>
              </label>

              <textarea
                id="resolutionSummary"
                value={resolutionSummary}
                onChange={(event) =>
                  setResolutionSummary(
                    event.target.value
                  )
                }
                placeholder="Describe how the incident was resolved..."
                rows={4}
              />

            </div>

            <div className="form-group">

              <label htmlFor="customerImpact">
                Customer Impact
              </label>

              <textarea
                id="customerImpact"
                value={customerImpact}
                onChange={(event) =>
                  setCustomerImpact(
                    event.target.value
                  )
                }
                placeholder="Describe customer impact..."
                rows={4}
              />

            </div>

            <div className="form-group">

              <label htmlFor="preventiveActions">
                Preventive Actions
              </label>

              <textarea
                id="preventiveActions"
                value={preventiveActions}
                onChange={(event) =>
                  setPreventiveActions(
                    event.target.value
                  )
                }
                placeholder="Describe actions to prevent recurrence..."
                rows={4}
              />

            </div>

            <div className="form-group form-group-full">

              <label htmlFor="resolutionRemarks">
                Resolution Remarks
              </label>

              <textarea
                id="resolutionRemarks"
                value={resolutionRemarks}
                onChange={(event) =>
                  setResolutionRemarks(
                    event.target.value
                  )
                }
                placeholder="Add any additional resolution remarks..."
                rows={3}
              />

            </div>

          </div>

          <div className="resolve-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={
                closeResolveForm
              }
              disabled={
                resolveLoading
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={
                handleResolveIncident
              }
              disabled={
                resolveLoading ||
                !resolutionSummary.trim()
              }
            >
              {resolveLoading
                ? "Resolving..."
                : "Confirm Resolution"}
            </button>

          </div>

        </section>
      )}

      {/* ======================================================
          CLOSE FORM
      ====================================================== */}

      {showCloseForm && (
        <section className="panel resolve-panel">

          <div className="section-header">

            <div>
              <span className="section-kicker">
                CLOSURE REVIEW
              </span>

              <h3>
                Close Incident
              </h3>
            </div>

            <span className="ai-engine-badge">
              HUMAN REVIEW
            </span>

          </div>

          <div className="resolve-warning">

            <strong>
              Final closure requires
              SRE/Admin authorization.
            </strong>

            <span>
              Confirm the final root cause and
              verdict before closing this incident.
            </span>

          </div>

          <div className="form-grid">

            <div className="form-group form-group-full">

              <label htmlFor="closeRootCause">
                Final Root Cause
                <span className="required-mark">
                  *
                </span>
              </label>

              <textarea
                id="closeRootCause"
                value={closeRootCause}
                onChange={(event) =>
                  setCloseRootCause(
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Enter the final confirmed root cause..."
              />

            </div>

            <div className="form-group form-group-full">

              <label htmlFor="finalVerdict">
                Final Verdict
                <span className="required-mark">
                  *
                </span>
              </label>

              <select
                id="finalVerdict"
                value={finalVerdict}
                onChange={(event) =>
                  setFinalVerdict(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Select final verdict
                </option>

                <option value="Confirmed Root Cause">
                  Confirmed Root Cause
                </option>

                <option value="Probable Root Cause">
                  Probable Root Cause
                </option>

                <option value="False Positive">
                  False Positive
                </option>

                <option value="Duplicate Incident">
                  Duplicate Incident
                </option>

                <option value="No Root Cause Identified">
                  No Root Cause Identified
                </option>

                <option value="External Dependency">
                  External Dependency
                </option>

                <option value="Configuration / User Error">
                  Configuration / User Error
                </option>

              </select>

            </div>

            <div className="form-group form-group-full">

              <label htmlFor="closureRemarks">
                Closure Remarks
              </label>

              <textarea
                id="closureRemarks"
                value={closureRemarks}
                onChange={(event) =>
                  setClosureRemarks(
                    event.target.value
                  )
                }
                rows={4}
                placeholder="Add final closure remarks..."
              />

            </div>

          </div>

          <div className="resolve-actions">

            <button
              type="button"
              className="secondary-button"
              onClick={
                closeCloseForm
              }
              disabled={
                closeLoading
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={
                handleCloseIncident
              }
              disabled={
                closeLoading ||
                !closeRootCause.trim() ||
                !finalVerdict
              }
            >
              {closeLoading
                ? "Closing..."
                : "Confirm Closure"}
            </button>

          </div>

        </section>
      )}

      {/* ======================================================
          INCIDENT HERO
      ====================================================== */}

      <section className="panel incident-hero-panel">

        <div className="incident-hero-content">

          <div className="incident-hero-heading">

            <span className="incident-id">
              {incident.incident_id}
            </span>

            <h2>
              {incident.title}
            </h2>

            <p className="incident-description">
              {incident.description}
            </p>

          </div>

          <div className="incident-hero-meta">

            <div className="incident-meta-item">

              <span className="incident-meta-label">
                Severity
              </span>

              <div className="incident-meta-value">
                <SeverityBadge
                  severity={
                    incident.severity
                  }
                />
              </div>

            </div>

            <div className="incident-meta-item">

              <span className="incident-meta-label">
                Status
              </span>

              <div className="incident-meta-value">
                <StatusBadge
                  status={
                    incident.status
                  }
                />
              </div>

            </div>

            <div className="incident-meta-item">

              <span className="incident-meta-label">
                Service
              </span>

              <span className="incident-meta-value">
                {incident.service}
              </span>

            </div>

            <div className="incident-meta-item">

              <span className="incident-meta-label">
                Environment
              </span>

              <span className="incident-meta-value">
                {incident.environment}
              </span>

            </div>

            <div className="incident-meta-item">

              <span className="incident-meta-label">
                Created
              </span>

              <span className="incident-meta-value">
                {new Date(
                  incident.created_at
                ).toLocaleString()}
              </span>

            </div>

            <div className="incident-meta-item">

              <span className="incident-meta-label">
                Updated
              </span>

              <span className="incident-meta-value">
                {new Date(
                  incident.updated_at
                ).toLocaleString()}
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          SUMMARY + CONFIDENCE
      ====================================================== */}

      <section className="detail-grid">

        <div className="panel">

          <div className="section-header">

            <div>
              <span className="section-kicker">
                AI ANALYSIS
              </span>

              <h3>
                Incident Summary
              </h3>
            </div>

          </div>

          <div className="detail-content">

            {incident.incident_summary ? (
              <p>
                {incident.incident_summary}
              </p>
            ) : (
              <div className="empty-detail">
                AI summary unavailable
              </div>
            )}

          </div>

        </div>

        <div className="panel">

          <div className="section-header">

            <div>
              <span className="section-kicker">
                AI CONFIDENCE
              </span>

              <h3>
                Confidence
              </h3>
            </div>

          </div>

          <div className="confidence-display">

            <div className="confidence-value">
              {incident.confidence !=
              null
                ? `${Math.round(
                    incident.confidence *
                      100
                  )}%`
                : "0%"}
            </div>

            <div className="confidence-track">

              <div
                className="confidence-fill"
                style={{
                  width: `${
                    incident.confidence !=
                    null
                      ? Math.min(
                          Math.max(
                            incident.confidence *
                              100,
                            0
                          ),
                          100
                        )
                      : 0
                  }%`,
                }}
              />

            </div>

          </div>

        </div>

      </section>

      {/* ======================================================
          SYMPTOMS + LOGS
      ====================================================== */}

      <section className="detail-grid">

        <div className="panel">

          <div className="section-header">

            <div>
              <span className="section-kicker">
                OBSERVATIONS
              </span>

              <h3>
                Symptoms
              </h3>
            </div>

          </div>

          {incident.symptoms.length >
          0 ? (
            <ul className="detail-list">

              {incident.symptoms.map(
                (
                  symptom,
                  index
                ) => (
                  <li key={index}>
                    {symptom}
                  </li>
                )
              )}

            </ul>
          ) : (
            <div className="empty-detail">
              No symptoms recorded.
            </div>
          )}

        </div>

        <div className="panel">

          <div className="section-header">

            <div>
              <span className="section-kicker">
                SYSTEM LOGS
              </span>

              <h3>
                Logs
              </h3>
            </div>

          </div>

          {incident.logs.length >
          0 ? (
            <div className="log-viewer">

              {incident.logs.map(
                (
                  log,
                  index
                ) => (
                  <div
                    className="log-line"
                    key={index}
                  >
                    {log}
                  </div>
                )
              )}

            </div>
          ) : (
            <div className="empty-detail">
              No logs recorded.
            </div>
          )}

        </div>

      </section>

      {/* ======================================================
          ROOT CAUSE
      ====================================================== */}

      <section className="panel">

        <div className="section-header">

          <div>
            <span className="section-kicker">
              ROOT CAUSE ANALYSIS
            </span>

            <h3>
              Probable Root Cause
            </h3>
          </div>

          <SeverityBadge
            severity={
              incident.severity
            }
          />

        </div>

        <div className="root-cause-content">

          {incident.probable_root_cause ? (
            <p>
              {
                incident.probable_root_cause
              }
            </p>
          ) : (
            <div className="empty-detail">
              Root cause unavailable
            </div>
          )}

        </div>

        {incident.severity_reason && (
          <div className="severity-reason">

            <span>
              Severity Reason
            </span>

            <p>
              {
                incident.severity_reason
              }
            </p>

          </div>
        )}

      </section>

      {/* ======================================================
          EVIDENCE + RECOMMENDED ACTIONS
      ====================================================== */}

      <section className="detail-grid">

        <div className="panel">

          <div className="section-header">

            <div>
              <span className="section-kicker">
                AI EVIDENCE
              </span>

              <h3>
                Evidence
              </h3>
            </div>

          </div>

          {incident.evidence.length >
          0 ? (
            <ul className="detail-list">

              {incident.evidence.map(
                (
                  item,
                  index
                ) => (
                  <li key={index}>
                    {item}
                  </li>
                )
              )}

            </ul>
          ) : (
            <div className="empty-detail">
              No evidence available.
            </div>
          )}

        </div>

        <div className="panel">

          <div className="section-header">

            <div>
              <span className="section-kicker">
                OPERATIONS
              </span>

              <h3>
                Recommended Actions
              </h3>
            </div>

          </div>

          {incident
            .recommended_actions
            .length > 0 ? (
            <ol className="detail-list numbered">

              {incident.recommended_actions.map(
                (
                  action,
                  index
                ) => (
                  <li key={index}>
                    {action}
                  </li>
                )
              )}

            </ol>
          ) : (
            <div className="empty-detail">
              No recommended actions
              available.
            </div>
          )}

        </div>

      </section>

      {/* ======================================================
          RESOLUTION STEPS
      ====================================================== */}

      <section className="panel">

        <div className="section-header">

          <div>
            <span className="section-kicker">
              REMEDIATION
            </span>

            <h3>
              Resolution Steps
            </h3>
          </div>

        </div>

        {incident.resolution_steps
          .length > 0 ? (
          <ol className="detail-list numbered">

            {incident.resolution_steps.map(
              (
                step,
                index
              ) => (
                <li key={index}>
                  {step}
                </li>
              )
            )}

          </ol>
        ) : (
          <div className="empty-detail">
            Resolution steps unavailable.
          </div>
        )}

      </section>

      {/* ======================================================
          RESOLVED SUMMARY
      ====================================================== */}

      {(incident.status ===
        "resolved" ||
        incident.status ===
          "closed") && (
        <section className="panel resolved-summary-panel">

          <div className="section-header">

            <div>
              <span className="section-kicker">
                INCIDENT LIFECYCLE
              </span>

              <h3>
                Resolution Summary
              </h3>
            </div>

            <StatusBadge
              status={
                incident.status
              }
            />

          </div>

          {incident.final_root_cause && (
            <div className="triage-result-section">

              <span className="result-label">
                Final Root Cause
              </span>

              <p>
                {
                  incident.final_root_cause
                }
              </p>

            </div>
          )}

          {incident.resolution_summary && (
            <div className="triage-result-section">

              <span className="result-label">
                Resolution Summary
              </span>

              <p>
                {
                  incident.resolution_summary
                }
              </p>

            </div>
          )}

          {incident.customer_impact && (
            <div className="triage-result-section">

              <span className="result-label">
                Customer Impact
              </span>

              <p>
                {
                  incident.customer_impact
                }
              </p>

            </div>
          )}

          {incident.preventive_actions && (
            <div className="triage-result-section">

              <span className="result-label">
                Preventive Actions
              </span>

              <p>
                {
                  incident.preventive_actions
                }
              </p>

            </div>
          )}

          {incident.resolution_remarks && (
            <div className="triage-result-section">

              <span className="result-label">
                Resolution Remarks
              </span>

              <p>
                {
                  incident.resolution_remarks
                }
              </p>

            </div>
          )}

          {incident.resolved_at && (
            <div className="triage-result-section">

              <span className="result-label">
                Resolved At
              </span>

              <p>
                {new Date(
                  incident.resolved_at
                ).toLocaleString()}
              </p>

            </div>
          )}

          {incident.final_verdict && (
            <div className="triage-result-section">

              <span className="result-label">
                Final Verdict
              </span>

              <p>
                {
                  incident.final_verdict
                }
              </p>

            </div>
          )}

          {incident.closure_remarks && (
            <div className="triage-result-section">

              <span className="result-label">
                Closure Remarks
              </span>

              <p>
                {
                  incident.closure_remarks
                }
              </p>

            </div>
          )}

          {incident.closed_at && (
            <div className="triage-result-section">

              <span className="result-label">
                Closed At
              </span>

              <p>
                {new Date(
                  incident.closed_at
                ).toLocaleString()}
              </p>

            </div>
          )}

        </section>
      )}

      {/* ======================================================
          LATEST AI RUN
      ====================================================== */}

      {triageResult && (
        <section className="panel triage-result-panel">

          <div className="section-header">

            <div>
              <span className="section-kicker">
                LATEST AI RUN
              </span>

              <h3>
                Triage Result
              </h3>
            </div>

            <span className="ai-engine-badge">
              {triageResult.triage_engine ||
                "AI"}
            </span>

          </div>

          <div className="triage-result-grid">

            <div className="triage-result-item">

              <span className="result-label">
                Severity
              </span>

              <SeverityBadge
                severity={
                  triageResult.severity
                }
              />

            </div>

            <div className="triage-result-item">

              <span className="result-label">
                Confidence
              </span>

              <strong>
                {Math.round(
                  triageResult.confidence *
                    100
                )}
                %
              </strong>

            </div>

          </div>

          <div className="triage-result-section">

            <span className="result-label">
              Severity Reason
            </span>

            <p>
              {
                triageResult.severity_reason
              }
            </p>

          </div>

          <div className="triage-result-section">

            <span className="result-label">
              Probable Root Cause
            </span>

            <p>
              {
                triageResult.probable_root_cause
              }
            </p>

          </div>

          <div className="triage-result-section">

            <span className="result-label">
              Incident Summary
            </span>

            <p>
              {
                triageResult.incident_summary
              }
            </p>

          </div>

        </section>
      )}

    </div>
  );
}