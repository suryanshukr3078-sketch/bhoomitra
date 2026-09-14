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
    "I don't have enough information in the platform repository to answer this question, "
    "as it is outside the scope of land governance and platform records."
)

ASSISTANT_PROMPT_TEMPLATE = """You are the official AI Evidence Search Assistant for the Bhoomitra Land Governance Platform.
Bhoomitra is India's Digital Land Governance and Cadastral Administration platform. It provides automated PostGIS topological verification for parcel boundaries, public registries for statutory policies, scientific research papers with verified publishers, and spatial GIS datasets. It also provides institutional registration for academic institutes, government agencies, civil society, and researchers with dedicated workspaces (/workspace/*) and registration (/register).

Your task is to provide an intelligent, accurate, authoritative, and helpful answer to the user's question, grounded in the platform's evidence records and land governance standards.

Instructions:
1. Answer the question directly, comprehensively, and constructively.
2. Ground your answer in the provided Reference Resources below whenever relevant:
   - For every factual claim, legal provision, survey method, or empirical finding derived from the Reference Resources, explicitly cite the supporting resource using its reference number marker (e.g., [1], [2]) or by mentioning the resource title directly.
3. If the user asks about platform features (such as how to register an institute or organization, official roles, cadastral workflows, or policy submission), provide clear, actionable guidance on using the Bhoomitra platform.
4. If the provided Reference Resources contain relevant or partial context, synthesize what the records show (with citations) and provide helpful land governance context.
5. ONLY if the question is completely off-topic and entirely unrelated to land governance, cadastral systems, or platform capabilities (such as cooking recipes, entertainment trivia, or sports), state:
"I don't have enough information in the platform repository to answer this question, as it is outside the scope of land governance and platform records."
6. Maintain an objective, authoritative, structured, and professional tone.

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
        return "No specific repository records matched this query."

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
    Constructs a grounded, helpful fallback answer when Gemini is offline or rate-limited.
    """
    q_lower = (question or "").lower()

    if any(term in q_lower for term in ["register", "institute", "organization", "signup", "onboard"]):
        return (
            "On the Bhoomitra Platform, all types of institutions—including Academic Institutes, Government Bodies, "
            "Research Laboratories, Civil Society Organizations, and Policymakers—can register through the official "
            "Registration Portal (/register).\n\n"
            "Steps to register:\n"
            "1. Navigate to the Register page (/register) from the top navigation.\n"
            "2. Select your institutional category (e.g. 'Academic Institute' or 'Government Agency').\n"
            "3. Provide your official institutional credentials, jurisdiction details, and contact email.\n"
            "4. Upon submission, an automated welcome notification is issued, and your official institutional workspace "
            "is provisioned with role-based access control."
        )

    if not resources:
        return (
            "Bhoomitra indexes statutory land policies, cadastral GIS layers, and peer-reviewed research. "
            "No specific repository documents were found matching your query keywords. "
            "Please try refining your search with terms like 'cadastral', 'mutation', 'boundary', 'PostGIS', or 'forest rights'."
        )

    lines = [
        f"Based on the platform's indexed records, {len(resources)} relevant source(s) were identified:\n"
    ]
    for idx, res in enumerate(resources, 1):
        title = res.get("title", "Untitled")
        abstract = (res.get("abstract") or "").strip()
        lines.append(f"- [{idx}] **{title}**: {abstract}")

    return "\n".join(lines)


def generate_rag_answer(
    question: str,
    resources: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Takes a user question and retrieved resource dicts, constructs a grounded
    RAG prompt for Gemini, calls the text generation API, and returns the generated
    answer with explicit source citations and disclaimer.
    """
    clean_question = (question or "").strip()
    if not clean_question:
        return {
            "question": "",
            "answer": "Please enter a question about land governance, cadastral boundaries, or platform features.",
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

    context_str = format_context_block(resources)
    prompt = ASSISTANT_PROMPT_TEMPLATE.format(
        context=context_str,
        question=clean_question,
    )

    api_key = get_effective_gemini_api_key()
    primary_model = getattr(settings, "gemini_text_model", "gemini-3.6-flash") or "gemini-3.6-flash"
    candidate_models = [
        primary_model,
        "gemini-3.6-flash",
        "gemini-2.0-flash",
        "gemini-2.5-flash",
        "gemini-1.5-flash",
    ]
    seen = set()
    unique_models = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

    if api_key:
        try:
            from google import genai

            client = genai.Client(api_key=api_key)

            for model_candidate in unique_models:
                try:
                    response = client.models.generate_content(
                        model=model_candidate,
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
                        f"[AssistantService] Model {model_candidate} error: {model_err}. Trying next candidate."
                    )
        except Exception as err:
            logger.error(f"[AssistantService] Gemini text generation client failed: {type(err).__name__}: {err}")

    # Fallback if Gemini is unconfigured, rate-limited, or failed
    fallback_answer = build_fallback_answer(clean_question, resources)
    return {
        "question": clean_question,
        "answer": fallback_answer,
        "sources": sources,
        "disclaimer": DISCLAIMER_TEXT,
        "provider": "platform_fallback",
    }
