from app.models.incident import Incident
from app.models.triage import TriageResult, TriageSeverity


class TriageService:

    def analyze(self, incident: Incident) -> TriageResult:

        text = " ".join(
            incident.symptoms + incident.logs
        ).lower()

        evidence = []
        recommended_actions = []
        resolution_steps = []

        critical_indicators = [
            "complete outage",
            "service unavailable",
            "data loss",
            "security breach",
            "all customers affected",
        ]

        high_indicators = [
            "500",
            "transaction failures",
            "error rate increased",
            "production",
            "connection pool exhausted",
            "database connection timeout",
        ]

        if any(
            indicator in text
            for indicator in critical_indicators
        ):
            severity = TriageSeverity.CRITICAL

        elif any(
            indicator in text
            for indicator in high_indicators
        ):
            severity = TriageSeverity.HIGH

        elif (
            "warning" in text
            or "degraded" in text
        ):
            severity = TriageSeverity.MEDIUM

        else:
            severity = TriageSeverity.LOW

        # ---------------------------------------------------------
        # Database connection timeout
        # ---------------------------------------------------------

        if "database connection timeout" in text:

            root_cause = (
                "Database connectivity issue causing "
                "application requests to time out."
            )

            severity_reason = (
                "Production transaction failures and HTTP 500 "
                "errors indicate significant customer impact."
            )

            evidence.append(
                "Database connection timeout detected in logs."
            )

            recommended_actions.extend([
                "Check database availability and health.",
                "Check database connection pool utilization.",
                "Review database response time and active connections.",
            ])

            resolution_steps.extend([
                "Verify database connectivity from the application.",
                "Identify connection pool exhaustion.",
                "Check for long-running or leaked database connections.",
                "Restore available connection pool capacity.",
                "Monitor application error rate after recovery.",
            ])

            confidence = 0.90

        # ---------------------------------------------------------
        # Connection pool exhaustion
        # ---------------------------------------------------------

        elif "connection pool exhausted" in text:

            root_cause = (
                "Application database connection pool is "
                "exhausted, preventing new database connections."
            )

            severity_reason = (
                "Connection pool exhaustion can prevent application "
                "requests from reaching the database and cause "
                "customer-facing failures."
            )

            evidence.append(
                "Connection pool exhausted detected in logs."
            )

            recommended_actions.extend([
                "Check active database connections.",
                "Review connection pool size and timeout configuration.",
                "Identify long-running or leaked database connections.",
            ])

            resolution_steps.extend([
                "Identify stale or long-running connections.",
                "Restore available connection pool capacity.",
                "Verify successful database connectivity.",
                "Monitor database connection usage.",
            ])

            confidence = 0.92

        # ---------------------------------------------------------
        # HTTP 500
        # ---------------------------------------------------------

        elif (
            "500" in text
            or "internal server error" in text
        ):

            root_cause = (
                "Application-side internal server error requiring "
                "further investigation."
            )

            severity_reason = (
                "HTTP 500 errors indicate customer-facing "
                "application failures, but the underlying cause "
                "has not yet been established."
            )

            evidence.append(
                "HTTP 500/Internal Server Error detected."
            )

            recommended_actions.extend([
                "Review application error logs.",
                "Check recent deployments.",
                "Identify the failing application component.",
            ])

            resolution_steps.extend([
                "Correlate errors with recent application changes.",
                "Identify the failing application component.",
                "Fix or rollback the affected component.",
                "Verify service health after remediation.",
            ])

            confidence = 0.75

        # ---------------------------------------------------------
        # Unknown incident
        # ---------------------------------------------------------

        else:

            root_cause = (
                "Root cause could not be determined by the "
                "baseline triage rules."
            )

            severity_reason = (
                "Available evidence does not match a known "
                "incident pattern in the deterministic rule engine."
            )

            evidence.append(
                "No known incident pattern matched the "
                "available evidence."
            )

            recommended_actions.extend([
                "Collect additional application and infrastructure logs.",
                "Check recent deployments and configuration changes.",
                "Investigate service health metrics.",
            ])

            resolution_steps.extend([
                "Collect additional evidence.",
                "Correlate logs with monitoring metrics.",
                "Perform deeper root cause analysis.",
            ])

            confidence = 0.40

        return TriageResult(
            severity=severity,
            severity_reason=severity_reason,
            probable_root_cause=root_cause,
            confidence=confidence,
            evidence=evidence,
            recommended_actions=recommended_actions,
            resolution_steps=resolution_steps,
            incident_summary=(
                f"{incident.title}. "
                f"Severity assessed as {severity.value}. "
                f"Probable root cause: {root_cause}"
            ),
        )