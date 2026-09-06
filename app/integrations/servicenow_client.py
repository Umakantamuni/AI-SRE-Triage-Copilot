from __future__ import annotations

import logging
from typing import Any

import httpx

from app.config import settings


logger = logging.getLogger("ai_sre_triage.servicenow")


class ServiceNowError(Exception):
    """Raised when a ServiceNow API operation fails."""


class ServiceNowClient:
    """
    Client for communicating with the ServiceNow REST API.

    Credentials are loaded from application settings and therefore
    should come from environment variables / .env.
    """

    def __init__(self) -> None:
        self.base_url = settings.servicenow_url.rstrip("/")

        self.username = (
            settings.servicenow_username
        )

        self.password = (
            settings.servicenow_password
        )

        self.enabled = (
            settings.servicenow_enabled
        )

        self.timeout = httpx.Timeout(
            15.0,
            connect=5.0,
        )

    def _validate_configuration(self) -> None:
        if not self.enabled:
            raise ServiceNowError(
                "ServiceNow integration is disabled"
            )

        if not self.base_url:
            raise ServiceNowError(
                "ServiceNow URL is not configured"
            )

        if not self.username:
            raise ServiceNowError(
                "ServiceNow username is not configured"
            )

        if not self.password:
            raise ServiceNowError(
                "ServiceNow password is not configured"
            )

    def _get_client(self) -> httpx.Client:
        self._validate_configuration()

        return httpx.Client(
            base_url=self.base_url,
            auth=(
                self.username,
                self.password,
            ),
            timeout=self.timeout,
            headers={
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
        )

    def test_connection(self) -> dict[str, Any]:
        """
        Validate connectivity and authentication against ServiceNow.

        Uses the incident table with a minimal query so we don't retrieve
        unnecessary production data.
        """

        self._validate_configuration()

        try:
            with self._get_client() as client:
                response = client.get(
                    "/api/now/table/incident",
                    params={
                        "sysparm_limit": "1",
                        "sysparm_fields": "sys_id",
                    },
                )

                response.raise_for_status()

                return {
                    "connected": True,
                    "status_code": response.status_code,
                    "message": (
                        "ServiceNow connection "
                        "successful"
                    ),
                }

        except httpx.HTTPStatusError as exc:
            status_code = (
                exc.response.status_code
            )

            logger.error(
                "ServiceNow authentication/API "
                "request failed status=%s",
                status_code,
            )

            raise ServiceNowError(
                "ServiceNow API request failed"
            ) from exc

        except httpx.RequestError as exc:
            logger.error(
                "ServiceNow connection failed: %s",
                exc,
            )

            raise ServiceNowError(
                "Unable to connect to ServiceNow"
            ) from exc

    def get_incident(
        self,
        incident_number: str,
    ) -> dict[str, Any]:
        """
        Retrieve one ServiceNow incident by incident number.
        """

        self._validate_configuration()

        if not incident_number.strip():
            raise ServiceNowError(
                "Incident number cannot be empty"
            )

        try:
            with self._get_client() as client:
                response = client.get(
                    "/api/now/table/incident",
                    params={
                        "sysparm_query": (
                            f"number={incident_number}"
                        ),
                        "sysparm_limit": "1",
                    },
                )

                response.raise_for_status()

                data = response.json()

                results = data.get(
                    "result",
                    [],
                )

                if not results:
                    raise ServiceNowError(
                        "ServiceNow incident "
                        "not found"
                    )

                return results[0]

        except ServiceNowError:
            raise

        except httpx.HTTPStatusError as exc:
            logger.error(
                "ServiceNow incident request "
                "failed status=%s",
                exc.response.status_code,
            )

            raise ServiceNowError(
                "Failed to retrieve ServiceNow incident"
            ) from exc

        except httpx.RequestError as exc:
            logger.error(
                "ServiceNow incident request "
                "connection failed: %s",
                exc,
            )

            raise ServiceNowError(
                "Unable to connect to ServiceNow"
            ) from exc

        except ValueError as exc:
            logger.error(
                "Invalid JSON response from ServiceNow"
            )

            raise ServiceNowError(
                "Invalid response from ServiceNow"
            ) from exc

    def create_incident(
        self,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Create a new incident in ServiceNow.
        """

        self._validate_configuration()

        if not payload:
            raise ServiceNowError(
                "Incident payload cannot be empty"
            )

        try:
            with self._get_client() as client:
                response = client.post(
                    "/api/now/table/incident",
                    json=payload,
                )

                response.raise_for_status()

                data = response.json()

                result = data.get("result")

                if not result:
                    raise ServiceNowError(
                        "ServiceNow returned an empty "
                        "incident response"
                    )

                return result

        except ServiceNowError:
            raise

        except httpx.HTTPStatusError as exc:
            logger.error(
                "ServiceNow incident creation "
                "failed status=%s",
                exc.response.status_code,
            )

            raise ServiceNowError(
                "Failed to create ServiceNow incident"
            ) from exc

        except httpx.RequestError as exc:
            logger.error(
                "ServiceNow incident creation "
                "connection failed: %s",
                exc,
            )

            raise ServiceNowError(
                "Unable to connect to ServiceNow"
            ) from exc

        except ValueError as exc:
            logger.error(
                "Invalid JSON response from ServiceNow"
            )

            raise ServiceNowError(
                "Invalid response from ServiceNow"
            ) from exc

    def update_incident(
        self,
        sys_id: str,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Update an existing ServiceNow incident.
        """

        self._validate_configuration()

        if not sys_id.strip():
            raise ServiceNowError(
                "ServiceNow sys_id cannot be empty"
            )

        if not payload:
            raise ServiceNowError(
                "Incident update payload cannot be empty"
            )

        try:
            with self._get_client() as client:
                response = client.patch(
                    f"/api/now/table/incident/{sys_id}",
                    json=payload,
                )

                response.raise_for_status()

                data = response.json()

                result = data.get("result")

                if not result:
                    raise ServiceNowError(
                        "ServiceNow returned an empty "
                        "update response"
                    )

                return result

        except ServiceNowError:
            raise

        except httpx.HTTPStatusError as exc:
            logger.error(
                "ServiceNow incident update "
                "failed status=%s",
                exc.response.status_code,
            )

            raise ServiceNowError(
                "Failed to update ServiceNow incident"
            ) from exc

        except httpx.RequestError as exc:
            logger.error(
                "ServiceNow incident update "
                "connection failed: %s",
                exc,
            )

            raise ServiceNowError(
                "Unable to connect to ServiceNow"
            ) from exc

        except ValueError as exc:
            logger.error(
                "Invalid JSON response from ServiceNow"
            )

            raise ServiceNowError(
                "Invalid response from ServiceNow"
            ) from exc