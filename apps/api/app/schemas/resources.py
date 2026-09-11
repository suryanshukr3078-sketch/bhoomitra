from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import (
    PolicyLifecycleStatus,
    ResourceStatus,
    ResourceType,
    ResourceVisibility,
    SpatialStorageType,
)


# Base Resource Schemas
class ResourceBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    slug: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    type: ResourceType
    status: ResourceStatus = ResourceStatus.DRAFT
    visibility: ResourceVisibility = ResourceVisibility.PUBLIC
    organization_id: UUID | None = None
    metadata_fields: dict[str, Any] = Field(default_factory=dict)


class ResourceCreate(ResourceBase):
    pass


class ResourceRead(ResourceBase):
    id: UUID
    created_by_user_id: UUID | None = None
    current_version_id: UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Research Paper Schemas
class ResearchPaperBase(BaseModel):
    doi: str | None = Field(default=None, max_length=255)
    journal_name: str | None = Field(default=None, max_length=255)
    abstract: str | None = None
    peer_reviewed: bool = False
    publication_year: int | None = Field(default=None, ge=1800, le=2100)
    citation_text: str | None = None
    external_url: str | None = None


class ResearchPaperCreate(ResearchPaperBase):
    resource_id: UUID


class ResearchPaperRead(ResearchPaperBase):
    id: UUID
    resource_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Policy Schemas
class PolicyBase(BaseModel):
    policy_number: str | None = Field(default=None, max_length=100)
    issuing_authority: str | None = Field(default=None, max_length=255)
    jurisdiction_code: str = Field(..., max_length=50)
    lifecycle_status: PolicyLifecycleStatus = PolicyLifecycleStatus.DRAFT
    effective_from: datetime | None = None
    effective_to: datetime | None = None
    legal_basis: str | None = None


class PolicyCreate(PolicyBase):
    resource_id: UUID


class PolicyRead(PolicyBase):
    id: UUID
    resource_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Spatial Layer Schemas
class SpatialLayerBase(BaseModel):
    storage_type: SpatialStorageType = SpatialStorageType.POSTGIS
    layer_name: str = Field(..., max_length=100)
    srid: int = Field(default=4326, ge=0)
    feature_count: int = Field(default=0, ge=0)
    geometry_type: str | None = Field(default=None, max_length=50)
    file_path: str | None = None


class SpatialLayerCreate(SpatialLayerBase):
    resource_id: UUID


class SpatialLayerRead(SpatialLayerBase):
    id: UUID
    resource_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
