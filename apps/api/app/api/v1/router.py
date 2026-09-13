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

# Documents router alias for direct compatibility with /documents and /documents/{id}
from app.api.v1.routes.resources import (
    create_resource,
    download_resource_file,
    get_resource,
    list_resources,
    view_resource_file,
)

documents_router = APIRouter(prefix="/documents", tags=["Documents"])
documents_router.add_api_route("", list_resources, methods=["GET"])
documents_router.add_api_route("", create_resource, methods=["POST"])
documents_router.add_api_route("/{resource_id}", get_resource, methods=["GET"])
documents_router.add_api_route("/{resource_id}/download", download_resource_file, methods=["GET"])
documents_router.add_api_route("/{resource_id}/view", view_resource_file, methods=["GET"])
router.include_router(documents_router)

# Research router alias for direct compatibility with /research and /research/{id}
research_router = APIRouter(prefix="/research", tags=["Research"])
research_router.add_api_route("", list_resources, methods=["GET"])
research_router.add_api_route("", create_resource, methods=["POST"])
research_router.add_api_route("/{resource_id}", get_resource, methods=["GET"])
research_router.add_api_route("/{resource_id}/download", download_resource_file, methods=["GET"])
research_router.add_api_route("/{resource_id}/view", view_resource_file, methods=["GET"])
router.include_router(research_router)

# Alias for backwards compatibility
api_v1_router = router

