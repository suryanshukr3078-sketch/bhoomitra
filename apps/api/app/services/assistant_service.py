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

ASSISTANT_PROMPT_TEMPLATE = """You are the official AI Evidence Search Assistant for the Bhoomitra Land Governance Platform.

=== BHOOMITRA PLATFORM KNOWLEDGE BASE ===
{platform_knowledge}

=== RELEVANT REPOSITORY EVIDENCE & SOURCES ===
{context}

=== INSTRUCTIONS ===
1. Answer the user's question accurately, authoritatively, comprehensively, and helpfully based on the Bhoomitra Platform Knowledge Base and the Grounding Evidence Records above.
2. For questions about the website, navigation, official workspaces, logins, institutional registration, evidence provenance, cadastral maps, or platform workflows:
   - Provide exact page links (e.g. /workspace/government, /login/researcher, /register, /maps, /evidence, /policies).
   - Explain the step-by-step workflow clearly and accurately.
3. For questions about land policies, cadastral boundaries, survey standards, research findings, or spatial data:
   - Synthesize the details clearly and cite the supporting Reference Resource(s) using their reference number marker (e.g., [1], [2]) or by mentioning the resource title directly.
4. If the question is completely off-topic and entirely unrelated to land governance, cadastral systems, or platform capabilities (such as cooking recipes, entertainment trivia, or unrelated pop culture):
   - State: "I don't have enough information in the platform repository to answer this question, as it is outside the scope of land governance, cadastral systems, and Bhoomitra platform records."
5. Format your response cleanly using markdown headings, bullet points, and highlighted URLs for maximum readability.

User Question:
{question}

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
    """
    Constructs a deeply accurate, grounded fallback answer synced with the website
    when Gemini API is temporarily offline or experiencing rate limits.
    """
    q = (question or "").lower()

    # 1. Registration & Institute inquiries
    if any(k in q for k in ["register", "institute", "signup", "institution", "academic", "onboard", "welcome"]):
        return (
            "### Institutional & User Registration on Bhoomitra\n\n"
            "On the Bhoomitra platform, **any accredited academic institute, university, research laboratory, "
            "government department, or civil society organization** can register without artificial limits.\n\n"
            "**Registration Procedure:**\n"
            "1. Visit the [Registration Portal](/register) from the main navigation.\n"
            "2. Select your institutional category (e.g. *Academic Institute*, *Government Body*, *Research Lab*, or *Civil Society*).\n"
            "3. Fill in your institutional credentials, registration number, official administrator name, and official email address.\n"
            "4. **Automated Welcome Email**: Upon submission, a verified welcome email is instantly dispatched to your registered address with security verification credentials.\n"
            "5. Your category-specific official workspace is provisioned immediately."
        )

    # 2. Login pages inquiries
    if any(k in q for k in ["login", "sign in", "portal", "log in"]):
        return (
            "### Official Login Portals on Bhoomitra\n\n"
            "Bhoomitra provides dedicated, secure login portals tailored for each official category:\n\n"
            "- **Universal Sign In Hub**: [/login](/login)\n"
            "- **Government Agency Login**: [/login/government](/login/government)\n"
            "- **Researcher GIS Lab Login**: [/login/researcher](/login/researcher)\n"
            "- **Policy Maker Login**: [/login/policymaker](/login/policymaker)\n"
            "- **Civil Society Login**: [/login/civil-society](/login/civil-society)\n"
            "- **Platform Admin Login**: [/login/admin](/login/admin)"
        )

    # 3. Workspaces inquiries
    if any(k in q for k in ["workspace", "portal", "dashboard", "roles"]):
        return (
            "### Bhoomitra Official Workspaces\n\n"
            "Stakeholders have role-specific workspaces equipped with domain tools:\n\n"
            "1. **Government Agency Workspace** ([/workspace/government](/workspace/government)): Review and approve cadastral mutation deeds, verify DGPS survey data, and enforce state land revenue mandates.\n"
            "2. **Researcher GIS Lab Workspace** ([/workspace/researcher](/workspace/researcher)): Conduct spatial topology modeling, analyze forest land tenure overlaps, and publish peer-reviewed papers with verified publisher affiliations.\n"
            "3. **Policy Directorate Workspace** ([/workspace/policymaker](/workspace/policymaker)): Draft and gazette statutory policies, track public consultations, and assess tenure impacts.\n"
            "4. **Civil Society Desk Workspace** ([/workspace/civil-society](/workspace/civil-society)): Monitor Community Forest Rights (CFR) titles under the Forest Rights Act (FRA) and file boundary rectification petitions.\n"
            "5. **Admin Management** ([/admin](/admin)): Institutional approvals, role assignments, security telemetry, and cryptographic ledger inspection."
        )

    # 4. Maps & GIS inquiries
    if any(k in q for k in ["map", "spatial", "gis", "cadastral map", "layer", "geojson", "shapefile"]):
        return (
            "### Cadastral Maps & Spatial Datasets\n\n"
            "- **Interactive Cadastral Maps** ([/maps](/maps)): High-performance spatial parcel viewer powered by MapLibre GL. Visualizes boundary polygons, topological vertices, and land classifications in real time.\n"
            "- **Open GIS Datasets** ([/datasets](/datasets)): Access downloadable GeoJSON and Shapefile boundaries validated against PostGIS topological invariants."
        )

    # 5. Evidence & Provenance inquiries
    if any(k in q for k in ["evidence", "dag", "provenance", "hash", "sha256", "ledger"]):
        return (
            "### Cryptographic Evidence & Provenance Trail\n\n"
            "Bhoomitra maintains an immutable Directed Acyclic Graph (DAG) provenance trail at [/evidence](/evidence).\n"
            "Every cadastral parcel mutation deed and policy is anchored with an immutable SHA-256 cryptographic hash, "
            "tracking upstream survey dependencies and downstream automated PostGIS topological verification (0.00% boundary overlap tolerance)."
        )

    # 6. PostGIS & Boundary Invariants
    if any(k in q for k in ["postgis", "boundary", "topology", "overlap", "dispute", "polygon"]):
        resp = [
            "### PostGIS Cadastral Topological Verification Standards\n\n"
            "Bhoomitra utilizes an automated PostGIS topological validation pipeline to eliminate boundary disputes:\n"
            "- **Zero-Overlap Invariant**: Enforces strict mathematical disjointness (`ST_Overlaps = FALSE`) across adjoining cadastral parcels.\n"
            "- **Geometric Integrity**: Validates polygon closure and vertex ordering (`ST_IsValid = TRUE`).\n"
            "- **Spatial Coordinates**: Standardized on EPSG:4326 (WGS 84) coordinate submission with DGPS and drone photogrammetry verification.\n"
        ]
        if resources:
            resp.append("\n**Supporting Platform Evidence:**")
            for idx, r in enumerate(resources[:3], 1):
                resp.append(f"- [{idx}] **{r.get('title')}** ({r.get('resource_type')}): {r.get('abstract')}")
        return "\n".join(resp)

    # 7. Generic inquiry with resources
    if resources:
        lines = [
            f"Based on the Bhoomitra platform repository, {len(resources)} relevant source(s) were identified for your inquiry:\n"
        ]
        for idx, res in enumerate(resources, 1):
            title = res.get("title", "Untitled")
            abstract = (res.get("abstract") or "").strip()
            lines.append(f"- [{idx}] **{title}**: {abstract}")
        return "\n".join(lines)

    # 8. Unrelated inquiry
    return INSUFFICIENT_INFO_ANSWER


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
    primary_model = getattr(settings, "gemini_text_model", "gemini-3.6-flash") or "gemini-3.6-flash"
    candidate_models = [
        primary_model,
        "gemini-3.6-flash",
        "gemini-2.0-flash",
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

    # Fallback path if Gemini API is rate-limited or unconfigured
    fallback_answer = build_fallback_answer(clean_question, resources)
    return {
        "question": clean_question,
        "answer": fallback_answer,
        "sources": sources,
        "disclaimer": DISCLAIMER_TEXT,
        "provider": "platform_grounded",
    }
