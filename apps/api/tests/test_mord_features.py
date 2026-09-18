"""
Tests for MoRD / DoLR Land Governance Features:
1. Watershed & SRISHTI-DRISHTI Geo-Coded Analysis
2. Land Record Digitization & Validation Studio
3. Land Acquisition Management System (LAMS) & Predictive Delay Analytics
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app, base_url="http://localhost")


def test_watershed_endpoints(client: TestClient) -> None:
    # 1. Test listing basins
    resp = client.get("/api/v1/watershed/basins")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] >= 5
    assert "total_water_storage_created_tcm" in data

    # 2. Test listing geocoded images
    geo_resp = client.get("/api/v1/watershed/geocoded-images")
    assert geo_resp.status_code == 200
    geo_data = geo_resp.json()
    assert geo_data["count"] >= 5
    first_img = geo_data["images"][0]
    assert "latitude" in first_img
    assert "azimuth_deg" in first_img

    # 3. Test thematic layers
    layers_resp = client.get("/api/v1/watershed/thematic-layers")
    assert layers_resp.status_code == 200
    assert len(layers_resp.json()["catalog"]) >= 4

    # 4. Test analyzing intervention
    analyze_resp = client.post(
        "/api/v1/watershed/analyze-intervention",
        json={
            "photo_id": "geo-001",
            "basin_id": "ws-bundelkhand-01",
            "intervention_type": "Masonry Check Dam",
            "observed_water_depth_m": 3.2,
            "current_vegetation_density": "High",
        }
    )
    assert analyze_resp.status_code == 200
    res_data = analyze_resp.json()
    assert res_data["status"] == "success"
    assert "calculated_water_stored_cum" in res_data["verification_result"]


def test_digitization_endpoints(client: TestClient) -> None:
    # 1. Test listing records
    resp = client.get("/api/v1/digitization/records")
    assert resp.status_code == 200
    records = resp.json()["records"]
    assert len(records) >= 4

    # 2. Test record detail
    rec_id = records[0]["id"]
    det_resp = client.get(f"/api/v1/digitization/records/{rec_id}")
    assert det_resp.status_code == 200
    det_data = det_resp.json()
    assert "extracted_fields" in det_data
    assert "landowner_name" in det_data["extracted_fields"]

    # 3. Test OCR extraction
    extract_resp = client.post(
        "/api/v1/digitization/extract",
        json={
            "document_title": "Test RoR",
            "state": "Uttar Pradesh",
            "language": "Hindi",
            "document_type": "RoR",
        }
    )
    assert extract_resp.status_code == 200
    ext_data = extract_resp.json()
    assert ext_data["overall_confidence"] > 90

    # 4. Test verification
    verify_resp = client.post(
        "/api/v1/digitization/verify",
        json={
            "record_id": rec_id,
            "decision": "approved",
            "verifier_name": "District Officer",
            "remarks": "Clean match"
        }
    )
    assert verify_resp.status_code == 200
    assert verify_resp.json()["decision"] == "approved"

    # 5. Test metrics
    metrics_resp = client.get("/api/v1/digitization/metrics")
    assert metrics_resp.status_code == 200
    assert "national_summary" in metrics_resp.json()


def test_acquisition_endpoints(client: TestClient) -> None:
    # 1. Test listing projects
    resp = client.get("/api/v1/acquisition/projects")
    assert resp.status_code == 200
    data = resp.json()
    assert data["count"] >= 4
    assert len(data["standard_lifecycle_stages"]) == 9

    # 2. Test predictive delay engine
    proj_id = data["projects"][0]["id"]
    predict_resp = client.get(f"/api/v1/acquisition/predict-delay/{proj_id}")
    assert predict_resp.status_code == 200
    pred_data = predict_resp.json()
    assert "delay_risk_score" in pred_data
    assert "explainable_delay_drivers" in pred_data
    assert len(pred_data["actionable_recommendations"]) > 0

    # 3. Test acquisition metrics
    metrics_resp = client.get("/api/v1/acquisition/metrics")
    assert metrics_resp.status_code == 200
    assert "total_compensation_assessed_cr" in metrics_resp.json()
    assert "dbt_disbursement_rate_percent" in metrics_resp.json()
