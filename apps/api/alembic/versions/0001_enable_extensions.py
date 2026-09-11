from collections.abc import Sequence

from alembic import op

revision: str = "0001_enable_extensions"
down_revision: str | None = None

branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.execute("CREATE EXTENSION IF NOT EXISTS citext")

    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")

    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")


def downgrade() -> None:
    # Extensions are intentionally not removed.
    #
    # They may be shared with other schemas, migrations,
    # or database services.
    pass
