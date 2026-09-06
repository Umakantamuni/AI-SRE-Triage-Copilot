from dataclasses import dataclass
from enum import Enum


class DocumentType(str, Enum):
    RUNBOOK = "runbook"
    PAST_INCIDENT = "past_incident"
    KNOWLEDGE_ARTICLE = "knowledge_article"


@dataclass
class RAGDocument:
    document_id: str
    document_type: DocumentType
    title: str
    content: str
    service: str
    environment: str = "production"