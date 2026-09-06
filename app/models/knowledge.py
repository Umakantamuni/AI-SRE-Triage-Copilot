from enum import Enum

from pydantic import BaseModel, Field


class KnowledgeDocumentType(str, Enum):
    RUNBOOK = "runbook"
    PAST_INCIDENT = "past_incident"
    KNOWLEDGE_ARTICLE = "knowledge_article"


class KnowledgeDocumentCreate(BaseModel):
    document_id: str = Field(min_length=1)
    document_type: KnowledgeDocumentType
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)
    service: str = Field(min_length=1)
    environment: str = "production"


class KnowledgeDocumentResponse(BaseModel):
    document_id: str
    document_type: KnowledgeDocumentType
    title: str
    content: str
    service: str
    environment: str