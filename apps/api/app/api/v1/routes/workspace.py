from datetime import UTC, datetime, timezone
from typing import Any, Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies.auth import get_optional_current_user
from app.api.dependencies.db import get_db
from app.models.enums import ResourceType
from app.models.identity import User
from app.models.resources import Resource, ResearchPaper, Policy

router = APIRouter(prefix="/workspace", tags=["Workspaces"])


# ==========================================
# Pydantic Request & Response Schemas
# ==========================================

class MutationActionRequest(BaseModel):
    action: Literal["approve", "reject", "request_survey"]
    remarks: str = Field(..., min_length=3, max_length=500)
    officer_pin: str | None = Field(default=None, max_length=20)


class CreateGrievanceRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    category: Literal["fraudulent_mutation", "boundary_encroachment", "fra_denial", "compensation_delay", "other"]
    jurisdiction: str = Field(..., min_length=2, max_length=50)
    complainant_name: str = Field(..., min_length=2, max_length=100)
    complainant_contact: str = Field(..., min_length=5, max_length=100)
    description: str = Field(..., min_length=20, max_length=2000)
    parcel_id: str | None = Field(default=None, max_length=100)


# In-memory demo store for mutable items in serverless sessions
_DEMO_MUTATIONS = [
    {
        "id": "mut-001",
        "deed_number": "DEED-MH-2026-88910",
        "jurisdiction": "IN-MH-PUN",
        "seller_name": "Rameshwar G. Patil",
        "buyer_name": "Ananya K. Deshmukh",
        "parcel_id": "PAR-PUN-HAV-0442",
        "survey_number": "44/2-A",
        "area_sqm": 2450.0,
        "mutation_type": "Sale Deed Transfer",
        "consideration_inr": 4850000,
        "status": "pending_officer_review",
        "flagged_overlap": False,
        "created_at": "2026-09-12T08:30:00Z",
        "ledger_hash": "0x4a9b...f821",
    },
    {
        "id": "mut-002",
        "deed_number": "DEED-MH-2026-88914",
        "jurisdiction": "IN-MH-PUN",
        "seller_name": "Balwant S. Shinde (Estate)",
        "buyer_name": "Sunita B. Shinde & Prakash B. Shinde",
        "parcel_id": "PAR-PUN-MUL-0189",
        "survey_number": "18/9-C",
        "area_sqm": 5800.0,
        "mutation_type": "Succession & Partition",
        "consideration_inr": 0,
        "status": "pending_officer_review",
        "flagged_overlap": False,
        "created_at": "2026-09-13T11:15:00Z",
        "ledger_hash": "0x8e2c...d194",
    },
    {
        "id": "mut-003",
        "deed_number": "DEED-MH-2026-88921",
        "jurisdiction": "IN-MH-PUN",
        "seller_name": "Greenfield Agro Ventures LLP",
        "buyer_name": "Western Logistics Infra Ltd",
        "parcel_id": "PAR-PUN-KHD-0912",
        "survey_number": "91/2",
        "area_sqm": 14200.0,
        "mutation_type": "Commercial Land Conversion",
        "consideration_inr": 28500000,
        "status": "flagged_overlap",
        "flagged_overlap": True,
        "overlap_details": "42 sqm overlap with adjoining State Highway PWD buffer reserve.",
        "created_at": "2026-09-14T04:45:00Z",
        "ledger_hash": "0x3f71...ac49",
    },
]

_DEMO_GRIEVANCES = [
    {
        "id": "grv-2026-0104",
        "title": "Unauthorized Mutation on Ancestral Agricultural Parcel 12/4",
        "category": "fraudulent_mutation",
        "jurisdiction": "IN-MH-PUN",
        "complainant_name": "Eknath Rao Gaikwad",
        "status": "escalated_to_tahsildar",
        "priority": "high",
        "parcel_id": "PAR-PUN-HAV-0124",
        "created_at": "2026-09-10T14:20:00Z",
        "assigned_officer": "Sub-Divisional Officer (Revenue)",
    },
    {
        "id": "grv-2026-0112",
        "title": "Gram Sabha Community Forest Rights Title Pending Over 18 Months",
        "category": "fra_denial",
        "jurisdiction": "IN-MH-GAD",
        "complainant_name": "Adivasi Gram Sangathan (Bhamragad)",
        "status": "under_sdlc_review",
        "priority": "critical",
        "parcel_id": "CFR-GAD-BHM-008",
        "created_at": "2026-09-12T09:10:00Z",
        "assigned_officer": "District Collectorate Tribal Cell",
    },
]


# ==========================================
# 1. Government Official Workspace Endpoints
# ==========================================

@router.get("/government", summary="Fetch government cadastral operational workspace")
@router.get("/government/overview", summary="Fetch government cadastral operational workspace (overview alias)")
async def get_government_workspace(
    user: User | None = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    # Operational metrics
    pending_count = sum(1 for m in _DEMO_MUTATIONS if "pending" in m["status"] or "flagged" in m["status"])
    flagged_count = sum(1 for m in _DEMO_MUTATIONS if m.get("flagged_overlap"))

    return {
        "workspace_type": "government",
        "title": "Government Cadastral Administration & Revenue Court Workspace",
        "jurisdiction": "IN-MH-PUN (Pune Division Cadastral Jurisdiction)",
        "officer": {
            "name": user.full_name if user else "Nodal Sub-Divisional Magistrate",
            "email": user.email if user else "sdm.revenue@pune.gov.in",
            "cadastral_jurisdiction": "Pune Urban & Haveli Tehsil",
            "clearance_tier": "Official Statutory Clearance (Level-3)",
        },
        "summary": {
            "pending_mutations_count": pending_count,
            "boundary_exceptions_count": flagged_count,
            "active_disputes_count": 8,
            "svamitva_villages_completed": 142,
            "property_cards_dispatched_m": 1.48,
            "avg_mutation_turnaround_days": 3.4,
        },
        "pending_mutations": _DEMO_MUTATIONS,
        "cadastral_topology_flags": [
            {
                "id": "top-01",
                "parcel_a": "PAR-PUN-KHD-0912",
                "parcel_b": "PAR-PWD-SH27-BUF",
                "overlap_area_sqm": 42.18,
                "error_type": "Boundary Invariant Violation (Polygon Overlap)",
                "detected_at": "2026-09-14T04:45:00Z",
                "severity": "critical",
                "action_required": "Site inspection by Cadastral Surveyor required before title deed clearance.",
            },
            {
                "id": "top-02",
                "parcel_a": "PAR-PUN-HAV-0881",
                "parcel_b": "PAR-PUN-HAV-0882",
                "overlap_area_sqm": 1.45,
                "error_type": "Sliver Polygon Gap Invariant",
                "detected_at": "2026-09-13T16:20:00Z",
                "severity": "medium",
                "action_required": "Auto-snap vertex reconciliation within 0.05m tolerance threshold.",
            },
        ],
        "revenue_court_docket": [
            {
                "case_number": "RC/2026/PUN/0441",
                "suit_title": "Kulkarni vs. Land Acquisition Officer",
                "suit_type": "Compensation Apportionment & Cadastral Demarcation",
                "hearing_date": "2026-09-18",
                "hearing_stage": "Cross-examination of Surveyor RTK GPS Report",
                "priority": "high",
                "status": "scheduled",
            },
            {
                "case_number": "RC/2026/PUN/0449",
                "suit_title": "Gram Panchayat Wagholi vs. Infra Developers",
                "suit_type": "Gaikran (Common Pasture) Encroachment Injunction",
                "hearing_date": "2026-09-22",
                "hearing_stage": "Submission of Drone Demarcation Map",
                "priority": "critical",
                "status": "interim_stay_active",
            },
        ],
        "svamitva_drone_progress": {
            "total_target_villages": 185,
            "drone_flying_completed": 178,
            "maps_ground_truthed": 162,
            "inquiry_completed": 154,
            "cards_generated": 142,
            "completion_pct": 89.2,
        },
    }


@router.post("/government/mutations/{mutation_id}/action", summary="Approve or reject cadastral mutation")
async def action_government_mutation(
    mutation_id: str,
    payload: MutationActionRequest,
    user: User | None = Depends(get_optional_current_user),
) -> dict[str, Any]:
    target = None
    for m in _DEMO_MUTATIONS:
        if m["id"] == mutation_id or m["deed_number"] == mutation_id:
            target = m
            break

    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mutation record '{mutation_id}' not found in jurisdictional queue.",
        )

    new_status = "approved" if payload.action == "approve" else "rejected" if payload.action == "reject" else "survey_commissioned"
    target["status"] = new_status
    target["officer_action"] = {
        "action": payload.action,
        "officer": user.full_name if user else "Revenue Collector",
        "remarks": payload.remarks,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "ledger_transaction_id": f"tx-0x{uuid4().hex[:12]}",
    }

    return {
        "status": "success",
        "message": f"Mutation '{target['deed_number']}' transitioned to '{new_status}'.",
        "mutation": target,
    }


# ==========================================
# 2. Researcher & Academic Workspace
# ==========================================

@router.get("/researcher", summary="Fetch researcher & GIS lab workspace")
@router.get("/researcher/overview", summary="Fetch researcher & GIS lab workspace (overview alias)")
async def get_researcher_workspace(
    user: User | None = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    # Query database for published research resources
    result = await db.execute(
        select(Resource)
        .where(Resource.resource_type == ResourceType.RESEARCH_PAPER)
        .order_by(Resource.created_at.desc())
        .limit(10)
    )
    papers = result.scalars().all()

    papers_data = []
    for p in papers:
        papers_data.append({
            "id": str(p.id),
            "title": p.title,
            "publisher": p.publisher or "National Remote Sensing Centre (NRSC)",
            "status": p.status.value,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "doi": f"10.1016/landgov.{str(p.id)[:8]}",
        })

    return {
        "workspace_type": "researcher",
        "title": "Academic Research & Cadastral GIS Science Workbench",
        "researcher": {
            "name": user.full_name if user else "Senior GIS Research Scholar",
            "email": user.email if user else "researcher@isro.gov.in",
            "affiliation": "Cadastral Topology & Spatial Analytics Consortium",
            "orcid_id": "0000-0002-1825-0097",
        },
        "summary": {
            "total_papers_authored": max(len(papers_data), 14),
            "total_citations": 480,
            "active_gis_layers": 8,
            "topology_runs_passed": 98.4,
        },
        "papers": papers_data,
        "spatial_layers_workbench": [
            {
                "layer_id": "lyr-maha-cadastre-v2",
                "name": "Western Ghats Communal Agro-Forest Parcels",
                "format": "GeoJSON / FlatGeobuf",
                "crs": "EPSG:4326 (WGS 84)",
                "feature_count": 45120,
                "topology_status": "Verified - Zero Overlaps",
                "bounding_box": [73.41, 18.22, 74.15, 19.05],
                "last_validated": "2026-09-12T19:00:00Z",
            },
            {
                "layer_id": "lyr-deccan-soil-carbon",
                "name": "Soil Organic Carbon & Land Use Degradation Overlay",
                "format": "Cloud-Optimized GeoTIFF",
                "crs": "EPSG:32643 (UTM Zone 43N)",
                "resolution_m": 10.0,
                "topology_status": "Raster Ingest Complete",
                "last_validated": "2026-09-10T11:30:00Z",
            },
        ],
        "citation_benchmarks": [
            {"year": "2024", "citations": 85},
            {"year": "2025", "citations": 195},
            {"year": "2026 YTD", "citations": 200},
        ],
    }


# ==========================================
# 3. Policy Maker & Legislative Workspace
# ==========================================

@router.get("/policymaker", summary="Fetch policy maker & legislative workspace")
@router.get("/policymaker/overview", summary="Fetch policy maker & legislative workspace (overview alias)")
async def get_policymaker_workspace(
    user: User | None = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    # Query database for policy resources
    result = await db.execute(
        select(Resource)
        .where(Resource.resource_type == ResourceType.POLICY)
        .order_by(Resource.created_at.desc())
        .limit(10)
    )
    policies = result.scalars().all()

    policies_data = []
    for pol in policies:
        policies_data.append({
            "id": str(pol.id),
            "title": pol.title,
            "status": pol.status.value,
            "publisher": pol.publisher or "Ministry of Rural Development",
            "created_at": pol.created_at.isoformat() if pol.created_at else None,
        })

    return {
        "workspace_type": "policymaker",
        "title": "Policy Reform & Statutory Drafting Directorate",
        "official": {
            "name": user.full_name if user else "Principal Policy Advisor",
            "email": user.email if user else "advisor.landreform@gov.in",
            "ministry": "Ministry of Rural Development & Department of Land Resources",
            "clearance": "Legislative Drafter Clearance",
        },
        "summary": {
            "active_bills_drafting": 4,
            "enacted_regulations": max(len(policies_data), 42),
            "national_compliance_pct": 87.4,
            "public_consultations_active": 3,
        },
        "draft_bills": [
            {
                "bill_id": "BILL-2026-DILRRP-02",
                "title": "Model Conclusive Land Titling & Dispute Fast-Track Act, 2026",
                "stage": "Inter-Ministerial Consultation",
                "target_adoption_date": "2026-11-30",
                "consultation_comments_count": 284,
                "sentiment_positive_pct": 82.5,
            },
            {
                "bill_id": "BILL-2026-AGRI-LEASE",
                "title": "Agricultural Tenancy Security & Mutual Crop-Sharing Framework",
                "stage": "State Assembly Model Dissemination",
                "target_adoption_date": "2027-01-15",
                "consultation_comments_count": 412,
                "sentiment_positive_pct": 76.8,
            },
        ],
        "state_reform_scorecard": [
            {"state": "Maharashtra", "score": 92.4, "rank": 1, "ror_status": "100% Digitize", "mutation_days": 3.4},
            {"state": "Andhra Pradesh", "score": 89.8, "rank": 2, "ror_status": "99.2% Digitize", "mutation_days": 4.1},
            {"state": "Karnataka", "score": 88.5, "rank": 3, "ror_status": "98.5% Digitize", "mutation_days": 5.0},
            {"state": "Odisha", "score": 84.1, "rank": 4, "ror_status": "96.0% Digitize", "mutation_days": 6.8},
            {"state": "Madhya Pradesh", "score": 81.6, "rank": 5, "ror_status": "94.2% Digitize", "mutation_days": 7.2},
        ],
        "policies_catalog": policies_data,
    }


# ==========================================
# 4. Civil Society & Advocate Workspace
# ==========================================

@router.get("/civil-society", summary="Fetch civil society & grassroots advocate workspace")
@router.get("/civil-society/overview", summary="Fetch civil society & grassroots advocate workspace (overview alias)")
async def get_civil_society_workspace(
    user: User | None = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    return {
        "workspace_type": "civil_society",
        "title": "Civil Society, Community Tenure & Citizen Rights Desk",
        "advocate": {
            "name": user.full_name if user else "Grassroots Community Coordinator",
            "email": user.email if user else "advocate@landaction.org",
            "organization": "National Land Tenure Justice Network",
            "accreditation": "Accredited Non-Governmental Observer",
        },
        "summary": {
            "active_community_claims": 24,
            "citizen_grievances_tracked": len(_DEMO_GRIEVANCES),
            "encroachment_alerts_active": 6,
            "resolved_grievance_pct": 68.5,
        },
        "community_tenure_claims": [
            {
                "claim_id": "CFR-2026-FRA-088",
                "village_gram_sabha": "Mendha Lekha Gram Sabha",
                "district": "Gadchiroli (IN-MH)",
                "claimed_area_hectares": 1820.0,
                "claim_type": "Community Forest Rights (CFR) under FRA 2006",
                "status": "pending_dlc_approval",
                "filed_date": "2025-11-14",
                "days_in_review": 304,
            },
            {
                "claim_id": "CFR-2026-FRA-094",
                "village_gram_sabha": "Baraigram Pastoral Collective",
                "district": "Udaipur (IN-RJ)",
                "claimed_area_hectares": 940.0,
                "claim_type": "Customary Grazing Commons Protection",
                "status": "field_survey_scheduled",
                "filed_date": "2026-03-20",
                "days_in_review": 178,
            },
        ],
        "citizen_grievances": _DEMO_GRIEVANCES,
        "commons_encroachment_alerts": [
            {
                "alert_id": "ENC-2026-901",
                "wetland_commons_name": "Pashan Lake Catchment Commons",
                "jurisdiction": "Pune (IN-MH)",
                "detected_encroachment_ha": 3.8,
                "severity": "high",
                "satellite_verification": "Sentinel-2 NDVI Shift Confirmed",
                "action_status": "Magistrate Notice Issued",
            },
            {
                "alert_id": "ENC-2026-904",
                "wetland_commons_name": "Kengeri Grazing Pasture",
                "jurisdiction": "Bengaluru (IN-KA)",
                "detected_encroachment_ha": 2.1,
                "severity": "medium",
                "satellite_verification": "Surface Cover Anomaly Detected",
                "action_status": "Citizen Verification Docket Open",
            },
        ],
    }


@router.post("/civil-society/grievances", summary="Lodge citizen land grievance")
async def create_civil_society_grievance(
    payload: CreateGrievanceRequest,
    user: User | None = Depends(get_optional_current_user),
) -> dict[str, Any]:
    new_ticket = {
        "id": f"grv-2026-{str(uuid4().int)[:4]}",
        "title": payload.title,
        "category": payload.category,
        "jurisdiction": payload.jurisdiction,
        "complainant_name": payload.complainant_name,
        "complainant_contact": payload.complainant_contact,
        "description": payload.description,
        "parcel_id": payload.parcel_id,
        "status": "lodged_pending_intake",
        "priority": "medium",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "assigned_officer": "Jurisdictional Grievance Officer",
    }
    _DEMO_GRIEVANCES.insert(0, new_ticket)

    return {
        "status": "success",
        "message": f"Grievance ticket '{new_ticket['id']}' successfully created and queued for official scrutiny.",
        "ticket": new_ticket,
    }
