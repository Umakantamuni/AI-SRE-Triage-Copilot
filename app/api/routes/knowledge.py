from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.dependencies import require_roles
from app.models.knowledge import (
    KnowledgeDocumentCreate,
    KnowledgeDocumentResponse,
)
from app.services.knowledge_service import KnowledgeService


router = APIRouter(
    prefix="/api/v1/knowledge",
    tags=["Knowledge"],
)


knowledge_service = KnowledgeService()


# ---------------------------------------------------------
# ADD KNOWLEDGE DOCUMENT
# SRE / Admin only
# ---------------------------------------------------------

@router.post(
    "",
    response_model=KnowledgeDocumentResponse,
    status_code=201,
)
def add_knowledge_document(
    document: KnowledgeDocumentCreate,
    current_user=Depends(
        require_roles(
            "sre",
            "admin",
        )
    ),
):
    try:
        created_document = (
            knowledge_service.add_document(
                document_id=document.document_id,
                document_type=document.document_type,
                title=document.title,
                content=document.content,
                service=document.service,
                environment=document.environment,
            )
        )

        return KnowledgeDocumentResponse(
            document_id=created_document.document_id,
            document_type=created_document.document_type,
            title=created_document.title,
            content=created_document.content,
            service=created_document.service,
            environment=created_document.environment,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print(
            "Knowledge document creation failed: "
            f"{exc}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to add knowledge document.",
        ) from exc


# ---------------------------------------------------------
# SEARCH KNOWLEDGE
# Viewer / Operator / SRE / Admin
# ---------------------------------------------------------

@router.get("/search")
def search_knowledge(
    query: str = Query(
        ...,
        min_length=2,
        max_length=500,
    ),
    service: str | None = Query(
        default=None,
        min_length=1,
        max_length=100,
    ),
    top_k: int = Query(
        default=5,
        ge=1,
        le=20,
    ),
    current_user=Depends(
        require_roles(
            "viewer",
            "operator",
            "sre",
            "admin",
        )
    ),
):
    query = query.strip()

    if not query:
        raise HTTPException(
            status_code=422,
            detail="Knowledge search query cannot be empty.",
        )

    try:
        return knowledge_service.search(
            query=query,
            service=service,
            top_k=top_k,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        print(
            "Knowledge search failed: "
            f"{exc}"
        )

        raise HTTPException(
            status_code=500,
            detail="Knowledge search failed.",
        ) from exc