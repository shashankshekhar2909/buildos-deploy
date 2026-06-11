import asyncio
import docker
from docker.errors import DockerException, NotFound
from ..core.config import settings
import structlog

log = structlog.get_logger()


class DockerService:
    def __init__(self) -> None:
        self._client: docker.DockerClient | None = None

    @property
    def client(self) -> docker.DockerClient:
        if self._client is None:
            self._client = docker.DockerClient(base_url=settings.DOCKER_HOST)
        return self._client

    async def build_image(
        self, repo_path: str, tag: str, buildargs: dict | None = None
    ) -> tuple[str, str]:
        loop = asyncio.get_event_loop()
        image, logs = await loop.run_in_executor(
            None,
            lambda: self.client.images.build(
                path=repo_path,
                tag=tag,
                rm=True,
                buildargs=buildargs or {},
            ),
        )
        log_output = "\n".join(
            line.get("stream", "") for line in logs if isinstance(line, dict)
        )
        return image.id, log_output

    async def run_container(
        self,
        image: str,
        name: str,
        port: int,
        env_vars: dict,
        restart_policy: dict | None = None,
    ) -> str:
        loop = asyncio.get_event_loop()
        container = await loop.run_in_executor(
            None,
            lambda: self.client.containers.run(
                image,
                name=name,
                detach=True,
                ports={f"{port}/tcp": None},
                environment=env_vars,
                restart_policy=restart_policy or {"Name": "on-failure", "MaximumRetryCount": 3},
                labels={"managed-by": "buildos"},
            ),
        )
        return container.id

    async def stop_container(self, container_id: str) -> None:
        loop = asyncio.get_event_loop()
        try:
            container = await loop.run_in_executor(
                None, lambda: self.client.containers.get(container_id)
            )
            await loop.run_in_executor(None, container.stop)
        except NotFound:
            log.warning("container_not_found", container_id=container_id)

    async def remove_container(self, container_id: str, force: bool = False) -> None:
        loop = asyncio.get_event_loop()
        try:
            container = await loop.run_in_executor(
                None, lambda: self.client.containers.get(container_id)
            )
            await loop.run_in_executor(None, lambda: container.remove(force=force))
        except NotFound:
            pass

    async def get_container_logs(self, container_id: str, tail: int = 200) -> str:
        loop = asyncio.get_event_loop()
        try:
            container = await loop.run_in_executor(
                None, lambda: self.client.containers.get(container_id)
            )
            logs = await loop.run_in_executor(
                None, lambda: container.logs(tail=tail, stream=False)
            )
            return logs.decode("utf-8", errors="replace")
        except NotFound:
            return ""

    async def get_container_port(self, container_id: str, internal_port: int) -> int | None:
        loop = asyncio.get_event_loop()
        try:
            container = await loop.run_in_executor(
                None, lambda: self.client.containers.get(container_id)
            )
            ports = container.ports
            bindings = ports.get(f"{internal_port}/tcp")
            if bindings:
                return int(bindings[0]["HostPort"])
        except (NotFound, KeyError, TypeError):
            pass
        return None


docker_service = DockerService()
