import httpx
import structlog

log = structlog.get_logger()

GITHUB_API = "https://api.github.com"


class GitHubService:
    def __init__(self, token: str) -> None:
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }

    async def list_repos(self) -> list[dict]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{GITHUB_API}/user/repos",
                headers=self.headers,
                params={"sort": "updated", "per_page": 100},
            )
            resp.raise_for_status()
            return resp.json()

    async def get_latest_commit(self, repo: str, branch: str = "main") -> dict | None:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{GITHUB_API}/repos/{repo}/commits/{branch}",
                headers=self.headers,
            )
            if resp.status_code == 404:
                return None
            resp.raise_for_status()
            return resp.json()

    async def create_webhook(self, repo: str, webhook_url: str) -> dict:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                f"{GITHUB_API}/repos/{repo}/hooks",
                headers=self.headers,
                json={
                    "name": "web",
                    "active": True,
                    "events": ["push"],
                    "config": {
                        "url": webhook_url,
                        "content_type": "json",
                        "insecure_ssl": "0",
                    },
                },
            )
            resp.raise_for_status()
            return resp.json()

    async def clone_repo(self, repo: str, branch: str, dest: str) -> None:
        import subprocess
        url = f"https://github.com/{repo}.git"
        result = subprocess.run(
            ["git", "clone", "--depth", "1", "--branch", branch, url, dest],
            capture_output=True, text=True, timeout=120
        )
        if result.returncode != 0:
            raise RuntimeError(f"git clone failed: {result.stderr}")
