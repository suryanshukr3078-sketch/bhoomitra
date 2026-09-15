from typing import Any

from fastapi import APIRouter, Depends, File, Request, UploadFile, status

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.db import get_db
from app.core.storage import storage_service
from app.models.identity import User
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/uploads", tags=["Uploads"])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Upload and validate file securely",
)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    result = await storage_service.validate_and_upload(file)
    return {
        "message": "File successfully uploaded and validated.",
        **result,
    }
