export interface WatershedBasin {
  id: string;
  name: string;
  region: string;
  state: string;
  district: string;
  drainage_area_sq_km: number;
  priority: string;
  mean_annual_rainfall_mm: number;
  srishti_drishti_scene_id: string;
  interventions_count: number;
  water_storage_created_tcm: number;
  ndvi_trend_percent: number;
  centroid: [number, number];
  drainage_density_km_sqkm: number;
  soil_type: string;
  lead_agency: string;
}

export interface GeocodedImage {
  id: string;
  basin_id: string;
  intervention_type: string;
  title: string;
  village: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  azimuth_deg: number;
  date_captured: string;
  captured_by: string;
  photo_url: string;
  structural_health: string;
  storage_capacity_cum: number;
  siltation_level_percent: number;
  estimated_recharge_potential: string;
  vegetation_surround_delta: string;
  verified_by_satellite: boolean;
}

export const SEED_WATERSHED_BASINS: WatershedBasin[] = [
  {
    id: 'ws-bundelkhand-01',
    name: 'Betwa-Dhasan Micro-Watershed 4C2C',
    region: 'Bundelkhand',
    state: 'Uttar Pradesh',
    district: 'Jhansi',
    drainage_area_sq_km: 142.6,
    priority: 'Very High',
    mean_annual_rainfall_mm: 780,
    srishti_drishti_scene_id: 'SRISHTI-2026-L8-4C2C-0912',
    interventions_count: 34,
    water_storage_created_tcm: 420.5,
    ndvi_trend_percent: 18.4,
    centroid: [78.612, 25.438],
    drainage_density_km_sqkm: 2.84,
    soil_type: 'Bundelkhand Mixed Red & Black (Rakar/Kabar)',
    lead_agency: 'State Watershed Cell & DoLR PMKSY-WDC',
  },
  {
    id: 'ws-vidarbha-02',
    name: 'Wardha-Painganga Micro-Basin 5E1B',
    region: 'Vidarbha',
    state: 'Maharashtra',
    district: 'Yavatmal',
    drainage_area_sq_km: 198.2,
    priority: 'Critical',
    mean_annual_rainfall_mm: 890,
    srishti_drishti_scene_id: 'SRISHTI-2026-S2-5E1B-0819',
    interventions_count: 52,
    water_storage_created_tcm: 612.0,
    ndvi_trend_percent: 24.2,
    centroid: [78.132, 20.389],
    drainage_density_km_sqkm: 3.12,
    soil_type: 'Deep Black Cotton Soils (Vertisols)',
    lead_agency: 'Vasantrao Naik Watershed Mission',
  },
  {
    id: 'ws-rayalaseema-03',
    name: 'Pennar Tributary Catchment 4B3A',
    region: 'Rayalaseema',
    state: 'Andhra Pradesh',
    district: 'Anantapur',
    drainage_area_sq_km: 165.4,
    priority: 'Very High',
    mean_annual_rainfall_mm: 540,
    srishti_drishti_scene_id: 'SRISHTI-2026-L8-4B3A-0730',
    interventions_count: 48,
    water_storage_created_tcm: 385.2,
    ndvi_trend_percent: 14.8,
    centroid: [77.598, 14.681],
    drainage_density_km_sqkm: 2.45,
    soil_type: 'Red Sandy Loams (Alfisols)',
    lead_agency: 'AP Department of Watershed Development',
  },
  {
    id: 'ws-saurashtra-04',
    name: 'Bhadar River Upper Watershed 5F2A',
    region: 'Saurashtra',
    state: 'Gujarat',
    district: 'Amreli',
    drainage_area_sq_km: 134.8,
    priority: 'High',
    mean_annual_rainfall_mm: 620,
    srishti_drishti_scene_id: 'SRISHTI-2026-S2-5F2A-0901',
    interventions_count: 39,
    water_storage_created_tcm: 510.4,
    ndvi_trend_percent: 21.6,
    centroid: [71.216, 21.603],
    drainage_density_km_sqkm: 2.76,
    soil_type: 'Medium Black Calcarious Soils',
    lead_agency: 'Gujarat State Watershed Management Agency',
  },
  {
    id: 'ws-marathwada-05',
    name: 'Godavari Sub-Catchment 4E2D',
    region: 'Marathwada',
    state: 'Maharashtra',
    district: 'Beed',
    drainage_area_sq_km: 178.5,
    priority: 'Critical',
    mean_annual_rainfall_mm: 670,
    srishti_drishti_scene_id: 'SRISHTI-2026-L8-4E2D-0814',
    interventions_count: 45,
    water_storage_created_tcm: 465.0,
    ndvi_trend_percent: 16.9,
    centroid: [75.753, 18.989],
    drainage_density_km_sqkm: 2.95,
    soil_type: 'Shallow to Medium Black Soils',
    lead_agency: 'Marathwada Water Conservation Taskforce',
  },
];

export const SEED_GEOCODED_IMAGES: GeocodedImage[] = [
  {
    id: 'geo-001',
    basin_id: 'ws-bundelkhand-01',
    intervention_type: 'Masonry Check Dam',
    title: 'Check Dam CD-14 at Stream Order 3',
    village: 'Baragaon',
    latitude: 25.4428,
    longitude: 78.6152,
    elevation_m: 242.0,
    azimuth_deg: 142.5,
    date_captured: '2026-08-14',
    captured_by: 'Junior Engineer (WDC-PMKSY)',
    photo_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80',
    structural_health: 'Optimal',
    storage_capacity_cum: 8500,
    siltation_level_percent: 12.0,
    estimated_recharge_potential: 'High (1.2 ha-m/year)',
    vegetation_surround_delta: '+28.5%',
    verified_by_satellite: true,
  },
  {
    id: 'geo-002',
    basin_id: 'ws-bundelkhand-01',
    intervention_type: 'Percolation Tank',
    title: 'Community Percolation Tank PT-03',
    village: 'Chirgaon',
    latitude: 25.4321,
    longitude: 78.6084,
    elevation_m: 255.4,
    azimuth_deg: 88.0,
    date_captured: '2026-08-12',
    captured_by: 'Technical Assistant (DoLR)',
    photo_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    structural_health: 'Good',
    storage_capacity_cum: 14200,
    siltation_level_percent: 8.5,
    estimated_recharge_potential: 'Very High (2.4 ha-m/year)',
    vegetation_surround_delta: '+34.2%',
    verified_by_satellite: true,
  },
  {
    id: 'geo-003',
    basin_id: 'ws-bundelkhand-01',
    intervention_type: 'Continuous Contour Trenches (CCT)',
    title: 'Hill Ridge CCT Sector 7',
    village: 'Babina Ridge',
    latitude: 25.4510,
    longitude: 78.6210,
    elevation_m: 288.0,
    azimuth_deg: 215.0,
    date_captured: '2026-07-28',
    captured_by: 'Survey Officer (Forest-Watershed)',
    photo_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    structural_health: 'Needs Minor Silt Clearing',
    storage_capacity_cum: 4500,
    siltation_level_percent: 26.0,
    estimated_recharge_potential: 'Moderate (0.8 ha-m/year)',
    vegetation_surround_delta: '+19.0%',
    verified_by_satellite: true,
  },
  {
    id: 'geo-004',
    basin_id: 'ws-vidarbha-02',
    intervention_type: 'Farm Pond (Khet Talav)',
    title: 'Individual Farmer Harvest Pond FP-21',
    village: 'Ner',
    latitude: 20.3920,
    longitude: 78.1390,
    elevation_m: 312.0,
    azimuth_deg: 320.0,
    date_captured: '2026-08-22',
    captured_by: 'Agriculture Field Assistant',
    photo_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    structural_health: 'Optimal',
    storage_capacity_cum: 3200,
    siltation_level_percent: 5.0,
    estimated_recharge_potential: 'High (Protective Irrigation for 4.2 ha)',
    vegetation_surround_delta: '+41.5%',
    verified_by_satellite: true,
  },
  {
    id: 'geo-005',
    basin_id: 'ws-rayalaseema-03',
    intervention_type: 'Gully Plug / Boulder Check',
    title: 'Drainage Line Boulder Bund BB-08',
    village: 'Kalyandurg',
    latitude: 14.6850,
    longitude: 77.6020,
    elevation_m: 418.0,
    azimuth_deg: 165.0,
    date_captured: '2026-08-05',
    captured_by: 'Watershed Committee Secretary',
    photo_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    structural_health: 'Good',
    storage_capacity_cum: 1800,
    siltation_level_percent: 15.0,
    estimated_recharge_potential: 'Moderate (Erosion Control)',
    vegetation_surround_delta: '+15.2%',
    verified_by_satellite: true,
  },
];

export function generateLocalWatershedAnalysis(photo: GeocodedImage, basin: WatershedBasin) {
  const verified = photo.siltation_level_percent < 30;
  const ndviDelta = verified ? '+24.6%' : '+8.2%';
  const confidenceScore = verified ? 94.8 : 71.2;

  return {
    photo_id: photo.id,
    basin_id: basin.id,
    basin_name: basin.name,
    intervention_type: photo.intervention_type,
    spatial_verification: {
      status: verified ? 'VERIFIED_ACTIVE' : 'NEEDS_PHYSICAL_AUDIT',
      spectral_match_confidence: confidenceScore,
      satellite_scene: basin.srishti_drishti_scene_id,
      coordinates_verified: [photo.longitude, photo.latitude],
    },
    biophysical_impact: {
      estimated_water_spread_area_sqm: Math.round(photo.storage_capacity_cum * 0.42),
      subsurface_recharge_rate_ham_yr: 1.45,
      ndvi_biomass_expansion: ndviDelta,
      soil_moisture_retention_index: '78.5% (Optimal)',
      erosion_reduction_estimate: '64% sediment retention',
    },
    recommendation: verified
      ? 'Structure functioning at optimal design discharge capacity. Scheduled for post-monsoon NDVI re-verification.'
      : 'Elevated siltation detected. Desilting maintenance order recommended for Village Panchayat.',
    analyzed_at: new Date().toISOString(),
  };
}
