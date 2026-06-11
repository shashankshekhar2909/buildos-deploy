from fastapi import APIRouter, HTTPException, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from ...core.database import get_session
from ...models import Deployment, DeploymentStatus, Project
from ...services.docker_service import docker_service
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import cuid

router = APIRouter()


class DeploymentCreate(BaseModel):
    project_id: str
    commit_sha: Optional[str] = None
    commit_message: Optional[str] = None
    github_token: str


class DeploymentAction(BaseModel):
    action: str  # restart | stop | delete


@router.get("/")
async def list_deployments(
    project_id: Optional[str] = None,
    session: AsyncSession = Depends(get_session),
):
    stmt = select(Deployment)
    if project_id:
        stmt = stmt.where(Deployment.project_id == project_id)
    stmt = stmt.order_by(Deployment.created_at.desc()).limit(50)
    result = await session.exec(stmt)
    return result.all()


@router.post("/", status_code=201)
async def create_deployment(data: DeploymentCreate, session: AsyncSession = Depends(get_session)):
    project = await session.get(Project, data.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    deployment = Deployment(
        id=cuid.cuid(),
        project_id=data.project_id,
        commit_sha=data.commit_sha,
        commit_message=data.commit_message,
        status=DeploymentStatus.QUEUED,
    )
    session.add(deployment)
    await session.commit()
    await session.refresh(deployment)

    # Enqueue Celery task
    from ...workers.deploy_worker import run_deployment
    run_deployment.delay(
        deployment_id=deployment.id,
        project_id=project.id,
        github_repo=project.github_repo,
        branch=project.branch,
        build_command=project.build_command,
        start_command=project.start_command,
        port=project.port,
        env_vars=project.env_vars,
        github_token=data.github_token,
    )

    return deployment


@router.get("/{deployment_id}")
async def get_deployment(deployment_id: str, session: AsyncSession = Depends(get_session)):
    deployment = await session.get(Deployment, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    return deployment


@router.patch("/{deployment_id}")
async def deployment_action(
    deployment_id: str, body: DeploymentAction, session: AsyncSession = Depends(get_session)
):
    deployment = await session.get(Deployment, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    if body.action == "stop":
        if deployment.container_id:
            await docker_service.stop_container(deployment.container_id)
        deployment.status = DeploymentStatus.STOPPED
        deployment.finished_at = datetime.utcnow()

    elif body.action == "restart":
        deployment.status = DeploymentStatus.QUEUED
        deployment.updated_at = datetime.utcnow()
        # TODO: re-enqueue

    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {body.action}")

    session.add(deployment)
    await session.commit()
    await session.refresh(deployment)
    return deployment


@router.delete("/{deployment_id}", status_code=204)
async def delete_deployment(deployment_id: str, session: AsyncSession = Depends(get_session)):
    deployment = await session.get(Deployment, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    if deployment.container_id:
        await docker_service.remove_container(deployment.container_id, force=True)

    await session.delete(deployment)
    await session.commit()


@router.get("/{deployment_id}/logs")
async def get_logs(deployment_id: str, session: AsyncSession = Depends(get_session)):
    deployment = await session.get(Deployment, deployment_id)
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")

    # Live logs from container if running
    if deployment.container_id and deployment.status == DeploymentStatus.RUNNING:
        live_logs = await docker_service.get_container_logs(deployment.container_id)
        return {"logs": live_logs}

    return {"logs": deployment.logs or ""}
