from fastapi import APIRouter

from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.dashboard import router as dashboard_router
from app.api.v1.routes.datasets import router as datasets_router
from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.policies import router as policies_router
from app.api.v1.routes.resources import router as resources_router
from app.api.v1.routes.search import router as search_router
from app.api.v1.routes.spatial import router as spatial_router
from app.api.v1.routes.uploads import router as uploads_router

router = APIRouter()

router.include_router(health_router)
router.include_router(auth_router)
router.include_router(resources_router)
router.include_router(policies_router)
router.include_router(datasets_router)
router.include_router(search_router)
router.include_router(dashboard_router)
router.include_router(spatial_router)
router.include_router(uploads_router)

# Alias for backwards compatibility
api_v1_router = router
