const API_BASE_URL = "http://127.0.0.1:8000";

/* =========================================================
   TYPES
========================================================= */

export type Severity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type IncidentStatus =
  | "open"
  | "investigating"
  | "resolved"
  | "closed";

/* =========================================================
   INCIDENT
========================================================= */

export interface Incident {
  incident_id: string;
  title: string;
  description: string;

  initial_severity?:
    | "low"
    | "medium"
    | "high"
    | "critical";

  severity:
    | "low"
    | "medium"
    | "high"
    | "critical";

  severity_reason?: string | null;

  status: IncidentStatus;

  service: string;
  environment: string;

  symptoms: string[];
  logs: string[];

  probable_root_cause?: string | null;
  confidence?: number | null;

  evidence: string[];
  recommended_actions: string[];
  resolution_steps: string[];

  incident_summary?: string | null;

  created_by?: number | null;
  resolved_by?: number | null;
  closed_by?: number | null;

  final_root_cause?: string | null;
  resolution_summary?: string | null;
  customer_impact?: string | null;
  preventive_actions?: string | null;
  resolution_remarks?: string | null;

  final_verdict?: string | null;
  closure_remarks?: string | null;

  created_at: string;
  updated_at: string;

  resolved_at?: string | null;
  closed_at?: string | null;
}

/* =========================================================
   TRIAGE
========================================================= */

export interface TriageResult {
  incident_id: string;

  severity: Severity;

  severity_reason?: string | null;

  probable_root_cause?: string | null;

  confidence?: number | null;

  evidence: string[];

  recommended_actions: string[];

  resolution_steps: string[];

  incident_summary?: string | null;
}

/* =========================================================
   CREATE INCIDENT
========================================================= */

export interface CreateIncidentPayload {
  title: string;
  description: string;
  service: string;
  environment: string;
  severity: Severity;
  symptoms: string[];
  logs: string[];
}

/* =========================================================
   RESOLVE INCIDENT
========================================================= */

export interface ResolveIncidentPayload {
  resolution_summary: string;
  final_root_cause?: string;
  customer_impact?: string;
  preventive_actions?: string;
  resolution_remarks?: string;
}

/* =========================================================
   CLOSE INCIDENT
========================================================= */

export interface CloseIncidentPayload {
  final_root_cause: string;
  final_verdict: string;
  closure_remarks?: string;
}

/* =========================================================
   AUTH
========================================================= */

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/* =========================================================
   DASHBOARD
========================================================= */

export interface DashboardStats {
  total_incidents: number;
  open_incidents: number;
  investigating_incidents: number;
  resolved_incidents: number;
  closed_incidents: number;
  critical_incidents: number;
  high_incidents: number;
}

/* =========================================================
   HEALTH
========================================================= */

export interface HealthResponse {
  status: string;
  [key: string]: unknown;
}

/* =========================================================
   GENERIC REQUEST
========================================================= */

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    localStorage.getItem(
      "access_token"
    );

  const headers = new Headers(
    options.headers
  );

  headers.set(
    "Content-Type",
    "application/json"
  );

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    try {
      const errorData =
        await response.json();

      if (
        typeof errorData?.detail ===
        "string"
      ) {
        message =
          errorData.detail;
      } else if (
        Array.isArray(
          errorData?.detail
        )
      ) {
        message =
          errorData.detail
            .map(
              (item: {
                msg?: string;
              }) => item.msg
            )
            .filter(Boolean)
            .join(", ");
      }
    } catch {
      // Keep default error.
    }

    throw new Error(message);
  }

  if (
    response.status === 204
  ) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/* =========================================================
   HEALTH
========================================================= */

export async function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>(
    "/health"
  );
}

/* =========================================================
   AUTH
========================================================= */

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response =
    await request<LoginResponse>(
      "/api/v1/auth/login",
      {
        method: "POST",

        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

  localStorage.setItem(
    "access_token",
    response.access_token
  );

  return response;
}

export function logout(): void {
  localStorage.removeItem(
    "access_token"
  );

  window.dispatchEvent(
    new Event("auth-logout")
  );
}

export function isAuthenticated(): boolean {
  return Boolean(
    localStorage.getItem(
      "access_token"
    )
  );
}

/* =========================================================
   INCIDENTS
========================================================= */

export async function getIncidents(): Promise<
  Incident[]
> {
  return request<Incident[]>(
    "/api/v1/incidents"
  );
}

export async function getIncident(
  incidentId: string
): Promise<Incident> {
  return request<Incident>(
    `/api/v1/incidents/${encodeURIComponent(
      incidentId
    )}`
  );
}

export async function createIncident(
  payload: CreateIncidentPayload
): Promise<Incident> {
  return request<Incident>(
    "/api/v1/incidents",
    {
      method: "POST",

      body: JSON.stringify(
        payload
      ),
    }
  );
}

/* =========================================================
   AI TRIAGE
========================================================= */

export async function triageIncident(
  incidentId: string
): Promise<TriageResult> {
  return request<TriageResult>(
    `/api/v1/incidents/${encodeURIComponent(
      incidentId
    )}/triage`,
    {
      method: "POST",
    }
  );
}

/* =========================================================
   RESOLVE INCIDENT
========================================================= */

export async function resolveIncident(
  incidentId: string,
  payload: ResolveIncidentPayload
): Promise<Incident> {
  return request<Incident>(
    `/api/v1/incidents/${encodeURIComponent(
      incidentId
    )}/resolve`,
    {
      method: "POST",

      body: JSON.stringify(
        payload
      ),
    }
  );
}

/* =========================================================
   CLOSE INCIDENT
========================================================= */

export async function closeIncident(
  incidentId: string,
  payload: CloseIncidentPayload
): Promise<Incident> {
  return request<Incident>(
    `/api/v1/incidents/${encodeURIComponent(
      incidentId
    )}/close`,
    {
      method: "POST",

      body: JSON.stringify(
        payload
      ),
    }
  );
}

/* =========================================================
   KNOWLEDGE BASE
========================================================= */

export async function searchKnowledge(
  query: string
): Promise<unknown[]> {
  const params =
    new URLSearchParams({
      q: query,
    });

  return request<unknown[]>(
    `/api/v1/knowledge/search?${params.toString()}`
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export async function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>(
    "/api/v1/dashboard/stats"
  );
}