from fastapi import APIRouter, HTTPException, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from ...core.database import get_session
from ...models import Project
from pydantic import BaseModel
from typing import Optional
import cuid

router = APIRouter()


class ProjectCreate(BaseModel):
    name: str
    github_repo: str
    branch: str = "main"
    build_command: Optional[str] = None
    start_command: Optional[str] = None
    port: int = 3000
    env_vars: dict = {}
    user_id: str


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    branch: Optional[str] = None
    build_command: Optional[str] = None
    start_command: Optional[str] = None
    port: Optional[int] = None
    env_vars: Optional[dict] = None


@router.get("/")
async def list_projects(user_id: str, session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(Project).where(Project.user_id == user_id))
    return result.all()


@router.post("/", status_code=201)
async def create_project(data: ProjectCreate, session: AsyncSession = Depends(get_session)):
    project = Project(**data.model_dump(), id=cuid.cuid())
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project


@router.get("/{project_id}")
async def get_project(project_id: str, session: AsyncSession = Depends(get_session)):
    project = await session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}")
async def update_project(
    project_id: str, data: ProjectUpdate, session: AsyncSession = Depends(get_session)
):
    project = await session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(project, field, value)
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project(project_id: str, session: AsyncSession = Depends(get_session)):
    project = await session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await session.delete(project)
    await session.commit()
