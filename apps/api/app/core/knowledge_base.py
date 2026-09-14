"""
Bhoomitra Platform Comprehensive Knowledge Base
Synced with the live web platform at https://web-rho-gules-89.vercel.app
"""

BHOOMITRA_PLATFORM_KNOWLEDGE: str = """
=== BHOOMITRA PLATFORM KNOWLEDGE BASE & SYSTEM DOCUMENTATION ===

1. PLATFORM MISSION & IDENTITY:
- Name: Bhoomitra (National Land Governance & Cadastral Administration Platform).
- Purpose: India's sovereign digital infrastructure for land tenure security, automated cadastral boundary verification, evidence-based policy research, and transparent land administration.
- Live Frontend: https://web-rho-gules-89.vercel.app
- Live Backend API: https://land-governance-platform-virid.vercel.app/api/v1

2. OFFICIAL WORKSPACES & ROLES:
Bhoomitra provides dedicated, role-tailored workspaces for all stakeholders in land governance:
- Government Agency Workspace (/workspace/government):
  * For revenue officers, sub-registrars, and state land records directorates.
  * Capabilities: Review and approve cadastral mutation deeds, verify DGPS survey data, enforce statutory land revenue mandates, and resolve boundary disputes.
- Researcher GIS Lab Workspace (/workspace/researcher):
  * For academic institutions, university faculties, geospatial researchers, and data scientists.
  * Capabilities: Conduct spatial topology modeling, analyze forest land tenure overlaps, publish peer-reviewed papers with verified publisher affiliations, and download GeoJSON datasets.
- Policy Directorate Workspace (/workspace/policymaker):
  * For legislative analysts, ministry officials, and legal authorities.
  * Capabilities: Draft and gazette statutory policies, track public consultations, assess policy impacts on agricultural credit and tribal tenure, and publish official directives.
- Civil Society Desk Workspace (/workspace/civil-society):
  * For non-governmental organizations (NGOs), grassroots advocates, and tribal rights committees.
  * Capabilities: Monitor Community Forest Rights (CFR) titles under the Forest Rights Act (FRA), file boundary grievance petitions, and audit parcel demarcation.
- Admin Management Portal (/admin):
  * For platform system administrators.
  * Capabilities: Review institutional registration requests, audit user role permissions, monitor system security telemetry, manage API rate limits, and inspect provenance ledgers.

3. DEDICATED CATEGORY LOGIN PORTALS:
Every user and official body has an authentic dedicated login portal:
- Universal Sign In Hub: /login
- Government Agency Login: /login/government
- Researcher Login: /login/researcher
- Policy Maker Login: /login/policymaker
- Civil Society Login: /login/civil-society
- Platform Admin Login: /login/admin

4. REGISTRATION & ONBOARDING SYSTEM (/register):
- Open Institutional Registration: ANY type of academic institute, university, research laboratory, government body, or civil society organization can register without artificial restrictions.
- Registration Workflow:
  1. Access /register from the navigation bar.
  2. Select your category (Academic Institute, Government Agency, Research Lab, Civil Society, etc.).
  3. Fill in official institution details, accredited registration number, official administrator contact, and email.
  4. Automatic Welcome Email: Upon registration, an automated welcome email is instantly dispatched to the registered Gmail/email address containing onboarding credentials and security verification.
  5. Official workspace access is immediately provisioned based on the registered category.

5. PUBLIC REGISTRIES & CORE MODULES:
- Research Papers (/research):
  * Academic and technical literature on cadastral science, land administration, and spatial economics.
  * Mandatory Metadata: Includes publication title, authors, verified publisher name (e.g., NRSC, ISRO, Survey Directorate), DOI, publication date, peer-review verification status, and direct PDF/data downloads.
- Statutory Policies (/policies):
  * State and national land legislation, revenue codes, and gazette notifications (e.g., Maharashtra Land Revenue Code Sec. 148, National Digital Cadastre Directive 2026).
  * Metadata: Policy number, issuing authority, jurisdiction (state/national), lifecycle status (active, draft, consultation, superseded), and full statutory summary.
- Open GIS Datasets (/datasets):
  * Geospatial vector layers, parcel polygons, and drone photogrammetry surveys.
  * Formats: GeoJSON, Shapefile, GeoTIFF, and PostGIS geometry streams.
- Interactive Cadastral Maps (/maps):
  * High-performance spatial inspection engine using MapLibre GL.
  * Visualizes parcel boundaries, survey tokens, topological vertices, and land classification overlays in real time.
- Evidence & Provenance Trail (/evidence):
  * Cryptographic Directed Acyclic Graph (DAG) provenance ledger.
  * Every cadastral parcel, mutation deed, and policy has an immutable SHA-256 hash.
  * Visualizes upstream dependencies (data sources, survey acts) and downstream verification (automated PostGIS topological validation).
- Governance Dashboard (/dashboard):
  * Real-time metrics on active statutory policies, verified cadastral parcels, research studies, and system health status.
- Evidence Search Assistant (/assistant):
  * RAG-powered legal and technical AI assistant grounded directly in platform evidence records.
  * Incorporates SlowAPI rate limiting (10 req/min per IP) and persistent legal disclaimers.

6. CADASTRAL GIS & POSTGIS TOPOLOGICAL INTEGRITY STANDARDS:
- PostGIS Automated Boundary Invariant Engine:
  * Enforces zero-overlap tolerance (ST_Overlaps = FALSE, ST_Intersects boundary checks).
  * Verifies parcel boundary geometry validity (ST_IsValid = TRUE).
  * Coordinates in EPSG:4326 (WGS 84) and EPSG:3857.
  * Ensures adjoining title deeds have mathematical consistency to prevent fraudulent duplicate titles or boundary encroachments.
- Forest Rights & Customary Tenure (FRA 2006):
  * Demarcation of Individual Forest Rights (IFR) and Community Forest Resource (CFR) rights.
  * Requires Gram Sabha boundary resolution, DGPS/GPS boundary demarcation, and reconciliation with jurisdictional state forest department cadastral boundaries.
- Drone Photogrammetry Cadastral Surveys:
  * High-resolution (sub-10cm GSD) orthomosaic mapping for rural tehsils and Gaothan settlements.
  * Provides accurate coordinates for boundary mutation and title formalization.
"""
