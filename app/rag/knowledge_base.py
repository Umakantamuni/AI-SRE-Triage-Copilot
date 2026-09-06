from app.rag.documents import (
    DocumentType,
    RAGDocument,
)
from app.rag.retriever import RAGRetriever


class KnowledgeBase:

    def __init__(self):
        self.retriever = RAGRetriever()

    def add_runbook(
        self,
        document_id: str,
        title: str,
        content: str,
        service: str,
        environment: str = "production",
    ) -> None:

        document = RAGDocument(
            document_id=document_id,
            document_type=DocumentType.RUNBOOK,
            title=title,
            content=content,
            service=service,
            environment=environment,
        )

        self.retriever.add_document(document)

    def add_past_incident(
        self,
        document_id: str,
        title: str,
        content: str,
        service: str,
        environment: str = "production",
    ) -> None:

        document = RAGDocument(
            document_id=document_id,
            document_type=DocumentType.PAST_INCIDENT,
            title=title,
            content=content,
            service=service,
            environment=environment,
        )

        self.retriever.add_document(document)

    def search(
        self,
        query: str,
        service: str | None = None,
        top_k: int = 5,
    ) -> list[RAGDocument]:

        return self.retriever.retrieve(
            query=query,
            service=service,
            top_k=top_k,
        )