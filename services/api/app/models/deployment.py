from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class DeploymentStatus(str, Enum):
    QUEUED = "QUEUED"
    BUILDING = "BUILDING"
    DEPLOYING = "DEPLOYING"
    RUNNING = "RUNNING"
    FAILED = "FAILED"
    STOPPED = "STOPPED"


class Deployment(SQLModel, table=True):
    __tablename__ = "deployments"

    id: str = Field(primary_key=True)
    project_id: str = Field(foreign_key="projects.id", index=True)
    status: DeploymentStatus = Field(default=DeploymentStatus.QUEUED)
    commit_sha: Optional[str] = None
    commit_message: Optional[str] = None
    image_tag: Optional[str] = None
    container_id: Optional[str] = None
    url: Optional[str] = None
    logs: Optional[str] = Field(default=None, sa_column_kwargs={"type_": "TEXT"})
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    project: Optional["Project"] = Relationship(back_populates="deployments")
