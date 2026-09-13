import hashlib
import re
import uuid
from pathlib import Path
from typing import Any

import boto3
import structlog
from botocore.exceptions import ClientError
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

logger = structlog.get_logger(__name__)

ALLOWED_EXTENSIONS = {
    ".pdf": "application/pdf",
    ".geojson": "application/geo+json",
    ".json": "application/json",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
}

MAGIC_HEADERS = {
    "application/pdf": [b"%PDF-"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/tiff": [b"II*\x00", b"MM\x00*"],
}


def sanitize_filename(filename: str) -> str:
    basename = Path(filename).name
    basename = re.sub(r"[^a-zA-Z0-9_.-]", "_", basename)
    if not basename or basename.startswith("."):
        basename = f"file_{uuid.uuid4().hex[:8]}"
    return basename[:150]


def verify_magic_bytes(header: bytes, mime_type: str) -> bool:
    if mime_type in MAGIC_HEADERS:
        return any(header.startswith(magic) for magic in MAGIC_HEADERS[mime_type])
    if mime_type in ("application/geo+json", "application/json"):
        stripped = header.lstrip()
        return stripped.startswith(b"{") or stripped.startswith(b"[")
    return False


class StorageService:
    def __init__(self) -> None:
        self.endpoint_url = settings.s3_endpoint_url
        self.access_key = settings.s3_access_key
        self.secret_key = settings.s3_secret_key
        self.bucket_name = settings.s3_bucket_name
        self.region = settings.s3_region
        self._s3_client: Any = None

    def _get_client(self) -> Any:
        if self._s3_client is None:
            self._s3_client = boto3.client(
                "s3",
                endpoint_url=self.endpoint_url,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region,
            )
            self._ensure_bucket()
        return self._s3_client

    def _ensure_bucket(self) -> None:
        try:
            self._s3_client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            try:
                self._s3_client.create_bucket(Bucket=self.bucket_name)
            except Exception as e:
                logger.warning("Could not auto-create S3 bucket", error=str(e))

    async def validate_and_upload(
        self,
        file: UploadFile,
    ) -> dict[str, object]:
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Filename is missing.",
            )

        sanitized_name = sanitize_filename(file.filename)
        ext = Path(sanitized_name).suffix.lower()

        if ext not in ALLOWED_EXTENSIONS:
            allowed_list = list(ALLOWED_EXTENSIONS.keys())
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file extension '{ext}'. Allowed extensions: {allowed_list}",
            )

        expected_mime = ALLOWED_EXTENSIONS[ext]

        content = await file.read()
        file_size = len(content)

        max_mb = settings.max_upload_size_bytes // (1024 * 1024)
        if file_size > settings.max_upload_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {max_mb}MB.",
            )

        if not verify_magic_bytes(content[:16], expected_mime):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"File content does not match expected format for {expected_mime}.",
            )

        hasher = hashlib.sha256()
        hasher.update(content)
        checksum = hasher.hexdigest()

        object_key = f"uploads/{uuid.uuid4()}/{sanitized_name}"

        try:
            client = self._get_client()
            client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=content,
                ContentType=expected_mime,
                Metadata={"sha256": checksum, "original_name": sanitized_name},
            )
            storage_uri = f"s3://{self.bucket_name}/{object_key}"
        except Exception as e:
            logger.warning("S3 storage unavailable, persisting via validated data URI in database", error=str(e))
            import base64

            b64_data = base64.b64encode(content).decode("ascii")
            storage_uri = f"data:{expected_mime};base64,{b64_data}"

        return {
            "original_filename": sanitized_name,
            "mime_type": expected_mime,
            "file_size_bytes": file_size,
            "checksum_sha256": checksum,
            "storage_uri": storage_uri,
        }

    async def get_file_content(self, storage_uri: str) -> tuple[bytes, str]:
        import base64

        if storage_uri.startswith("data:"):
            header, b64_data = storage_uri.split(",", 1)
            mime_type = header.split(";")[0].replace("data:", "").strip() or "application/octet-stream"
            content = base64.b64decode(b64_data)
            return content, mime_type

        if storage_uri.startswith("s3://"):
            parts = storage_uri[5:].split("/", 1)
            bucket = parts[0]
            key = parts[1]
            client = self._get_client()
            obj = client.get_object(Bucket=bucket, Key=key)
            content = obj["Body"].read()
            mime_type = obj.get("ContentType", "application/octet-stream")
            return content, mime_type

        raise ValueError(f"Unsupported storage URI scheme: {storage_uri[:30]}")

    def generate_presigned_url(self, storage_uri: str, expires_in: int = 3600) -> str | None:
        if not storage_uri.startswith("s3://"):
            return None
        try:
            parts = storage_uri[5:].split("/", 1)
            bucket = parts[0]
            key = parts[1]
            client = self._get_client()
            return client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket, "Key": key},
                ExpiresIn=expires_in,
            )
        except Exception as e:
            logger.warning("Failed to generate presigned S3 URL", error=str(e))
            return None


storage_service = StorageService()
