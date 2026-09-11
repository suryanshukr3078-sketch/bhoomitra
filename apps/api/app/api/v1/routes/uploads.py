from typing import Any

from fastapi import APIRouter, File, UploadFile, status

from app.core.storage import storage_service

router = APIRouter(prefix="/uploads", tags=["Uploads"])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Upload and validate file securely",
)
async def upload_file(
    file: UploadFile = File(...),
) -> dict[str, Any]:
    result = await storage_service.validate_and_upload(file)
    return {
        "message": "File successfully uploaded and validated.",
        **result,
    }
