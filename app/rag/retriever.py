from app.rag.documents import RAGDocument


class RAGRetriever:

    def __init__(
        self,
        documents: list[RAGDocument] | None = None,
    ):
        self.documents = documents or []

    def add_document(
        self,
        document: RAGDocument,
    ) -> None:
        self.documents.append(document)

    def retrieve(
        self,
        query: str,
        service: str | None = None,
        top_k: int = 5,
    ) -> list[RAGDocument]:

        query_terms = set(
            query.lower().split()
        )

        candidates = []

        for document in self.documents:

            if service and document.service != service:
                continue

            document_text = (
                f"{document.title} "
                f"{document.content}"
            ).lower()

            document_terms = set(
                document_text.split()
            )

            score = len(
                query_terms & document_terms
            )

            if score > 0:
                candidates.append(
                    (score, document)
                )

        candidates.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        return [
            document
            for _, document in candidates[:top_k]
        ]