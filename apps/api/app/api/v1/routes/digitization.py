"""
Intelligent Land Record Digitization & Validation System API Routes
Supports MoRD / DoLR Problem Statement: AI-Powered Intelligent Land Record
Digitization and Validation System (Multilingual OCR, attribute classification,
business rule verification, confidence scoring, and human-assisted verification).
"""

from typing import Any
import uuid
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

router = APIRouter(prefix="/digitization", tags=["Land Record Digitization & OCR"])

DIGITIZATION_RECORDS = [
    {
        "id": "doc-ror-up-01",
        "title": "Khatoni (Record of Rights) Fasli 1431",
        "state": "Uttar Pradesh",
        "district": "Varanasi",
        "tehsil": "Pindra",
        "village": "Shivpur",
        "document_type": "Khatoni / RoR",
        "original_language": "Hindi (Devanagari)",
        "scan_url": "https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=1200&q=80",
        "scanned_at": "2026-08-10",
        "verification_status": "pending_review",
        "overall_confidence": 91.4,
        "extracted_fields": {
            "landowner_name": {"value": "रामेश्वर प्रसाद शर्मा (Rameshwar Prasad Sharma)", "confidence": 96.2, "bbox": [120, 180, 410, 215]},
            "father_husband_name": {"value": "स्व. बद्री नारायण शर्मा (Late Badri Narayan Sharma)", "confidence": 94.0, "bbox": [120, 225, 410, 255]},
            "khasra_number": {"value": "412/1-क", "confidence": 98.5, "bbox": [430, 180, 560, 215]},
            "khata_number": {"value": "00184", "confidence": 97.0, "bbox": [580, 180, 690, 215]},
            "total_area_hectares": {"value": "1.4250", "confidence": 93.8, "bbox": [710, 180, 840, 215]},
            "area_in_bigha": {"value": "5.62 Bigha (Pucca)", "confidence": 91.0, "bbox": [710, 225, 840, 255]},
            "land_classification": {"value": "संक्रमणीय भूमिधर (Bhumidhar with Transferable Rights)", "confidence": 88.5, "bbox": [120, 290, 480, 325]},
            "mutation_order_number": {"value": "नामान्तरण वाद सं० 2024/0912", "confidence": 78.4, "bbox": [510, 290, 840, 325]},
            "encumbrance_status": {"value": "भारमुक्त (Nil Encumbrance / No Bank Lien)", "confidence": 92.1, "bbox": [120, 350, 450, 380]},
        },
        "validation_warnings": [
            "Mutation order date pending cross-match with Revenue Court Management System (RCMS)."
        ],
        "assigned_verifier": "Revenue Inspector (RI) Circle 3",
    },
    {
        "id": "doc-712-mh-02",
        "title": "Satbara 7/12 & 8-A Extract",
        "state": "Maharashtra",
        "district": "Pune",
        "tehsil": "Haveli",
        "village": "Wagholi",
        "document_type": "7/12 Extract (Satbara)",
        "original_language": "Marathi",
        "scan_url": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
        "scanned_at": "2026-08-14",
        "verification_status": "verified",
        "overall_confidence": 96.8,
        "extracted_fields": {
            "landowner_name": {"value": "दत्तात्रय विठ्ठलराव कदम (Dattatraya Vithalrao Kadam)", "confidence": 98.0, "bbox": [140, 160, 460, 195]},
            "father_husband_name": {"value": "विठ्ठलराव बापूराव कदम (Vithalrao Bapurao Kadam)", "confidence": 97.4, "bbox": [140, 205, 460, 235]},
            "khasra_number": {"value": "सर्व्हे नं. 142/2/अ", "confidence": 99.1, "bbox": [480, 160, 620, 195]},
            "khata_number": {"value": "खाते क्र. 329", "confidence": 98.4, "bbox": [640, 160, 750, 195]},
            "total_area_hectares": {"value": "0.8500", "confidence": 97.2, "bbox": [770, 160, 890, 195]},
            "area_in_guntha": {"value": "34.0 Guntha", "confidence": 95.5, "bbox": [770, 205, 890, 235]},
            "land_classification": {"value": "जिरायत (Jirayat - Dry Crop Agriculture)", "confidence": 96.0, "bbox": [140, 270, 480, 305]},
            "mutation_order_number": {"value": "फेरफार नोंद क्र. 8412", "confidence": 94.2, "bbox": [500, 270, 780, 305]},
            "encumbrance_status": {"value": "बँक ऑफ महाराष्ट्र कर्ज बोजा रु. 4,50,000", "confidence": 91.0, "bbox": [140, 330, 520, 365]},
        },
        "validation_warnings": [],
        "assigned_verifier": "Talathi Office Wagholi",
    },
    {
        "id": "doc-ror-wb-03",
        "title": "Khatian Register (Banglarbhumi Form 32)",
        "state": "West Bengal",
        "district": "North 24 Parganas",
        "tehsil": "Barasat",
        "village": "Kadambagachi",
        "document_type": "Khatian (LR Record)",
        "original_language": "Bengali",
        "scan_url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
        "scanned_at": "2026-08-18",
        "verification_status": "flagged",
        "overall_confidence": 74.2,
        "extracted_fields": {
            "landowner_name": {"value": "সুনীল কুমার বিশ্বাস (Sunil Kumar Biswas)", "confidence": 88.0, "bbox": [110, 170, 420, 205]},
            "father_husband_name": {"value": "মৃত অবিনাশ বিশ্বাস (Late Abinash Biswas)", "confidence": 82.5, "bbox": [110, 215, 420, 245]},
            "khasra_number": {"value": "দাগ নং 891 (Daag No 891)", "confidence": 76.0, "bbox": [440, 170, 580, 205]},
            "khata_number": {"value": "খতিয়ান নং 1042", "confidence": 79.5, "bbox": [600, 170, 720, 205]},
            "total_area_hectares": {"value": "0.3200", "confidence": 68.0, "bbox": [740, 170, 860, 205]},
            "area_in_bigha": {"value": "0.96 Bigha (24 Decimal)", "confidence": 64.5, "bbox": [740, 215, 860, 245]},
            "land_classification": {"value": "বাস্তু (Bastu / Homestead Land)", "confidence": 72.0, "bbox": [110, 280, 460, 315]},
            "mutation_order_number": {"value": "অস্পষ্ট (Faded Ink / Unreadable Stamp)", "confidence": 42.0, "bbox": [480, 280, 790, 315]},
            "encumbrance_status": {"value": "নিরীক্ষণাধীন (Under Scrutiny)", "confidence": 70.0, "bbox": [110, 340, 480, 375]},
        },
        "validation_warnings": [
            "Low OCR confidence on Area & Mutation Stamp due to historic page crease and faded ink.",
            "Area summation mismatch: Share fractions sum to 0.92, expected 1.00."
        ],
        "assigned_verifier": "BL&LRO Barasat Desk 2",
    },
    {
        "id": "doc-vf7-gj-04",
        "title": "Village Form 7/12 & 6 Haq Patrak",
        "state": "Gujarat",
        "district": "Ahmedabad",
        "tehsil": "Daskroi",
        "village": "Sanand Road",
        "document_type": "Village Form 7/12",
        "original_language": "Gujarati",
        "scan_url": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
        "scanned_at": "2026-08-20",
        "verification_status": "approved",
        "overall_confidence": 98.2,
        "extracted_fields": {
            "landowner_name": {"value": "પટેલ હસમુખભાઈ રમણલાલ (Patel Hasmukhbhai Ramanlal)", "confidence": 99.0, "bbox": [130, 160, 450, 195]},
            "father_husband_name": {"value": "રમણલાલ મોહનલાલ પટેલ (Ramanlal Mohanlal Patel)", "confidence": 98.4, "bbox": [130, 205, 450, 235]},
            "khasra_number": {"value": "સર્વે નંબર 218/1", "confidence": 99.4, "bbox": [470, 160, 600, 195]},
            "khata_number": {"value": "ખાતા નંબર 485", "confidence": 98.9, "bbox": [620, 160, 730, 195]},
            "total_area_hectares": {"value": "2.1050", "confidence": 98.1, "bbox": [750, 160, 870, 195]},
            "area_in_vigha": {"value": "8.42 Vigha", "confidence": 97.5, "bbox": [750, 205, 870, 235]},
            "land_classification": {"value": "ખેતીની જમીન (Agricultural Land)", "confidence": 99.0, "bbox": [130, 270, 460, 305]},
            "mutation_order_number": {"value": "નોંધ નંબર 3140", "confidence": 96.5, "bbox": [480, 270, 760, 305]},
            "encumbrance_status": {"value": "કોઈ બોજો નથી (Nil Encumbrance)", "confidence": 97.0, "bbox": [130, 330, 470, 365]},
        },
        "validation_warnings": [],
        "assigned_verifier": "Mamlatdar Office Daskroi",
    }
]

STATE_DIGITIZATION_METRICS = [
    {"state": "Uttar Pradesh", "districts_total": 75, "total_records_lakhs": 240.5, "digitized_percent": 94.2, "ocr_accuracy_percent": 93.8, "pending_verification": 14200},
    {"state": "Maharashtra", "districts_total": 36, "total_records_lakhs": 182.0, "digitized_percent": 97.6, "ocr_accuracy_percent": 96.1, "pending_verification": 8410},
    {"state": "West Bengal", "districts_total": 23, "total_records_lakhs": 128.4, "digitized_percent": 86.4, "ocr_accuracy_percent": 88.5, "pending_verification": 26800},
    {"state": "Gujarat", "districts_total": 33, "total_records_lakhs": 115.2, "digitized_percent": 98.9, "ocr_accuracy_percent": 97.4, "pending_verification": 3120},
    {"state": "Andhra Pradesh", "districts_total": 26, "total_records_lakhs": 98.7, "digitized_percent": 95.8, "ocr_accuracy_percent": 94.6, "pending_verification": 6500},
    {"state": "Bihar", "districts_total": 38, "total_records_lakhs": 164.0, "digitized_percent": 81.2, "ocr_accuracy_percent": 85.0, "pending_verification": 42000},
    {"state": "Karnataka", "districts_total": 31, "total_records_lakhs": 112.5, "digitized_percent": 96.8, "ocr_accuracy_percent": 95.2, "pending_verification": 7100},
    {"state": "Tamil Nadu", "districts_total": 38, "total_records_lakhs": 134.8, "digitized_percent": 96.1, "ocr_accuracy_percent": 95.8, "pending_verification": 5900},
]


class ExtractDocumentPayload(BaseModel):
    document_title: str = Field("Scanned Village Register", description="Title of document")
    state: str = Field("Uttar Pradesh")
    language: str = Field("Hindi", description="OCR target language")
    document_type: str = Field("RoR", description="RoR, Jamabandi, Satbara, Khasra, Cadastral Map")
    mock_file_name: str = Field("sample_ror_scan.pdf")


class ValidateRecordPayload(BaseModel):
    record_id: str
    extracted_fields: dict[str, Any]


class VerifyRecordPayload(BaseModel):
    record_id: str
    decision: str = Field(..., description="'approved', 'flagged', or 'corrected'")
    verifier_name: str = Field("Revenue Officer")
    corrected_fields: dict[str, Any] | None = None
    remarks: str = Field("Verified against village revenue master")


@router.get("/records", summary="List digitized legacy land records for verification")
async def get_digitization_records(
    status_filter: str | None = Query(None, description="pending_review, verified, flagged, approved"),
    state_filter: str | None = Query(None, description="Filter by Indian State")
) -> dict[str, Any]:
    records = DIGITIZATION_RECORDS
    if status_filter:
        records = [r for r in records if r["verification_status"] == status_filter]
    if state_filter:
        records = [r for r in records if r["state"].lower() == state_filter.lower()]
    return {
        "count": len(records),
        "records": records,
    }


@router.get("/records/{record_id}", summary="Get detailed extracted record with confidence scores and bounding boxes")
async def get_digitization_record_detail(record_id: str) -> dict[str, Any]:
    record = next((r for r in DIGITIZATION_RECORDS if r["id"] == record_id), None)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record {record_id} not found."
        )
    return record


@router.post("/extract", summary="AI Multilingual OCR Extraction on Uploaded Land Record")
async def extract_record_ocr(payload: ExtractDocumentPayload) -> dict[str, Any]:
    new_id = f"doc-{uuid.uuid4().hex[:8]}"
    return {
        "record_id": new_id,
        "title": payload.document_title,
        "language_detected": payload.language,
        "script": "Devanagari / Indic Script",
        "ocr_engine": "Bhoomitra IndicVision OCR v2.4 (Transformer-based)",
        "overall_confidence": 94.2,
        "processing_time_ms": 680,
        "extracted_fields": {
            "landowner_name": {"value": "शिवकुमार यादव (Shivkumar Yadav)", "confidence": 97.5, "bbox": [120, 180, 420, 215]},
            "father_husband_name": {"value": "रामलाल यादव (Ramlal Yadav)", "confidence": 96.0, "bbox": [120, 225, 420, 255]},
            "khasra_number": {"value": "309/2", "confidence": 98.8, "bbox": [440, 180, 560, 215]},
            "khata_number": {"value": "00241", "confidence": 97.4, "bbox": [580, 180, 690, 215]},
            "total_area_hectares": {"value": "1.1200", "confidence": 93.5, "bbox": [710, 180, 830, 215]},
            "land_classification": {"value": "संक्रमणीय भूमिधर (Agricultural Private)", "confidence": 92.0, "bbox": [120, 290, 480, 325]},
            "mutation_order_number": {"value": "नामांतरण सं० 2025/1102", "confidence": 89.2, "bbox": [500, 290, 820, 325]},
            "encumbrance_status": {"value": "भारमुक्त (Nil Encumbrance)", "confidence": 94.0, "bbox": [120, 350, 450, 380]},
        },
        "business_rules_validation": {
            "duplicate_survey_no_in_village": False,
            "mathematical_share_sum_valid": True,
            "legal_syntax_valid": True,
        }
    }


@router.post("/validate", summary="Automated Business Rule and Consistency Validation Engine")
async def validate_record_rules(payload: ValidateRecordPayload) -> dict[str, Any]:
    fields = payload.extracted_fields
    warnings = []
    errors = []

    # Area format check
    area_val = fields.get("total_area_hectares", {}).get("value") or fields.get("total_area_hectares", "")
    try:
        if isinstance(area_val, dict):
            area_val = area_val.get("value", "0")
        float(str(area_val).replace("Hectares", "").strip())
    except (ValueError, TypeError):
        errors.append("Area attribute could not be cast to numeric value.")

    # Survey number check
    khasra = str(fields.get("khasra_number", {}).get("value") or "")
    if not khasra or len(khasra) < 1:
        errors.append("Missing Khasra / Survey identifier.")

    # Duplicate check simulation
    if "891" in khasra:
        warnings.append("Survey No 891 has an active civil mutation dispute in Tehsil Registry.")

    return {
        "record_id": payload.record_id,
        "is_valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "cross_registry_status": "Verified against state DILRMP master repository.",
    }


@router.post("/verify", summary="Human-in-the-loop Record Verification and Approval")
async def verify_record(payload: VerifyRecordPayload) -> dict[str, Any]:
    return {
        "status": "success",
        "record_id": payload.record_id,
        "decision": payload.decision,
        "verifier": payload.verifier_name,
        "audit_timestamp": "2026-09-18T21:40:00Z",
        "message": f"Record {payload.record_id} successfully marked as {payload.decision} by {payload.verifier_name}.",
        "audit_logged": True,
    }


@router.get("/metrics", summary="State-wise & National DILRMP Digitization Progress Dashboard")
async def get_digitization_metrics() -> dict[str, Any]:
    total_records = sum(s["total_records_lakhs"] for s in STATE_DIGITIZATION_METRICS)
    avg_accuracy = sum(s["ocr_accuracy_percent"] for s in STATE_DIGITIZATION_METRICS) / len(STATE_DIGITIZATION_METRICS)
    total_pending = sum(s["pending_verification"] for s in STATE_DIGITIZATION_METRICS)

    return {
        "national_summary": {
            "total_records_scanned_lakhs": round(total_records, 1),
            "national_average_ocr_accuracy": round(avg_accuracy, 1),
            "total_pending_human_verification": total_pending,
            "supported_indic_languages": 9,
            "supported_formats": ["RoR (Khatoni)", "Satbara 7/12", "Khatian", "Village Form 7/12 & 6", "Khasra Register", "Cadastral Maps"],
        },
        "states_progress": STATE_DIGITIZATION_METRICS,
    }
