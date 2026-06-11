from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON


class Project(SQLModel, table=True):
    __tablename__ = "projects"

    id: str = Field(primary_key=True)
    name: str = Field(index=True)
    github_repo: str
    branch: str = Field(default="main")
    build_command: Optional[str] = None
    start_command: Optional[str] = None
    port: int = Field(default=3000)
    env_vars: dict = Field(default_factory=dict, sa_column=Column(JSON))
    user_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    deployments: list["Deployment"] = Relationship(back_populates="project")
    domains: list["Domain"] = Relationship(back_populates="project")
