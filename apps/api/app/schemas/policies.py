from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class PolicyFeedbackCreate(BaseModel):
    comment: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="Public consultation comment or feedback on this policy",
    )
    parent_id: UUID | None = Field(
        default=None,
        description="Optional parent comment ID for threaded replies",
    )


class PolicyFeedbackItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    policy_id: UUID
    user_id: UUID
    user_name: str
    user_email: str
    user_role: str | None = None
    parent_id: UUID | None = None
    comment: str
    created_at: datetime
    replies: list["PolicyFeedbackItem"] = []


class PolicyFeedbackListResponse(BaseModel):
    policy_id: str
    total_comments: int
    items: list[PolicyFeedbackItem]
