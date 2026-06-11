"""
Celery worker: handles build → push → run pipeline for each deployment.
"""
import asyncio
import os
import shutil
import tempfile
from celery import Celery
from ..core.config import settings
from ..services.docker_service import docker_service
from ..services.github_service import GitHubService
import structlog

log = structlog.get_logger()

celery_app = Celery(
    "buildos",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    task_track_started=True,
)


@celery_app.task(bind=True, name="deploy.run", max_retries=3)
def run_deployment(
    self,
    deployment_id: str,
    project_id: str,
    github_repo: str,
    branch: str,
    build_command: str | None,
    start_command: str | None,
    port: int,
    env_vars: dict,
    github_token: str,
) -> dict:
    from sqlmodel import Session, create_engine, select
    from ..models import Deployment, DeploymentStatus, Project
    from datetime import datetime

    engine = create_engine(settings.DATABASE_URL.replace("+asyncpg", ""))

    def update_status(status: DeploymentStatus, logs: str = "") -> None:
        with Session(engine) as session:
            deployment = session.get(Deployment, deployment_id)
            if deployment:
                deployment.status = status
                if logs:
                    deployment.logs = (deployment.logs or "") + logs + "\n"
                deployment.updated_at = datetime.utcnow()
                session.add(deployment)
                session.commit()

    workdir = tempfile.mkdtemp(prefix="buildos-")
    try:
        update_status(DeploymentStatus.BUILDING, "Cloning repository...")
        gh = GitHubService(github_token)
        asyncio.run(gh.clone_repo(github_repo, branch, workdir))

        tag = f"buildos/{project_id}:{deployment_id[:8]}"
        update_status(DeploymentStatus.BUILDING, f"Building image {tag}...")
        image_id, build_logs = asyncio.run(
            docker_service.build_image(workdir, tag)
        )
        update_status(DeploymentStatus.BUILDING, build_logs)

        update_status(DeploymentStatus.DEPLOYING, "Starting container...")
        container_name = f"buildos-{deployment_id[:12]}"
        container_id = asyncio.run(
            docker_service.run_container(tag, container_name, port, env_vars)
        )

        host_port = asyncio.run(
            docker_service.get_container_port(container_id, port)
        )
        url = f"http://localhost:{host_port}" if host_port else None

        with Session(engine) as session:
            deployment = session.get(Deployment, deployment_id)
            if deployment:
                deployment.status = DeploymentStatus.RUNNING
                deployment.image_tag = tag
                deployment.container_id = container_id
                deployment.url = url
                deployment.started_at = datetime.utcnow()
                deployment.logs = (deployment.logs or "") + "Deployment successful.\n"
                session.add(deployment)
                session.commit()

        log.info("deployment_complete", deployment_id=deployment_id, url=url)
        return {"deployment_id": deployment_id, "status": "RUNNING", "url": url}

    except Exception as exc:
        log.error("deployment_failed", deployment_id=deployment_id, error=str(exc))
        update_status(DeploymentStatus.FAILED, f"ERROR: {exc}")
        raise self.retry(exc=exc, countdown=30)
    finally:
        shutil.rmtree(workdir, ignore_errors=True)
