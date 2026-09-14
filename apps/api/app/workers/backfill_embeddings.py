import asyncio
import logging
import sys
from pathlib import Path

# Ensure app package is in sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import AsyncSessionFactory
from app.models.enums import ResourceStatus
from app.models.resources import Resource, ResourceVersion
from app.services.embedding_service import (
    EMBEDDING_DIMENSION,
    generate_embedding,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("bhoomitra.backfill")


async def backfill_published_resource_embeddings() -> dict[str, int]:
    """
    Scans all published resources in the database and ensures each has a
    768-dimensional AI semantic embedding in resource_versions.
    """
    logger.info("Starting embedding backfill for all published resources...")

    total_inspected = 0
    versions_updated = 0
    versions_created = 0

    async with AsyncSessionFactory() as session:
        # Query all published resources with their versions
        stmt = (
            select(Resource)
            .options(selectinload(Resource.versions))
            .where(Resource.status == ResourceStatus.PUBLISHED)
        )
        res = await session.execute(stmt)
        resources = res.scalars().all()
        total_inspected = len(resources)

        logger.info(f"Found {total_inspected} published resources to inspect.")

        for r in resources:
            text_content = f"{r.title}\n\n{r.abstract or ''}".strip()
            embedding_vec = generate_embedding(text_content, allow_fallback=True)

            if not embedding_vec or len(embedding_vec) != EMBEDDING_DIMENSION:
                logger.warning(f"Could not generate valid {EMBEDDING_DIMENSION}-dim embedding for resource: '{r.title}'")
                continue

            if r.versions and len(r.versions) > 0:
                for v in r.versions:
                    if v.embedding is None:
                        v.embedding = embedding_vec
                        versions_updated += 1
                        logger.info(f"Updated embedding on existing version {v.version_label} for '{r.title[:45]}'")
            else:
                # Create initial v1.0 version with embedding
                new_version = ResourceVersion(
                    resource_id=r.id,
                    version_number=1,
                    version_label="v1.0",
                    original_filename=f"{r.slug}.pdf",
                    storage_uri=r.source_url,
                    mime_type="application/pdf",
                    embedding=embedding_vec,
                    created_by_id=r.created_by_id,
                )
                session.add(new_version)
                versions_created += 1
                logger.info(f"Created default version v1.0 with embedding for '{r.title[:45]}'")

        await session.commit()

    logger.info("==================================================")
    logger.info("BACKFILL COMPLETED SUCCESSFULLY:")
    logger.info(f"  Total published resources inspected: {total_inspected}")
    logger.info(f"  Existing versions updated:           {versions_updated}")
    logger.info(f"  New versions provisioned:            {versions_created}")
    logger.info(f"  Total embeddings stored:             {versions_updated + versions_created}")
    logger.info(f"  Embedding dimension:                 {EMBEDDING_DIMENSION}")
    logger.info("==================================================")

    return {
        "inspected": total_inspected,
        "updated": versions_updated,
        "created": versions_created,
        "dimension": EMBEDDING_DIMENSION,
    }


if __name__ == "__main__":
    result = asyncio.run(backfill_published_resource_embeddings())
    print("Execution Result:", result)
