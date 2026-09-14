export type DimensionTab =
  | 'all'
  | 'research'
  | 'policy'
  | 'land_use'
  | 'climate'
  | 'disputes'
  | 'projects'
  | 'geospatial';

export interface ResearchMetrics {
  total_papers: number;
  peer_reviewed_count: number;
  open_access_count: number;
  total_citations: number;
  top_themes: Array<{ theme: string; count: number; share_pct: number }>;
  publication_velocity_yearly: Array<{ year: string; publications: number; citations: number }>;
}

export interface PolicyMetrics {
  total_policies: number;
  enacted_count: number;
  under_review_count: number;
  draft_count: number;
  repealed_count: number;
  compliance_index_pct: number;
  jurisdiction_breakdown: Array<{ jurisdiction: string; count: number; enacted: number }>;
  key_reform_areas: Array<{ area: string; status: string; progress_pct: number }>;
}

export interface LandUseMetrics {
  total_area_hectares: number;
  agricultural_pct: number;
  urban_builtup_pct: number;
  forest_conservation_pct: number;
  commercial_industrial_pct: number;
  water_bodies_pct: number;
  conversion_trends_5yr: Array<{
    period: string;
    agricultural_to_urban_ha: number;
    conservation_gain_ha: number;
  }>;
}

export interface ClimateResilienceMetrics {
  coastal_vulnerability_index: number;
  flood_risk_overlay_hectares: number;
  agro_ecological_protection_pct: number;
  soil_carbon_retention_rating: string;
  drought_resilience_score: number;
  high_risk_zones_count: number;
  conservation_reserves_count: number;
}

export interface DisputeMetrics {
  total_disputes: number;
  resolved_disputes: number;
  pending_disputes: number;
  resolution_rate_pct: number;
  average_resolution_days: number;
  dispute_categories: Array<{ category: string; count: number; share_pct: number }>;
  resolution_mechanism: Array<{ mechanism: string; cases_resolved: number; share_pct: number }>;
  sensitive_details_masked: boolean;
  hotspots?: Array<{
    hotspot_id: string;
    district: string;
    tehsil: string;
    active_cases: number;
    critical_flag: boolean;
  }>;
}

export interface ProjectOutcomeMetrics {
  total_active_projects: number;
  drone_surveyed_villages: number;
  target_villages: number;
  drone_survey_completion_pct: number;
  property_cards_distributed: number;
  digital_mutation_avg_days: number;
  baseline_mutation_days: number;
  key_schemes: Array<{
    scheme_name: string;
    focus: string;
    progress_pct: number;
    status: string;
  }>;
}

export interface GeospatialMetrics {
  total_parcels_digitized: number;
  total_surveyed_sq_km: number;
  rtk_gps_precision_pct: number;
  boundary_topology_consistency_pct: number;
  coordinate_reference_systems: string[];
  active_map_layers_count: number;
  boundary_mutations_processed: number;
}

export interface RolePermissions {
  role: string;
  is_authenticated: boolean;
  can_view_sensitive_disputes: boolean;
  can_export_raw_geospatial: boolean;
  can_view_agency_audits: boolean;
  can_submit_data: boolean;
  access_tier: string;
}

export interface DashboardOverview {
  permissions: RolePermissions;
  research: ResearchMetrics;
  policy: PolicyMetrics;
  land_use: LandUseMetrics;
  climate: ClimateResilienceMetrics;
  disputes: DisputeMetrics;
  projects: ProjectOutcomeMetrics;
  geospatial: GeospatialMetrics;
  last_updated: string;
  cached: boolean;
}
