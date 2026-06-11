from fastapi import APIRouter, HTTPException, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from ...core.database import get_session
from ...models import Domain, Project
from pydantic import BaseModel
import cuid

router = APIRouter()


class DomainCreate(BaseModel):
    project_id: str
    domain: str


@router.get("/")
async def list_domains(project_id: str | None = None, session: AsyncSession = Depends(get_session)):
    stmt = select(Domain)
    if project_id:
        stmt = stmt.where(Domain.project_id == project_id)
    result = await session.exec(stmt)
    return result.all()


@router.post("/", status_code=201)
async def add_domain(data: DomainCreate, session: AsyncSession = Depends(get_session)):
    project = await session.get(Project, data.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    domain = Domain(id=cuid.cuid(), domain=data.domain, project_id=data.project_id)
    session.add(domain)
    await session.commit()
    await session.refresh(domain)
    # TODO: Cloudflare DNS setup
    return domain


@router.delete("/{domain_id}", status_code=204)
async def remove_domain(domain_id: str, session: AsyncSession = Depends(get_session)):
    domain = await session.get(Domain, domain_id)
    if not domain:
        raise HTTPException(status_code=404, detail="Domain not found")
    await session.delete(domain)
    await session.commit()
