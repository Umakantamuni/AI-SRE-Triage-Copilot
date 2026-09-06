from pathlib import Path

import chromadb

from app.rag.documents import RAGDocument
from app.rag.embeddings import EmbeddingService


class VectorStore:
    def __init__(
        self,
        collection_name: str = "sre_knowledge_base",
    ):
        self.embedding_service = EmbeddingService()

        storage_path = Path("data/chroma")

        storage_path.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.client = chromadb.PersistentClient(
            path=str(storage_path),
        )

        self.collection = (
            self.client.get_or_create_collection(
                name=collection_name,
                metadata={
                    "description": (
                        "AI SRE Incident Triage "
                        "knowledge base"
                    )
                },
            )
        )

    def add_document(
        self,
        document: RAGDocument,
    ) -> None:
        text = (
            f"{document.title}\n"
            f"{document.content}"
        )

        embedding = (
            self.embedding_service.embed_text(
                text
            )
        )

        self.collection.upsert(
            ids=[document.document_id],
            documents=[text],
            embeddings=[embedding],
            metadatas=[
                {
                    "document_type": (
                        document.document_type.value
                    ),
                    "service": document.service,
                    "environment": (
                        document.environment
                    ),
                    "title": document.title,
                }
            ],
        )

    def search(
        self,
        query: str,
        service: str | None = None,
        top_k: int = 5,
    ) -> list[dict]:
        query_embedding = (
            self.embedding_service.embed_text(
                query
            )
        )

        where = None

        if service:
            where = {
                "service": service
            }

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where,
        )

        documents = results.get(
            "documents",
            [[]],
        )[0]

        ids = results.get(
            "ids",
            [[]],
        )[0]

        metadatas = results.get(
            "metadatas",
            [[]],
        )[0]

        distances = results.get(
            "distances",
            [[]],
        )[0]

        return [
            {
                "document_id": document_id,
                "content": content,
                "metadata": metadata,
                "distance": distance,
            }
            for document_id, content, metadata, distance
            in zip(
                ids,
                documents,
                metadatas,
                distances,
            )
        ]