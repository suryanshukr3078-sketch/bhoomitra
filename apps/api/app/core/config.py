from functools import lru_cache
from typing import Any, Literal
from urllib.parse import parse_qs, quote_plus, urlencode, urlparse, urlunparse

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
        default="localhost,127.0.0.1,*.koyeb.app,*.vercel.app",
        validation_alias=AliasChoices("trusted_hosts"),
    )

    database_url: str = Field(
        default="",
        validation_alias=AliasChoices(
            "database_url",
            "postgres_url",
            "postgres_prisma_url",
            "postgres_url_non_pooling",
        ),
    )
    db_connection_source: str = "DEFAULT"

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

    # SMTP Email Configuration (e.g. Gmail SMTP or custom relays)
    smtp_host: str = Field(
        default="smtp.gmail.com",
        validation_alias=AliasChoices("smtp_host", "mail_server", "mail_host", "email_host"),
    )
    smtp_port: int = Field(
        default=587,
        validation_alias=AliasChoices("smtp_port", "mail_port", "email_port"),
    )
    smtp_user: str | None = Field(
        default=None,
        validation_alias=AliasChoices("smtp_user", "smtp_username", "mail_username", "mail_user", "email_host_user", "gmail_user"),
    )
    smtp_password: str | None = Field(
        default=None,
        validation_alias=AliasChoices("smtp_password", "smtp_pass", "mail_password", "mail_pass", "email_host_password", "gmail_app_password", "gmail_password"),
    )
    smtp_from_email: str | None = Field(
        default=None,
        validation_alias=AliasChoices("smtp_from_email", "mail_from", "email_from", "mail_default_sender"),
    )
    smtp_from_name: str = Field(
        default="Bhoomitra Land Governance Platform",
        validation_alias=AliasChoices("smtp_from_name", "mail_from_name", "email_from_name"),
    )
    smtp_tls: bool = Field(
        default=True,
        validation_alias=AliasChoices("smtp_tls", "mail_starttls", "email_use_tls"),
    )
    smtp_ssl: bool = Field(
        default=False,
        validation_alias=AliasChoices("smtp_ssl", "mail_ssl_tls", "email_use_ssl"),
    )

    @field_validator("smtp_user", mode="before")
    @classmethod
    def clean_smtp_user(cls, v: Any) -> str | None:
        if v is None:
            return None
        cleaned = str(v).strip().strip("'\"")
        return cleaned if cleaned else None

    @field_validator("smtp_password", mode="before")
    @classmethod
    def clean_smtp_password(cls, v: Any) -> str | None:
        if v is None:
            return None
        cleaned = str(v).strip().strip("'\"")
        # Google App Passwords often have spaces (e.g. 'xxxx xxxx xxxx xxxx') which causes 535 rejection
        if " " in cleaned and len(cleaned.replace(" ", "")) == 16:
            cleaned = cleaned.replace(" ", "")
        elif " " in cleaned and len(cleaned.strip()) > 0:
            cleaned = cleaned.replace(" ", "")
        return cleaned if cleaned else None

    @field_validator("smtp_from_email", mode="before")
    @classmethod
    def clean_smtp_from_email(cls, v: Any) -> str | None:
        if v is None:
            return None
        cleaned = str(v).strip().strip("'\"")
        return cleaned if cleaned else None

    @field_validator("smtp_host", mode="before")
    @classmethod
    def clean_smtp_host(cls, v: Any) -> str:
        if v is None:
            return "smtp.gmail.com"
        cleaned = str(v).strip().strip("'\"")
        return cleaned or "smtp.gmail.com"

    # Google Gemini AI & Vector Embeddings Configuration
    gemini_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("gemini_api_key", "google_api_key", "google_gemini_api_key"),
    )
    gemini_embedding_model: str = Field(
        default="gemini-embedding-001",
        validation_alias=AliasChoices("gemini_embedding_model", "embedding_model"),
    )
    gemini_text_model: str = Field(
        default="gemini-2.0-flash",
        validation_alias=AliasChoices("gemini_text_model", "gemini_model"),
    )

    @field_validator("gemini_api_key", mode="before")
    @classmethod
    def clean_gemini_api_key(cls, v: Any) -> str | None:
        if v is None:
            return None
        cleaned = str(v).strip().strip("'\"")
        return cleaned if cleaned else None

    db_pool_size: int = Field(default=1, ge=1)
    db_max_overflow: int = Field(default=1, ge=0)
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

    @model_validator(mode="before")
    @classmethod
    def assemble_database_configuration(cls, data: Any) -> Any:
        import os

        if not isinstance(data, dict):
            data = {}

        def get_val(key: str) -> str | None:
            if isinstance(data, dict):
                for k, v in data.items():
                    if k.lower() == key.lower() and v:
                        return str(v)
            return os.environ.get(key) or os.environ.get(key.upper()) or os.environ.get(key.lower())

        db_url = get_val("database_url")
        source = "DATABASE_URL"

        if not db_url:
            db_url = get_val("postgres_url")
            source = "POSTGRES_URL"

        if not db_url:
            db_url = get_val("postgres_prisma_url")
            source = "POSTGRES_PRISMA_URL"

        if not db_url:
            db_url = get_val("postgres_url_non_pooling")
            source = "POSTGRES_URL_NON_POOLING"

        if not db_url:
            user = get_val("postgres_user")
            password = get_val("postgres_password")
            host = get_val("postgres_host")
            database = get_val("postgres_database") or "postgres"
            port = get_val("postgres_port") or "6543"

            if user and host:
                quoted_user = quote_plus(user)
                quoted_pass = f":{quote_plus(password)}" if password else ""
                db_url = f"postgresql+psycopg://{quoted_user}{quoted_pass}@{host}:{port}/{database}?sslmode=require"
                source = "POSTGRES_COMPONENTS"

        if db_url:
            # Automatically normalize standard postgres:// or postgresql:// to SQLAlchemy's postgresql+psycopg://
            if db_url.startswith("postgres://"):
                db_url = "postgresql+psycopg://" + db_url[len("postgres://"):]
            elif db_url.startswith("postgresql://"):
                db_url = "postgresql+psycopg://" + db_url[len("postgresql://"):]

            # Strip Prisma-specific query parameters like pgbouncer=true which cause libpq/psycopg errors
            parsed = urlparse(db_url)
            if "pgbouncer" in parsed.query:
                qs = parse_qs(parsed.query, keep_blank_values=True)
                qs.pop("pgbouncer", None)
                new_query = urlencode(qs, doseq=True)
                db_url = urlunparse(parsed._replace(query=new_query))

            data["database_url"] = db_url
            data["db_connection_source"] = source

        return data

    @field_validator("database_url")
    @classmethod
    def validate_database_url(
        cls,
        value: str,
    ) -> str:
        if not value or not isinstance(value, str):
            raise ValueError("Database connection URL must be a non-empty string.")

        allowed_prefixes = (
            "postgresql+psycopg://",
            "postgresql+psycopg_async://",
        )

        if not value.startswith(allowed_prefixes):
            raise ValueError("DATABASE_URL must use the SQLAlchemy psycopg dialect.")

        return value

    @property
    def masked_database_url(self) -> str:
        try:
            parsed = urlparse(self.database_url)
            if parsed.password:
                netloc = parsed.netloc.replace(f":{parsed.password}@", ":****@")
                return parsed._replace(netloc=netloc).geturl()
            return self.database_url
        except Exception:
            return "postgresql+psycopg://****"

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
        if "*" not in hosts:
            if "*.koyeb.app" not in hosts:
                hosts.append("*.koyeb.app")
            if "*.vercel.app" not in hosts:
                hosts.append("*.vercel.app")
        return hosts

    @property
    def is_serverless(self) -> bool:
        import os

        return bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))

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
