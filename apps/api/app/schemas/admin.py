from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr

class AdminUserItem(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    organization_name: str | None = None
    organization_id: UUID | None = None
    organization_type: str | None = None
    category: str | None = None
    membership_status: str | None = None
    user_status: str
    role: str = "CITIZEN"
    is_superuser: bool = False
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

class AdminUserListResponse(BaseModel):
    users: list[AdminUserItem]
    total: int

class AdminOrgItem(BaseModel):
    id: UUID
    name: str
    slug: str
    organization_type: str
    member_count: int = 0
    is_active: bool = True
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)

class AdminOrgListResponse(BaseModel):
    organizations: list[AdminOrgItem]
    total: int

class MembershipActionResponse(BaseModel):
    status: str = "success"
    message: str
    user_id: UUID
    membership_status: str
    user_status: str


class UserCategoryCount(BaseModel):
    category: str
    label: str
    count: int
    percentage: float


class MonthlySubmissionCount(BaseModel):
    month: str
    label: str
    count: int


class MostViewedPaperItem(BaseModel):
    id: UUID
    title: str
    slug: str
    journal: str | None = None
    views: int
    citations: int


class AdminAnalyticsResponse(BaseModel):
    total_page_views: int
    total_users: int
    total_resources: int
    users_by_category: list[UserCategoryCount]
    resources_per_month: list[MonthlySubmissionCount]
    most_viewed_papers: list[MostViewedPaperItem]
