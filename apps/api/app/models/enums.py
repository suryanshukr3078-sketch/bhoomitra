from enum import Enum, StrEnum


def enum_values(enum_class: type[Enum]) -> list[str]:
    return [str(member.value) for member in enum_class]


class UserStatus(StrEnum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DISABLED = "disabled"


class MembershipStatus(StrEnum):
    PENDING = "pending"
    INVITED = "invited"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    REMOVED = "removed"


class OrganizationType(StrEnum):
    GOVERNMENT = "government"
    ACADEMIC = "academic"
    RESEARCH = "research"
    CIVIL_SOCIETY = "civil_society"
    PRIVATE = "private"
    INTERNATIONAL = "international"
    COMMUNITY = "community"
    OTHER = "other"


class ResourceType(StrEnum):
    RESEARCH_PAPER = "research_paper"
    POLICY = "policy"
    SPATIAL_LAYER = "spatial_layer"
    DATASET = "dataset"
    REPORT = "report"
    LEGAL_DOCUMENT = "legal_document"
    MODEL = "model"
    CASE_STUDY = "case_study"


class ResourceStatus(StrEnum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class ResourceVisibility(StrEnum):
    PUBLIC = "public"
    REGISTERED = "registered"
    RESTRICTED = "restricted"
    CONFIDENTIAL = "confidential"


class PolicyLifecycleStatus(StrEnum):
    DRAFT = "draft"
    CONSULTATION = "consultation"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    SUPERSEDED = "superseded"
    WITHDRAWN = "withdrawn"


class SpatialStorageType(StrEnum):
    POSTGIS = "postgis"
    COG = "cloud_optimized_geotiff"
    PMTILES = "pmtiles"
    WMS = "wms"
    WFS = "wfs"
    VECTOR_TILES = "vector_tiles"
    EXTERNAL = "external"


class ProvenanceActivityStatus(StrEnum):
    STARTED = "started"
    COMPLETED = "completed"
    FAILED = "failed"


class ProvenanceRelation(StrEnum):
    CITES = "cites"
    USES_DATA = "uses_data"
    USES_MODEL = "uses_model"
    DERIVED_FROM = "derived_from"
    TRANSFORMED_FROM = "transformed_from"
    VALIDATES = "validates"
    SUPERSEDES = "supersedes"


class EvidenceRelation(StrEnum):
    SUPPORTS = "supports"
    CONTRADICTS = "contradicts"
    CONTEXTUALIZES = "contextualizes"
    REPLICATES = "replicates"
