from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.db.session import check_database_connection

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get(
    "/live",
    summary="Liveness check",
)
async def liveness() -> dict[str, str]:
    return {
        "status": "alive",
        "service": settings.app_name,
        "version": settings.app_version,
    }


@router.get(
    "/ready",
    summary="Readiness check",
)
async def readiness() -> dict[str, Any]:
    try:
        database = await check_database_connection()
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is not ready.",
        ) from error

    from app.services.embedding_service import get_effective_gemini_api_key

    has_gemini = bool(get_effective_gemini_api_key())

    return {
        "status": "ready",
        "service": settings.app_name,
        "database": {
            **database,
            "connection_source": settings.db_connection_source,
            "database_url": settings.masked_database_url,
        },
        "ai": {
            "gemini_api_key_configured": has_gemini,
            "embedding_model": settings.gemini_embedding_model,
            "vector_dimension": 768,
        },
    }


@router.get(
    "/gemini-models",
    summary="List available Gemini models for diagnosis",
)
async def list_gemini_models() -> dict[str, Any]:
    from app.services.embedding_service import get_effective_gemini_api_key
    from google import genai

    key = get_effective_gemini_api_key()
    if not key:
        return {"configured": False, "models": []}

    try:
        client = genai.Client(api_key=key)
        model_list = []
        for m in client.models.list():
            model_list.append({
                "name": getattr(m, "name", ""),
                "display_name": getattr(m, "display_name", ""),
                "supported_actions": getattr(m, "supported_actions", []),
            })
        return {"configured": True, "count": len(model_list), "models": model_list}
    except Exception as e:
        return {"configured": True, "error": f"{type(e).__name__}: {e}"}


@router.get(
    "/test-generate",
    summary="Test generate_content across model candidates",
)
async def test_generate() -> dict[str, Any]:
    from app.services.embedding_service import get_effective_gemini_api_key
    from google import genai

    key = get_effective_gemini_api_key()
    if not key:
        return {"configured": False, "results": {}}

    client = genai.Client(api_key=key)
    candidates = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.7-flash",
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemini-pro-latest",
        "gemini-3.6-flash",
    ]
    results = {}
    for model in candidates:
        try:
            resp = client.models.generate_content(
                model=model,
                contents="Say 'Bhoomitra AI is active' in 5 words or less.",
            )
            results[model] = {"status": "ok", "text": resp.text.strip()}
        except Exception as err:
            results[model] = {"status": "error", "message": f"{type(err).__name__}: {err}"}

    return {"results": results}


