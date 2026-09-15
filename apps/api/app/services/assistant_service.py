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

ASSISTANT_PROMPT_TEMPLATE = """You are the helpful, friendly AI assistant for the Bhoomitra Land Governance Platform.

=== PLATFORM KNOWLEDGE ===
{platform_knowledge}

=== RELEVANT EVIDENCE ===
{context}

=== STRICT LANGUAGE & TONE RULES ===
1. USE SIMPLE, PLAIN LANGUAGE:
   - Do NOT use complex academic words, legal jargon, or stiff bureaucratic language (never say words like "utilize", "statutory mandates", "accredited registration", "spatial topology modeling", "cryptographic provenance ledger", "immutable SHA-256").
   - Explain everything simply, clearly, and conversationally, like explaining to a student or team member.
2. SHORT & TO THE POINT:
   - Maximum 2 to 4 short bullet points or 2 to 3 sentences total.
   - Lead directly with the exact answer. No greetings, no fluff, no long introductions.
3. HOW TO PUBLISH / UPLOAD / CONTRIBUTE PAPERS OR DATA:
   - If asked how to publish, upload, or contribute a research paper, dataset, or policy:
     Always give this simple 3-step answer:
     1. Log in at [/login](/login).
     2. In your **[Dashboard](/dashboard)**, click the **[Contribute](/dashboard?tab=contribute)** tab.
     3. Fill in the title, upload your file (PDF, etc.), and click **Publish to Registry**.
     Your paper is published immediately and appears under [/research](/research)!
4. BILINGUAL / HINGLISH SUPPORT:
   - If the user asks in Hindi or Hinglish, answer in simple, natural Hinglish/Hindi.
   - If the user asks in English, answer in simple, plain English.
5. OUT OF SCOPE:
   - If completely unrelated to land governance or Bhoomitra, reply: "I can only help with questions about the Bhoomitra platform and land governance."

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

    if any(k in q for k in ["publish", "upload", "contribute", "paper", "submit", "post"]):
        return (
            "To publish a research paper or document:\n"
            "1. Log in at [/login](/login).\n"
            "2. In your **[Dashboard](/dashboard)**, click the **[Contribute](/dashboard?tab=contribute)** tab.\n"
            "3. Fill in the title, upload your file (PDF, GeoJSON, etc.), and click **Publish to Registry**.\n"
            "Your paper will immediately appear in the [/research](/research) registry!"
        )

    if any(k in q for k in ["register", "sign up", "onboard", "enroll", "registration"]):
        return (
            "To register an account:\n"
            "1. Visit [/register](/register).\n"
            "2. Select your category (Academic, Government, Research Lab, Civil Society).\n"
            "3. Fill in your details and submit. Your workspace is ready immediately."
        )

    if any(k in q for k in ["login", "sign in", "log in"]):
        return (
            "You can log in at [/login](/login).\n"
            "Direct portals: [/login/researcher](/login/researcher) (Researchers), "
            "[/login/government](/login/government) (Government), [/login/policymaker](/login/policymaker) (Policy Makers)."
        )

    if any(k in q for k in ["workspace", "dashboard", "portal"]):
        return (
            "Available workspaces:\n"
            "- **Researcher GIS Lab**: [/workspace/researcher](/workspace/researcher)\n"
            "- **Government Agency**: [/workspace/government](/workspace/government)\n"
            "- **Policy Directorate**: [/workspace/policymaker](/workspace/policymaker)\n"
            "- **Civil Society**: [/workspace/civil-society](/workspace/civil-society)\n"
            "- **Official Dashboard**: [/dashboard](/dashboard)"
        )

    if resources:
        lines = [f"Found {len(resources)} relevant record(s):"]
        for idx, res in enumerate(resources[:3], 1):
            title = res.get("title", "Untitled")
            abstract = (res.get("abstract") or "").strip()
            short_abstract = abstract[:100] + "..." if len(abstract) > 100 else abstract
            lines.append(f"[{idx}] **{title}**: {short_abstract}")
        return "\n".join(lines)

    if any(k in q for k in ["land", "cadastr", "survey", "mutation", "policy", "forest", "tenure", "title", "deed"]):
        return (
            "Bhoomitra indexes land policies, cadastral maps, and research papers. "
            "Explore [/policies](/policies), [/research](/research), or [/maps](/maps) for details."
        )

    return "I can only help with questions about the Bhoomitra platform and land governance."


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
    primary_model = getattr(settings, "gemini_text_model", "gemini-2.0-flash") or "gemini-2.0-flash"
    candidate_models = [
        primary_model,
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-2.5-flash-preview-05-20",
    ]
    seen = set()
    unique_models = [m for m in candidate_models if m and not (m in seen or seen.add(m))]

    if api_key:
        try:
            from google import genai

            try:
                client = genai.Client(api_key=api_key, http_options={"timeout": 5000})
            except Exception:
                client = genai.Client(api_key=api_key)

            # Restrict to at most 2 fast, reliable models to stay strictly within serverless budget
            models_to_try = [m for m in unique_models if m in ("gemini-2.0-flash", "gemini-1.5-flash")][:2]
            if not models_to_try:
                models_to_try = unique_models[:2]

            for model_candidate in models_to_try:
                try:
                    from google.genai import types as genai_types
                    gen_config = genai_types.GenerateContentConfig(
                        max_output_tokens=300,
                        temperature=0.2,
                    )
                    response = client.models.generate_content(
                        model=model_candidate,
                        contents=prompt,
                        config=gen_config,
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
