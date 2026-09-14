import logging
from typing import Any

from app.core.config import settings
from app.services.embedding_service import get_effective_gemini_api_key

logger = logging.getLogger("bhoomitra.assistant")

DISCLAIMER_TEXT: str = (
    "This answer is AI-generated from platform data and is not an official government determination. "
    "Always verify with primary sources."
)

INSUFFICIENT_INFO_ANSWER: str = (
    "I don't have enough information in the platform repository to answer this question."
)

ASSISTANT_PROMPT_TEMPLATE = """You are the official AI Evidence Search Assistant for the Bhoomitra Land Governance Platform.
Your task is to answer the user's question strictly and ONLY using the provided Reference Resources below.

Strict Instructions:
1. Answer ONLY using facts, legal statutes, policies, spatial metrics, and data explicitly provided in the Reference Resources below. Do NOT use any outside knowledge, assumptions, or unverified claims.
2. For every factual claim, legal requirement, or finding in your answer, you MUST explicitly cite the supporting resource using its reference number marker (e.g., [1], [2]) or by mentioning the resource title directly.
3. If the provided Reference Resources do NOT contain enough information to answer the question, you MUST explicitly state:
"I don't have enough information in the platform repository to answer this question."
Do NOT invent or guess an answer if the context does not support it.
4. Maintain an objective, authoritative, structured, and professional tone suitable for land administrators, legal researchers, and citizens.

Reference Resources:
{context}

User Question:
{question}

Answer:"""


def format_context_block(resources: list[dict[str, Any]]) -> str:
    """
    Formats a list of retrieved resource dicts into a structured context string for prompting.
    """
    if not resources:
        return "No reference resources found."

    context_entries: list[str] = []
    for idx, res in enumerate(resources, 1):
        title = res.get("title", "Untitled Resource").strip()
        rtype = res.get("resource_type", "resource").strip()
        abstract = (res.get("abstract") or "No detailed abstract provided.").strip()
        publisher = (res.get("publisher") or "").strip()
        pub_info = f" | Publisher: {publisher}" if publisher else ""

        entry = (
            f"[{idx}] Title: {title}\n"
            f"    Type: {rtype}{pub_info}\n"
            f"    Abstract/Summary: {abstract}\n"
        )
        context_entries.append(entry)

    return "\n".join(context_entries)


def build_fallback_answer(question: str, resources: list[dict[str, Any]]) -> str:
    """
    Constructs a grounded, deterministic fallback answer from retrieved resources
    when the Gemini API is temporarily unconfigured, offline, or rate-limited.
    """
    if not resources:
        return INSUFFICIENT_INFO_ANSWER

    lines = [
        f"Based on the platform's indexed records, {len(resources)} relevant source(s) were identified for your inquiry:\n"
    ]
    for idx, res in enumerate(resources, 1):
        title = res.get("title", "Untitled")
        abstract = (res.get("abstract") or "").strip()
        lines.append(f"- [{idx}] **{title}**: {abstract}")

    lines.append(
        "\n*(Synthesized from indexed platform metadata; generative AI model is operating in resilient fallback mode.)*"
    )
    return "\n".join(lines)


def generate_rag_answer(
    question: str,
    resources: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Takes a user question and top retrieved resource dicts, constructs a grounded
    RAG prompt for Gemini, calls the text generation API, and returns the generated
    answer with explicit source citations and disclaimer.
    """
    clean_question = (question or "").strip()
    if not clean_question:
        return {
            "question": "",
            "answer": INSUFFICIENT_INFO_ANSWER,
            "sources": [],
            "disclaimer": DISCLAIMER_TEXT,
            "provider": "grounded_validation",
        }

    # Format structured sources for client response
    sources = [
        {
            "id": str(r.get("id")),
            "title": r.get("title", ""),
            "resource_type": r.get("resource_type", "resource"),
            "slug": r.get("slug"),
            "abstract": r.get("abstract"),
            "publisher": r.get("publisher"),
            "similarity_score": r.get("similarity_score"),
        }
        for r in resources
    ]

    # If no relevant resources retrieved, respond immediately
    if not resources:
        return {
            "question": clean_question,
            "answer": INSUFFICIENT_INFO_ANSWER,
            "sources": [],
            "disclaimer": DISCLAIMER_TEXT,
            "provider": "grounded_validation",
        }

    context_str = format_context_block(resources)
    prompt = ASSISTANT_PROMPT_TEMPLATE.format(
        context=context_str,
        question=clean_question,
    )

    api_key = get_effective_gemini_api_key()
    primary_model = getattr(settings, "gemini_text_model", "gemini-2.5-flash") or "gemini-2.5-flash"
    fallback_model = "gemini-1.5-flash"

    if api_key:
        try:
            from google import genai

            client = genai.Client(api_key=api_key)

            # Attempt with configured primary model (e.g. gemini-2.5-flash)
            try:
                response = client.models.generate_content(
                    model=primary_model,
                    contents=prompt,
                )
                if response and response.text:
                    return {
                        "question": clean_question,
                        "answer": response.text.strip(),
                        "sources": sources,
                        "disclaimer": DISCLAIMER_TEXT,
                        "provider": "gemini",
                    }
            except Exception as model_err:
                logger.warning(
                    f"[AssistantService] Primary model {primary_model} generation error: {model_err}. "
                    f"Retrying with fallback model {fallback_model}."
                )
                # Retry with stable fallback model
                response = client.models.generate_content(
                    model=fallback_model,
                    contents=prompt,
                )
                if response and response.text:
                    return {
                        "question": clean_question,
                        "answer": response.text.strip(),
                        "sources": sources,
                        "disclaimer": DISCLAIMER_TEXT,
                        "provider": "gemini",
                    }
        except Exception as err:
            logger.error(f"[AssistantService] Gemini text generation failed: {type(err).__name__}: {err}")

    # Fallback if Gemini is unconfigured, rate-limited, or failed
    fallback_answer = build_fallback_answer(clean_question, resources)
    return {
        "question": clean_question,
        "answer": fallback_answer,
        "sources": sources,
        "disclaimer": DISCLAIMER_TEXT,
        "provider": "platform_fallback",
    }
