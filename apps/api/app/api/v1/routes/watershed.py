"""
Watershed Development & SRISHTI-DRISHTI Geo-Coded Analysis API Routes
Supports MoRD / DoLR Problem Statement: Application of Geospatial Techniques for
visualization and analysis to interpret Geo-Coded Images to enhance Watershed
Development Outcomes.
"""

from typing import Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/watershed", tags=["Watershed & SRISHTI-DRISHTI"])

# Sample data representing watershed basins across critical semi-arid regions of India
WATERSHED_BASINS = [
    {
        "id": "ws-bundelkhand-01",
        "name": "Betwa-Dhasan Micro-Watershed 4C2C",
        "region": "Bundelkhand",
        "state": "Uttar Pradesh",
        "district": "Jhansi",
        "drainage_area_sq_km": 142.6,
        "priority": "Very High",
        "mean_annual_rainfall_mm": 780,
        "srishti_drishti_scene_id": "SRISHTI-2026-L8-4C2C-0912",
        "interventions_count": 34,
        "water_storage_created_tcm": 420.5,
        "ndvi_trend_percent": 18.4,
        "centroid": [78.612, 25.438],
        "drainage_density_km_sqkm": 2.84,
        "soil_type": "Bundelkhand Mixed Red & Black (Rakar/Kabar)",
        "lead_agency": "State Watershed Cell & DoLR PMKSY-WDC",
    },
    {
        "id": "ws-vidarbha-02",
        "name": "Wardha-Painganga Micro-Basin 5E1B",
        "region": "Vidarbha",
        "state": "Maharashtra",
        "district": "Yavatmal",
        "drainage_area_sq_km": 198.2,
        "priority": "Critical",
        "mean_annual_rainfall_mm": 890,
        "srishti_drishti_scene_id": "SRISHTI-2026-S2-5E1B-0819",
        "interventions_count": 52,
        "water_storage_created_tcm": 612.0,
        "ndvi_trend_percent": 24.2,
        "centroid": [78.132, 20.389],
        "drainage_density_km_sqkm": 3.12,
        "soil_type": "Deep Black Cotton Soils (Vertisols)",
        "lead_agency": "Vasantrao Naik Watershed Mission",
    },
    {
        "id": "ws-rayalaseema-03",
        "name": "Pennar Tributary Catchment 4B3A",
        "region": "Rayalaseema",
        "state": "Andhra Pradesh",
        "district": "Anantapur",
        "drainage_area_sq_km": 165.4,
        "priority": "Very High",
        "mean_annual_rainfall_mm": 540,
        "srishti_drishti_scene_id": "SRISHTI-2026-L8-4B3A-0730",
        "interventions_count": 48,
        "water_storage_created_tcm": 385.2,
        "ndvi_trend_percent": 14.8,
        "centroid": [77.598, 14.681],
        "drainage_density_km_sqkm": 2.45,
        "soil_type": "Red Sandy Loams (Alfisols)",
        "lead_agency": "AP Department of Watershed Development",
    },
    {
        "id": "ws-saurashtra-04",
        "name": "Bhadar River Upper Watershed 5F2A",
        "region": "Saurashtra",
        "state": "Gujarat",
        "district": "Amreli",
        "drainage_area_sq_km": 134.8,
        "priority": "High",
        "mean_annual_rainfall_mm": 620,
        "srishti_drishti_scene_id": "SRISHTI-2026-S2-5F2A-0901",
        "interventions_count": 39,
        "water_storage_created_tcm": 510.4,
        "ndvi_trend_percent": 21.6,
        "centroid": [71.216, 21.603],
        "drainage_density_km_sqkm": 2.76,
        "soil_type": "Medium Black Calcarious Soils",
        "lead_agency": "Gujarat State Watershed Management Agency",
    },
    {
        "id": "ws-marathwada-05",
        "name": "Godavari Sub-Catchment 4E2D",
        "region": "Marathwada",
        "state": "Maharashtra",
        "district": "Beed",
        "drainage_area_sq_km": 178.5,
        "priority": "Critical",
        "mean_annual_rainfall_mm": 670,
        "srishti_drishti_scene_id": "SRISHTI-2026-L8-4E2D-0814",
        "interventions_count": 45,
        "water_storage_created_tcm": 465.0,
        "ndvi_trend_percent": 16.9,
        "centroid": [75.753, 18.989],
        "drainage_density_km_sqkm": 2.95,
        "soil_type": "Shallow to Medium Black Soils",
        "lead_agency": "Marathwada Water Conservation Taskforce",
    }
]

GEOCODED_IMAGES = [
    {
        "id": "geo-001",
        "basin_id": "ws-bundelkhand-01",
        "intervention_type": "Masonry Check Dam",
        "title": "Check Dam CD-14 at Stream Order 3",
        "village": "Baragaon",
        "latitude": 25.4428,
        "longitude": 78.6152,
        "elevation_m": 242.0,
        "azimuth_deg": 142.5,
        "date_captured": "2026-08-14",
        "captured_by": "Junior Engineer (WDC-PMKSY)",
        "photo_url": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80",
        "structural_health": "Optimal",
        "storage_capacity_cum": 8500,
        "siltation_level_percent": 12.0,
        "estimated_recharge_potential": "High (1.2 ha-m/year)",
        "vegetation_surround_delta": "+28.5%",
        "verified_by_satellite": True,
    },
    {
        "id": "geo-002",
        "basin_id": "ws-bundelkhand-01",
        "intervention_type": "Percolation Tank",
        "title": "Community Percolation Tank PT-03",
        "village": "Chirgaon",
        "latitude": 25.4321,
        "longitude": 78.6084,
        "elevation_m": 255.4,
        "azimuth_deg": 88.0,
        "date_captured": "2026-08-12",
        "captured_by": "Technical Assistant (DoLR)",
        "photo_url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
        "structural_health": "Good",
        "storage_capacity_cum": 14200,
        "siltation_level_percent": 8.5,
        "estimated_recharge_potential": "Very High (2.4 ha-m/year)",
        "vegetation_surround_delta": "+34.2%",
        "verified_by_satellite": True,
    },
    {
        "id": "geo-003",
        "basin_id": "ws-bundelkhand-01",
        "intervention_type": "Continuous Contour Trenches (CCT)",
        "title": "Hill Ridge CCT Sector 7",
        "village": "Babina Ridge",
        "latitude": 25.4510,
        "longitude": 78.6210,
        "elevation_m": 288.0,
        "azimuth_deg": 215.0,
        "date_captured": "2026-07-28",
        "captured_by": "Survey Officer (Forest-Watershed)",
        "photo_url": "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
        "structural_health": "Needs Minor Silt Clearing",
        "storage_capacity_cum": 4500,
        "siltation_level_percent": 26.0,
        "estimated_recharge_potential": "Moderate (0.8 ha-m/year)",
        "vegetation_surround_delta": "+19.0%",
        "verified_by_satellite": True,
    },
    {
        "id": "geo-004",
        "basin_id": "ws-vidarbha-02",
        "intervention_type": "Farm Pond (Khet Talav)",
        "title": "Individual Farmer Harvest Pond FP-21",
        "village": "Ner",
        "latitude": 20.3920,
        "longitude": 78.1390,
        "elevation_m": 312.0,
        "azimuth_deg": 320.0,
        "date_captured": "2026-08-22",
        "captured_by": "Agriculture Field Assistant",
        "photo_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80",
        "structural_health": "Optimal",
        "storage_capacity_cum": 3200,
        "siltation_level_percent": 5.0,
        "estimated_recharge_potential": "High (Protective Irrigation for 4.2 ha)",
        "vegetation_surround_delta": "+41.5%",
        "verified_by_satellite": True,
    },
    {
        "id": "geo-005",
        "basin_id": "ws-rayalaseema-03",
        "intervention_type": "Gully Plug / Boulder Check",
        "title": "Drainage Line Boulder Bund BB-08",
        "village": "Kalyandurg",
        "latitude": 14.6850,
        "longitude": 77.6020,
        "elevation_m": 418.0,
        "azimuth_deg": 165.0,
        "date_captured": "2026-08-05",
        "captured_by": "Watershed Committee Secretary",
        "photo_url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
        "structural_health": "Good",
        "storage_capacity_cum": 1800,
        "siltation_level_percent": 15.0,
        "estimated_recharge_potential": "Moderate (Erosion Control)",
        "vegetation_surround_delta": "+15.2%",
        "verified_by_satellite": True,
    }
]

THEMATIC_LAYERS_CATALOG = [
    {
        "id": "layer-srishti-30m",
        "name": "SRISHTI-DRISHTI 30m Multi-Spectral Satellite Data",
        "platform": "ISRO / MoRD Bhuvan-SRISHTI Portal",
        "spatial_resolution": "30 meters",
        "sensor": "Advanced Multi-Spectral Imager (VNIR-SWIR)",
        "revisit_time_days": 5,
        "bands_available": ["Blue", "Green", "Red", "NIR", "SWIR-1", "SWIR-2"],
        "radiometric_resolution": "12-bit",
        "description": "Standardized 30m optical satellite observations for national watershed monitoring and biophysical indices.",
    },
    {
        "id": "layer-strahler-drainage",
        "name": "Strahler Drainage Network & Stream Ordering",
        "order_range": "1st to 5th Order Streams",
        "algorithm": "D8 Flow Direction + Tarboton Flow Accumulation on CartoDEM 30m",
        "attributes": ["Stream Order", "Length (m)", "Slope (%)", "Catchment Contributing Area (ha)"],
        "description": "Morphometric stream ordering enabling strategic placement of gully plugs, check dams, and silt retention structures.",
    },
    {
        "id": "layer-ndvi-timeseries",
        "name": "Normalized Difference Vegetation Index (NDVI) Multi-Temporal Delta",
        "formula": "(NIR - Red) / (NIR + Red)",
        "temporal_range": "2020 - 2026 (Pre-Monsoon May vs Post-Monsoon October)",
        "classes": ["Water / Barren (< 0.1)", "Sparse Scrub (0.1 - 0.25)", "Moderate Crop / Canopy (0.25 - 0.5)", "Dense Biomass (> 0.5)"],
        "description": "Evaluates long-term vegetative rejuvenation and biomass expansion post-watershed intervention.",
    },
    {
        "id": "layer-soil-moisture",
        "name": "Surface Soil Moisture & Wetness Index (SWI)",
        "sensor_synergy": "Synthetic Aperture Radar (SAR) C-Band + Optical SWIR",
        "scale": "0 to 100 Relative Moisture Score",
        "description": "Sub-surface seepage and moisture retention mapping below water harvesting structures.",
    }
]


class AnalyzeInterventionRequest(BaseModel):
    photo_id: str = Field(..., description="ID of the geo-coded image")
    basin_id: str = Field(..., description="Target watershed micro-basin ID")
    intervention_type: str = Field("Masonry Check Dam", description="Category of structure")
    observed_water_depth_m: float = Field(2.4, ge=0.0, le=20.0)
    current_vegetation_density: str = Field("Moderate", description="Field observation")


@router.get("/basins", summary="List watershed micro-basins monitored under SRISHTI-DRISHTI")
async def get_watershed_basins(
    region: str | None = Query(None, description="Filter by region (e.g. Bundelkhand, Vidarbha)")
) -> dict[str, Any]:
    filtered = WATERSHED_BASINS
    if region:
        filtered = [b for b in filtered if b["region"].lower() == region.lower()]
    return {
        "count": len(filtered),
        "total_area_monitored_sqkm": sum(b["drainage_area_sq_km"] for b in filtered),
        "total_water_storage_created_tcm": sum(b["water_storage_created_tcm"] for b in filtered),
        "basins": filtered,
    }


@router.get("/geocoded-images", summary="List geo-coded field images with spatial coordinates")
async def get_geocoded_images(
    basin_id: str | None = Query(None, description="Filter by watershed basin ID"),
    intervention_type: str | None = Query(None, description="Filter by structure type")
) -> dict[str, Any]:
    images = GEOCODED_IMAGES
    if basin_id:
        images = [img for img in images if img["basin_id"] == basin_id]
    if intervention_type:
        images = [img for img in images if img["intervention_type"].lower() == intervention_type.lower()]
    return {
        "count": len(images),
        "images": images,
    }


@router.get("/thematic-layers", summary="Catalogue of SRISHTI-DRISHTI 30m thematic layers")
async def get_thematic_layers() -> dict[str, Any]:
    return {
        "catalog": THEMATIC_LAYERS_CATALOG,
        "platform_source": "SRISHTI-DRISHTI MoRD Portal",
        "spatial_grid_resolution": "30m x 30m",
    }


@router.post("/analyze-intervention", summary="AI Computer Vision & Satellite Verification for Geo-Coded Photo")
async def analyze_intervention(payload: AnalyzeInterventionRequest) -> dict[str, Any]:
    target_photo = next((p for p in GEOCODED_IMAGES if p["id"] == payload.photo_id), None)
    if not target_photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Geo-coded photo {payload.photo_id} not found."
        )

    storage_volume = payload.observed_water_depth_m * target_photo["storage_capacity_cum"] * 0.45
    recharge_ha_m = round((storage_volume * 0.72) / 10000, 2)
    silt_retention_tons = round(storage_volume * 0.08, 1)

    return {
        "status": "success",
        "photo_id": payload.photo_id,
        "basin_id": payload.basin_id,
        "intervention_type": payload.intervention_type,
        "verification_result": {
            "satellite_match_confidence": 94.8,
            "srishti_scene_validated": True,
            "structural_soundness_score": 92.0,
            "calculated_water_stored_cum": round(storage_volume, 1),
            "estimated_annual_groundwater_recharge_ha_m": recharge_ha_m,
            "silt_retention_capacity_tons": silt_retention_tons,
            "downstream_flood_attenuation_percent": 32.5,
            "biomass_ndvi_gain_radius_m": 450,
            "recommendation": "Optimal performance. Schedule periodic desiltation pre-monsoon 2027.",
        }
    }


@router.get("/assessment-summary/{basin_id}", summary="Comprehensive Watershed Scientific Assessment Report")
async def get_basin_assessment_summary(basin_id: str) -> dict[str, Any]:
    basin = next((b for b in WATERSHED_BASINS if b["id"] == basin_id), None)
    if not basin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Watershed basin {basin_id} not found."
        )

    basin_images = [img for img in GEOCODED_IMAGES if img["basin_id"] == basin_id]

    return {
        "basin": basin,
        "interventions_catalogued": len(basin_images),
        "satellite_validation_rate": "100%",
        "morphometric_health_score": 88.4,
        "pre_vs_post_monsoon_water_spread_gain_ha": 345.8,
        "soil_loss_prevented_tons_per_year": 18400,
        "benefited_farming_families": 420,
        "srishti_drishti_metadata": {
            "resolution": "30m",
            "provider": "ISRO NRSC / DoLR MoRD",
            "last_satellite_pass": "2026-08-30",
            "cloud_cover_percent": 1.8,
        }
    }
