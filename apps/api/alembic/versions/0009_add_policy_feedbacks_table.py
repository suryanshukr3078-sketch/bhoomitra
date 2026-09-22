"""add policy feedbacks table

Revision ID: 0009_add_policy_feedbacks
Revises: 0008_move_vector_to_extensions
Create Date: 2026-09-22 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0009_add_policy_feedbacks"
down_revision: str | None = "0008_move_vector_to_extensions"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "policy_feedbacks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            nullable=False,
        ),
        sa.Column(
            "policy_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("policies.resource_id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "parent_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("policy_feedbacks.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column(
            "comment",
            sa.Text(),
            nullable=False,
        ),
        sa.Column(
            "is_flagged",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_index(
        "ix_policy_feedbacks_policy_id",
        "policy_feedbacks",
        ["policy_id"],
    )
    op.create_index(
        "ix_policy_feedbacks_user_id",
        "policy_feedbacks",
        ["user_id"],
    )
    op.create_index(
        "ix_policy_feedbacks_parent_id",
        "policy_feedbacks",
        ["parent_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_policy_feedbacks_parent_id", table_name="policy_feedbacks")
    op.drop_index("ix_policy_feedbacks_user_id", table_name="policy_feedbacks")
    op.drop_index("ix_policy_feedbacks_policy_id", table_name="policy_feedbacks")
    op.drop_table("policy_feedbacks")
