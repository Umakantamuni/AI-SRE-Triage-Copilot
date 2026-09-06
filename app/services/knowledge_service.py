from app.rag.documents import (
    DocumentType,
    RAGDocument,
)
from app.rag.vector_store import VectorStore


class KnowledgeService:
    def __init__(
        self,
        vector_store: VectorStore | None = None,
    ):
        self.vector_store = (
            vector_store
            if vector_store is not None
            else VectorStore()
        )

    def add_document(
        self,
        document_id: str,
        document_type: DocumentType,
        title: str,
        content: str,
        service: str,
        environment: str = "production",
    ) -> RAGDocument:
        document = RAGDocument(
            document_id=document_id,
            document_type=document_type,
            title=title,
            content=content,
            service=service,
            environment=environment,
        )

        self.vector_store.add_document(
            document
        )

        return document

    def search(
        self,
        query: str,
        service: str | None = None,
        top_k: int = 5,
    ) -> list[dict]:
        return self.vector_store.search(
            query=query,
            service=service,
            top_k=top_k,
        )