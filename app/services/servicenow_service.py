from __future__ import annotations

import logging
from typing import Any

from app.integrations.servicenow_client import (
    ServiceNowClient,
    ServiceNowError,
)
from app.models.servicenow import (
    ServiceNowIncident,
)

logger = logging.getLogger(
    "ai_sre_triage.servicenow_service"
)


class ServiceNowService:
    """
    Business/service layer for ServiceNow integration.

    Responsible for:
    - Fetching incidents from ServiceNow
    - Validating and normalizing ServiceNow payloads
    - Creating incidents in ServiceNow
    - Updating incidents in ServiceNow
    - Keeping ServiceNow API logic outside route handlers
    """

    def __init__(
        self,
        client: ServiceNowClient | None = None,
    ) -> None:
        self.client = (
            client
            if client is not None
            else ServiceNowClient()
        )

    def test_connection(self) -> dict[str, Any]:
        """
        Verify connectivity with ServiceNow.
        """
        return self.client.test_connection()

    def fetch_incident(
        self,
        incident_number: str,
    ) -> ServiceNowIncident:
        """
        Fetch and normalize a ServiceNow incident.
        """

        if not incident_number.strip():
            raise ServiceNowError(
                "Incident number cannot be empty"
            )

        raw_incident = self.client.get_incident(
            incident_number
        )

        try:
            return ServiceNowIncident(
                **raw_incident,
                raw_data=raw_incident,
            )
        except Exception as exc:
            logger.error(
                "Failed to normalize ServiceNow "
                "incident number=%s",
                incident_number,
            )

            raise ServiceNowError(
                "Invalid ServiceNow incident data"
            ) from exc

    def create_incident(
        self,
        payload: dict[str, Any],
    ) -> ServiceNowIncident:
        """
        Create an incident in ServiceNow.
        """

        if not payload:
            raise ServiceNowError(
                "Incident payload cannot be empty"
            )

        raw_incident = (
            self.client.create_incident(
                payload
            )
        )

        try:
            return ServiceNowIncident(
                **raw_incident,
                raw_data=raw_incident,
            )
        except Exception as exc:
            logger.error(
                "Failed to normalize created "
                "ServiceNow incident"
            )

            raise ServiceNowError(
                "Invalid ServiceNow incident response"
            ) from exc

    def update_incident(
        self,
        sys_id: str,
        payload: dict[str, Any],
    ) -> ServiceNowIncident:
        """
        Update an existing ServiceNow incident.
        """

        if not sys_id.strip():
            raise ServiceNowError(
                "ServiceNow sys_id cannot be empty"
            )

        if not payload:
            raise ServiceNowError(
                "Incident update payload cannot be empty"
            )

        raw_incident = (
            self.client.update_incident(
                sys_id,
                payload,
            )
        )

        try:
            return ServiceNowIncident(
                **raw_incident,
                raw_data=raw_incident,
            )
        except Exception as exc:
            logger.error(
                "Failed to normalize updated "
                "ServiceNow incident sys_id=%s",
                sys_id,
            )

            raise ServiceNowError(
                "Invalid ServiceNow incident response"
            ) from exc
