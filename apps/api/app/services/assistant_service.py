import logging
from typing import Any

from app.core.config import settings
from app.core.knowledge_base import BHOOMITRA_PLATFORM_KNOWLEDGE
from app.services.embedding_service import get_effective_gemini_api_key

logger = logging.getLogger("bhoomitra.assistant")

DISCLAIMER_TEXT: str = (
    "This answer is AI-generated from platform data and is not an official government determination. "
    "Always verify with primary sources."
)

INSUFFICIENT_INFO_ANSWER: str = (
    "I don't have enough information in the platform repository to answer this question, "
    "as it is outside the scope of land governance, cadastral systems, and Bhoomitra platform records."
)

ASSISTANT_PROMPT_TEMPLATE = """You are the official AI assistant for the Bhoomitra Land Governance Platform. Answer questions about land governance, cadastral systems, platform features, and related research.

=== PLATFORM KNOWLEDGE ===
{platform_knowledge}

=== RELEVANT EVIDENCE ===
{context}

=== RESPONSE RULES ===
- Be SHORT and DIRECT. Lead with the answer immediately — no preamble.
- Simple questions: answer in 1–3 sentences max.
- Complex questions: use a short bullet list (max 5 bullets), no verbose explanations.
- Include a page link (e.g. /maps, /policies) only if directly relevant.
- Cite sources with [1], [2] only when specific evidence is referenced.
- Never repeat the question back. Never add fluff or sign-offs.
- If off-topic (unrelated to land governance or this platform): reply with exactly "That's outside my scope. I only cover land governance and the Bhoomitra platform."

Question: {question}

Answer:"""


def format_context_block(resources: list[dict[str, Any]]) -> str:
    """
    Formats a list of retrieved resource dicts into a structured context string for prompting.
    """
    if not resources:
        return "No specific repository records matched this query. Refer to platform knowledge."

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
    q = (question or "").lower()

    if any(k in q for k in ["register", "sign up", "onboard", "enroll", "registration"]):
        return (
            "Register at [/register](/register). Choose your category (Academic, Government, Research Lab, Civil Society), "
            "fill in your institutional details, and submit. A welcome email is sent instantly and your workspace is provisioned."
        )

    if any(k in q for k in ["login", "sign in", "log in"]):
        return (
            "Sign in at [/login](/login). Role-specific portals: "
            "[/login/government](/login/government), [/login/researcher](/login/researcher), "
            "[/login/policymaker](/login/policymaker), [/login/civil-society](/login/civil-society)."
        )

    if any(k in q for k in ["workspace", "dashboard", "portal"]):
        return (
            "Bhoomitra has 5 workspaces: **Government** ([/workspace/government](/workspace/government)), "
            "**Researcher** ([/workspace/researcher](/workspace/researcher)), "
            "**Policy** ([/workspace/policymaker](/workspace/policymaker)), "
            "**Civil Society** ([/workspace/civil-society](/workspace/civil-society)), "
            "and **Admin** ([/admin](/admin))."
        )

    if resources:
        lines = [f"Found {len(resources)} relevant source(s):"]
        for idx, res in enumerate(resources, 1):
            title = res.get("title", "Untitled")
            abstract = (res.get("abstract") or "").strip()
            short_abstract = abstract[:120] + "..." if len(abstract) > 120 else abstract
            lines.append(f"[{idx}] **{title}**: {short_abstract}")
        return "\n".join(lines)

    if any(k in q for k in ["land", "cadastr", "survey", "mutation", "policy", "forest", "tenure", "title", "deed"]):
        return (
            "Bhoomitra indexes cadastral records, land policies, and spatial data. "
            "Search [/policies](/policies), [/research](/research), or [/maps](/maps) for specifics."
        )

    return "That's outside my scope. I only cover land governance and the Bhoomitra platform."


def generate_rag_answer(
    question: str,
    resources: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Takes a user question and retrieved resource dicts, constructs a grounded
    RAG prompt for Gemini with complete platform knowledge, calls the text generation
    API, and returns the generated answer with explicit source citations and disclaimer.
    """
    clean_question = (question or "").strip()
    if not clean_question:
        return {
            "question": "",
            "answer": "Please enter a question about land governance, cadastral boundaries, or Bhoomitra platform features.",
            "sources": [],
            "disclaimer": DISCLAIMER_TEXT,
            "provider": "grounded_validation",
        }

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
        platform_knowledge=BHOOMITRA_PLATFORM_KNOWLEDGE.strip(),
        context=context_str,
        question=clean_question,
    )

    api_key = get_effective_gemini_api_key()
    primary_model = getattr(settings, "gemini_text_model", "gemini-3.7-flash") or "gemini-3.7-flash"
    candidate_models = [
        primary_model,
        "gemini-3.7-flash",
        "gemini-flash-latest",
        "gemini-3.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-3.6-flash",
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

    # Fallback path if Gemini API is rate-limited or unconfigured
    fallback_answer = build_fallback_answer(clean_question, resources)
    return {
        "question": clean_question,
        "answer": fallback_answer,
        "sources": sources,
        "disclaimer": DISCLAIMER_TEXT,
        "provider": "platform_grounded",
    }
