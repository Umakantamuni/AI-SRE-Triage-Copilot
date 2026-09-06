from app.models.incident import Incident
from app.rag.vector_store import VectorStore


class RAGService:
    def __init__(
        self,
        vector_store: VectorStore | None = None,
    ):
        self.vector_store = (
            vector_store
            if vector_store is not None
            else VectorStore()
        )

    def retrieve_context(
        self,
        incident: Incident,
        top_k: int = 5,
    ) -> list[dict]:
        query_parts = [
            incident.title,
            incident.description,
            *incident.symptoms,
            *incident.logs,
        ]

        query = " ".join(
            part
            for part in query_parts
            if part
        )

        return self.vector_store.search(
            query=query,
            service=incident.service,
            top_k=top_k,
        )