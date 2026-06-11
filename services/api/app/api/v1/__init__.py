from fastapi import APIRouter
from .projects import router as projects_router
from .deployments import router as deployments_router
from .domains import router as domains_router
from .webhooks import router as webhooks_router

router = APIRouter()
router.include_router(projects_router, prefix="/projects", tags=["projects"])
router.include_router(deployments_router, prefix="/deployments", tags=["deployments"])
router.include_router(domains_router, prefix="/domains", tags=["domains"])
router.include_router(webhooks_router, prefix="/webhooks", tags=["webhooks"])
