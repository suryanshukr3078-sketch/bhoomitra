import hashlib
import logging
import math
import re
from typing import Any

from app.core.config import settings

logger = logging.getLogger("bhoomitra.embeddings")

EMBEDDING_DIMENSION: int = 768
DEFAULT_EMBEDDING_MODEL: str = "text-embedding-004"


def generate_pseudo_embedding(text: str, dimension: int = EMBEDDING_DIMENSION) -> list[float]:
    """
    Generates a deterministic, normalized 768-dimensional pseudo-embedding from text.
    Used for local testing, offline CI/CD, and graceful resilience when a live Gemini
    API key is temporarily absent or rate-limited.
    """
    clean_tokens = re.findall(r"\w+", (text or "").lower())
    vec = [0.0] * dimension

    if not clean_tokens:
        clean_tokens = ["empty"]

    for token in clean_tokens:
        token_hash = hashlib.sha256(token.encode("utf-8")).digest()
        for i in range(0, min(len(token_hash) - 1, 16), 2):
            idx = int.from_bytes(token_hash[i : i + 2], "little") % dimension
            sign = 1.0 if token_hash[i] % 2 == 0 else -1.0
            vec[idx] += sign * (1.0 + (len(token) / 10.0))

    # Also incorporate global text hash to avoid sparse zeros
    global_digest = hashlib.sha512(text.encode("utf-8")).digest()
    for i in range(0, len(global_digest) - 1, 2):
        idx = (i * 12) % dimension
        vec[idx] += (global_digest[i] - 128) / 256.0

    # L2 normalize the vector
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0.0:
        vec = [round(x / norm, 6) for x in vec]
    else:
        vec[0] = 1.0

    return vec


def get_effective_gemini_api_key() -> str | None:
    """
    Resolves GEMINI_API_KEY from settings or environment variables,
    stripping any accidental wrapping quotes or whitespace.
    """
    import os

    raw = (
        getattr(settings, "gemini_api_key", None)
        or os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GOOGLE_API_KEY")
        or os.environ.get("GOOGLE_GEMINI_API_KEY")
    )
    if not raw:
        return None
    cleaned = str(raw).strip().strip("'\"")
    return cleaned if cleaned else None


def generate_embedding(text: str, allow_fallback: bool = True) -> list[float] | None:
    """
    Takes combined text (e.g. title + abstract) and returns its 768-dimensional
    embedding vector using Google's Gemini API (model: text-embedding-004).

    If the Gemini API call fails, times out, or if GEMINI_API_KEY is not configured:
    - If allow_fallback is True, returns a deterministic 768-dim pseudo-embedding
      so downstream pgvector operations remain fully testable and functional.
    - If allow_fallback is False, returns None so callers can fall back to keyword search.
    """
    clean_text = (text or "").strip()
    if not clean_text:
        return None

    api_key = get_effective_gemini_api_key()
    model_name = getattr(settings, "gemini_embedding_model", DEFAULT_EMBEDDING_MODEL) or DEFAULT_EMBEDDING_MODEL

    if api_key:
        try:
            from google import genai

            client = genai.Client(api_key=api_key)
            # Truncate clean_text if exceptionally long (Gemini supports up to ~2048 tokens for embeddings)
            truncated_text = clean_text[:8000]

            response = client.models.embed_content(
                model=model_name,
                contents=truncated_text,
            )

            if response and response.embeddings and len(response.embeddings) > 0:
                values = response.embeddings[0].values
                if values and len(values) == EMBEDDING_DIMENSION:
                    logger.info(f"[EmbeddingService] Successfully generated {len(values)}-dim Gemini embedding.")
                    return list(values)
                elif values:
                    logger.warning(
                        f"[EmbeddingService] Received embedding with dimension {len(values)}, expected {EMBEDDING_DIMENSION}."
                    )
                    return list(values)
        except Exception as err:
            logger.error(f"[EmbeddingService] Gemini API call failed: {type(err).__name__}: {err}")

    # Fallback path
    if allow_fallback:
        logger.info(
            f"[EmbeddingService] Generating deterministic fallback embedding ({EMBEDDING_DIMENSION} dims) for text: '{clean_text[:40]}...'"
        )
        return generate_pseudo_embedding(clean_text, dimension=EMBEDDING_DIMENSION)

    return None
