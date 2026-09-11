from functools import lru_cache
from typing import Literal

from pydantic import AliasChoices, Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Land Governance API"
    app_env: Literal[
        "development",
        "testing",
        "staging",
        "production",
    ] = "development"

    app_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"
    debug: bool = False

    api_host: str = "0.0.0.0"
    api_port: int = Field(
        default=8000,
        ge=1,
        le=65535,
        validation_alias=AliasChoices("port", "api_port"),
    )
    api_workers: int = Field(default=1, ge=1)

    cors_origins: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        validation_alias=AliasChoices("cors_origins", "backend_cors_origins"),
    )
    trusted_hosts: str = Field(
        default="localhost,127.0.0.1,*.koyeb.app",
        validation_alias=AliasChoices("trusted_hosts"),
    )

    database_url: str

    secret_key: str = "change-this-to-a-secure-random-secret-key-in-production"
    access_token_expire_minutes: int = 60 * 24 * 7
    jwt_algorithm: str = "HS256"

    redis_url: str = "redis://127.0.0.1:6379/0"

    s3_endpoint_url: str = "http://127.0.0.1:9000"
    s3_access_key: str = "minio_admin"
    s3_secret_key: str = "minio_admin_secret"
    s3_bucket_name: str = "land-governance-documents"
    s3_region: str = "us-east-1"
    max_upload_size_bytes: int = 50 * 1024 * 1024

    db_pool_size: int = Field(default=5, ge=1)
    db_max_overflow: int = Field(default=5, ge=0)
    db_pool_timeout_seconds: int = Field(default=30, ge=1)
    db_pool_recycle_seconds: int = Field(default=1800, ge=30)

    db_statement_timeout_ms: int = Field(default=30_000, ge=1)
    db_lock_timeout_ms: int = Field(default=5_000, ge=1)
    db_idle_transaction_timeout_ms: int = Field(
        default=60_000,
        ge=1,
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("database_url")
    @classmethod
    def validate_database_url(
        cls,
        value: str,
    ) -> str:
        allowed_prefixes = (
            "postgresql+psycopg://",
            "postgresql+psycopg_async://",
        )

        if not value.startswith(allowed_prefixes):
            raise ValueError("DATABASE_URL must use the SQLAlchemy psycopg dialect.")

        return value

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        if self.app_env == "production":
            insecure_defaults = [
                "change-this-to-a-secure-random-secret-key-in-production",
                "temporary-secret-key-change-in-production-1234567890",
                "secret",
                "password",
            ]
            if (
                not self.secret_key
                or self.secret_key in insecure_defaults
                or len(self.secret_key) < 32
            ):
                raise ValueError(
                    "Production configuration error: SECRET_KEY must be a "
                    "cryptographically secure string of at least 32 characters "
                    "and must not use default values."
                )
            if self.s3_secret_key in ["minio_admin_secret", "secret", "password"]:
                raise ValueError(
                    "Production configuration error: S3_SECRET_KEY must not use "
                    "default credentials in production."
                )
        return self

    @property
    def cors_origin_list(self) -> list[str]:
        raw = self.cors_origins.strip()
        if raw.startswith("[") and raw.endswith("]"):
            try:
                import json

                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return [str(origin).strip() for origin in parsed if str(origin).strip()]
            except Exception:
                pass
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    @property
    def trusted_host_list(self) -> list[str]:
        hosts = [host.strip() for host in self.trusted_hosts.split(",") if host.strip()]
        if "*" not in hosts and "*.koyeb.app" not in hosts:
            hosts.append("*.koyeb.app")
        return hosts

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @property
    def docs_url(self) -> str | None:
        if self.is_production:
            return None

        return "/docs"

    @property
    def openapi_url(self) -> str | None:
        if self.is_production:
            return None

        return "/openapi.json"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
