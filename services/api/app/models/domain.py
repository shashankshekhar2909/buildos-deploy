from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class Domain(SQLModel, table=True):
    __tablename__ = "domains"

    id: str = Field(primary_key=True)
    domain: str = Field(unique=True, index=True)
    project_id: str = Field(foreign_key="projects.id", index=True)
    verified: bool = Field(default=False)
    ssl_enabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    project: Optional["Project"] = Relationship(back_populates="domains")
