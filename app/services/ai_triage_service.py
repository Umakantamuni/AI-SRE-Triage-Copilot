import json

from app.models.incident import Incident
from app.models.triage import TriageResult
from app.services.ai_service import AIService
from app.rag.rag_service import RAGService


class AITriageService:
    def __init__(
        self,
        ai_service: AIService,
        rag_service: RAGService,
    ):
        self.ai_service = ai_service
        self.rag_service = rag_service

    def analyze(
        self,
        incident: Incident,
    ) -> TriageResult:

        retrieved_documents = (
            self.rag_service.retrieve_context(
                incident=incident,
                top_k=5,
            )
        )

        rag_context = []

        for document in retrieved_documents:
            metadata = document.get(
                "metadata",
                {},
            )

            rag_context.append(
                {
                    "document_id": document.get(
                        "document_id"
                    ),
                    "title": metadata.get(
                        "title"
                    ),
                    "document_type": metadata.get(
                        "document_type"
                    ),
                    "service": metadata.get(
                        "service"
                    ),
                    "environment": metadata.get(
                        "environment"
                    ),
                    "content": document.get(
                        "content"
                    ),
                }
            )

        prompt = f"""
You are an expert Site Reliability Engineer
performing production incident triage.

Analyze the incident using ONLY:

1. Incident evidence.
2. Retrieved SRE knowledge.

Do not invent evidence.

INCIDENT

Incident ID:
{incident.incident_id}

Title:
{incident.title}

Description:
{incident.description}

Service:
{incident.service}

Environment:
{incident.environment}

Symptoms:
{json.dumps(incident.symptoms)}

Logs:
{json.dumps(incident.logs)}


RETRIEVED KNOWLEDGE

{json.dumps(rag_context, indent=2)}


Return ONLY valid JSON.

Required structure:

{{
  "severity": "low|medium|high|critical",

  "severity_reason":
    "Brief explanation for the selected severity.",

  "probable_root_cause":
    "Most likely root cause based only on available evidence.",

  "confidence": 0.0,

  "evidence": [
    "Evidence supporting the diagnosis."
  ],

  "recommended_actions": [
    "Safe operational investigation or remediation action."
  ],

  "resolution_steps": [
    "Ordered resolution step."
  ],

  "incident_summary":
    "Concise production incident summary."
}}


RULES

1. Use only the incident information and
   retrieved knowledge provided above.

2. Never invent logs, metrics, infrastructure,
   deployments, database state, or configuration.

3. Confidence must be between 0.0 and 1.0.

4. Evidence must directly support the
   probable root cause.

5. Do not treat knowledge-base content as
   direct incident evidence.

6. Severity must reflect the visible production
   impact.

7. Prefer investigation and verification before
   remediation.

8. Do not recommend destructive actions such as:
   - deleting data
   - dropping databases
   - killing database sessions
   - deleting infrastructure
   - disabling security controls

   unless explicitly justified by the incident evidence.

9. Recommended actions must be safe and
   operationally useful.

10. Resolution steps must be logically ordered.

11. Ignore retrieved knowledge if it is not
    relevant to the incident.

12. Keep the response concise and technically precise.
"""

        response = self.ai_service.generate(
            prompt
        )

        try:
            result = json.loads(response)

        except json.JSONDecodeError as exc:
            raise RuntimeError(
                "AI returned invalid JSON."
            ) from exc

        return TriageResult.model_validate(
            result
        )