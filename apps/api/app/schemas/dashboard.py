from typing import Any
from pydantic import BaseModel, ConfigDict


class ResearchMetrics(BaseModel):
    total_papers: int
    peer_reviewed_count: int
    open_access_count: int
    total_citations: int
    top_themes: list[dict[str, Any]]
    publication_velocity_yearly: list[dict[str, Any]]


class PolicyMetrics(BaseModel):
    total_policies: int
    enacted_count: int
    under_review_count: int
    draft_count: int
    repealed_count: int
    compliance_index_pct: float
    jurisdiction_breakdown: list[dict[str, Any]]
    key_reform_areas: list[dict[str, Any]]


class LandUseMetrics(BaseModel):
    total_area_hectares: float
    agricultural_pct: float
    urban_builtup_pct: float
    forest_conservation_pct: float
    commercial_industrial_pct: float
    water_bodies_pct: float
    conversion_trends_5yr: list[dict[str, Any]]


class ClimateResilienceMetrics(BaseModel):
    coastal_vulnerability_index: float
    flood_risk_overlay_hectares: float
    agro_ecological_protection_pct: float
    soil_carbon_retention_rating: str
    drought_resilience_score: float
    high_risk_zones_count: int
    conservation_reserves_count: int


class DisputeMetrics(BaseModel):
    total_disputes: int
    resolved_disputes: int
    pending_disputes: int
    resolution_rate_pct: float
    average_resolution_days: int
    dispute_categories: list[dict[str, Any]]
    resolution_mechanism: list[dict[str, Any]]
    sensitive_details_masked: bool = True
    hotspots: list[dict[str, Any]] | None = None


class ProjectOutcomeMetrics(BaseModel):
    total_active_projects: int
    drone_surveyed_villages: int
    target_villages: int
    drone_survey_completion_pct: float
    property_cards_distributed: int
    digital_mutation_avg_days: float
    baseline_mutation_days: float
    key_schemes: list[dict[str, Any]]


class GeospatialMetrics(BaseModel):
    total_parcels_digitized: int
    total_surveyed_sq_km: float
    rtk_gps_precision_pct: float
    boundary_topology_consistency_pct: float
    coordinate_reference_systems: list[str]
    active_map_layers_count: int
    boundary_mutations_processed: int


class RolePermissions(BaseModel):
    role: str
    is_authenticated: bool
    can_view_sensitive_disputes: bool
    can_export_raw_geospatial: bool
    can_view_agency_audits: bool
    can_submit_data: bool
    access_tier: str


class DashboardOverviewResponse(BaseModel):
    permissions: RolePermissions
    research: ResearchMetrics
    policy: PolicyMetrics
    land_use: LandUseMetrics
    climate: ClimateResilienceMetrics
    disputes: DisputeMetrics
    projects: ProjectOutcomeMetrics
    geospatial: GeospatialMetrics
    last_updated: str
    cached: bool = False

    model_config = ConfigDict(from_attributes=True)
