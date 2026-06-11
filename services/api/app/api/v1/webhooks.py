"""GitHub push webhook → triggers new deployment."""
import hashlib
import hmac
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from ...core.database import get_session
from ...core.config import settings
from ...models import Project, Deployment, DeploymentStatus
import cuid

router = APIRouter()


def verify_signature(payload: bytes, signature: str | None) -> bool:
    if not signature:
        return False
    secret = settings.API_SECRET_KEY.encode()
    expected = "sha256=" + hmac.new(secret, payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/github/{project_id}")
async def github_webhook(
    project_id: str, request: Request, session: AsyncSession = Depends(get_session)
):
    body = await request.body()
    sig = request.headers.get("X-Hub-Signature-256")
    if not verify_signature(body, sig):
        raise HTTPException(status_code=401, detail="Invalid signature")

    payload = await request.json()
    ref = payload.get("ref", "")
    project = await session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if ref != f"refs/heads/{project.branch}":
        return {"ignored": True, "reason": "branch mismatch"}

    head_commit = payload.get("head_commit", {})
    deployment = Deployment(
        id=cuid.cuid(),
        project_id=project_id,
        commit_sha=head_commit.get("id"),
        commit_message=head_commit.get("message"),
        status=DeploymentStatus.QUEUED,
    )
    session.add(deployment)
    await session.commit()

    # Enqueue — token must be stored on project or fetched from account
    # TODO: retrieve github_token from user account
    return {"queued": True, "deployment_id": deployment.id}
