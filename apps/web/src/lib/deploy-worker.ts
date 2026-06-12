import { prisma } from './prisma'
import { buildCloneUrl } from './git-url'
import { spawn } from 'child_process'
import { rm, mkdir, access } from 'fs/promises'
import { createServer } from 'net'
import path from 'path'
import os from 'os'

async function appendLog(id: string, text: string) {
  await prisma.$executeRaw`UPDATE "Deployment" SET logs = COALESCE(logs, '') || ${text}, "updatedAt" = NOW() WHERE id = ${id}`
}

async function runCmd(cmd: string, args: string[], cwd: string, deploymentId: string): Promise<number> {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
    proc.stdout.on('data', (d: Buffer) => { appendLog(deploymentId, d.toString()).catch(() => {}) })
    proc.stderr.on('data', (d: Buffer) => { appendLog(deploymentId, d.toString()).catch(() => {}) })
    proc.on('close', (code) => resolve(code ?? 1))
    proc.on('error', (err) => { appendLog(deploymentId, `Error: ${err.message}\n`).catch(() => {}); resolve(1) })
  })
}

async function findFreePort(start = 10000, end = 60000): Promise<number> {
  for (let port = start; port <= end; port++) {
    const free = await new Promise<boolean>((resolve) => {
      const srv = createServer()
      srv.listen(port, '0.0.0.0', () => srv.close(() => resolve(true)))
      srv.on('error', () => resolve(false))
    })
    if (free) return port
  }
  throw new Error('No free port available in range 10000-60000')
}

async function fileExists(p: string): Promise<boolean> {
  try { await access(p); return true } catch { return false }
}

const COMPOSE_FILES = ['docker-compose.yml', 'docker-compose.yaml', 'compose.yml', 'compose.yaml']

export async function runDeployment(deploymentId: string): Promise<void> {
  const deployment = await prisma.deployment.findUnique({
    where: { id: deploymentId },
    include: { project: { include: { user: true } } },
  })
  if (!deployment) return

  const { project } = deployment
  const user = project.user as any
  const workDir = path.join(os.tmpdir(), `buildos-${deploymentId}`)
  const containerName = `buildos-proj-${project.id}`

  try {
    await prisma.deployment.update({ where: { id: deploymentId }, data: { status: 'BUILDING', startedAt: new Date() } })
    await appendLog(deploymentId, `[BuildOS] Starting deployment ${deploymentId.slice(0, 8)}\n`)

    await rm(workDir, { recursive: true, force: true })
    await mkdir(workDir, { recursive: true })

    // git clone
    const repoUrl = buildCloneUrl(project.githubRepo, user.githubToken)
    const displayUrl = project.githubRepo.replace(/https?:\/\/[^@]+@/, 'https://')
    await appendLog(deploymentId, `[BuildOS] Cloning ${displayUrl} (branch: ${project.branch})\n`)
    const cloneCode = await runCmd('git', ['clone', '--depth=1', '--branch', project.branch, repoUrl, '.'], workDir, deploymentId)
    if (cloneCode !== 0) throw new Error('git clone failed')

    // detect compose
    const composeFile = (await Promise.all(COMPOSE_FILES.map(async f => {
      return (await fileExists(path.join(workDir, f))) ? f : null
    }))).find(Boolean)

    await prisma.deployment.update({ where: { id: deploymentId }, data: { status: 'DEPLOYING' } })

    const envVars = (project.envVars as Record<string, string>) || {}

    if (composeFile) {
      // ── compose flow ──────────────────────────────────────────────
      await appendLog(deploymentId, `[BuildOS] Detected ${composeFile} — using docker compose\n`)

      // stop old compose stack
      await runCmd('docker', ['compose', '-p', containerName, 'down', '--remove-orphans'], workDir, deploymentId)

      // build env args for compose
      const envArgs = Object.entries(envVars).flatMap(([k, v]) => ['--env', `${k}=${v}`])
      const upCode = await runCmd('docker', [
        'compose', '-p', containerName,
        'up', '--build', '-d', '--remove-orphans',
        ...envArgs,
      ], workDir, deploymentId)
      if (upCode !== 0) throw new Error('docker compose up failed')

      const url = `http://localhost:${project.port}`
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: 'RUNNING', finishedAt: new Date(), url, containerId: containerName, deployMode: 'COMPOSE' },
      })
      await appendLog(deploymentId, `[BuildOS] ✓ Compose stack running. App port: ${project.port} → ${url}\n`)

    } else {
      // ── single Dockerfile flow ────────────────────────────────────
      const imageTag = `buildos-${project.id}:${deploymentId.slice(0, 8)}`
      await appendLog(deploymentId, `[BuildOS] Building Docker image ${imageTag}\n`)
      const buildCode = await runCmd('docker', ['build', '-t', imageTag, '.'], workDir, deploymentId)
      if (buildCode !== 0) throw new Error('docker build failed')

      // stop old container
      await appendLog(deploymentId, `[BuildOS] Removing old container (if any)\n`)
      await runCmd('docker', ['rm', '-f', containerName], workDir, deploymentId)

      // find free host port
      const hostPort = await findFreePort()
      await appendLog(deploymentId, `[BuildOS] Starting container — host port ${hostPort} → container port ${project.port}\n`)

      const envArgs = Object.entries(envVars).flatMap(([k, v]) => ['-e', `${k}=${v}`])
      const runCode = await runCmd('docker', [
        'run', '-d',
        '--name', containerName,
        '-p', `${hostPort}:${project.port}`,
        '--restart', 'unless-stopped',
        ...envArgs,
        imageTag,
      ], workDir, deploymentId)
      if (runCode !== 0) throw new Error('docker run failed')

      const url = `http://localhost:${hostPort}`
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: 'RUNNING', finishedAt: new Date(), url, containerId: containerName, imageTag, hostPort, deployMode: 'CONTAINER' },
      })
      await appendLog(deploymentId, `[BuildOS] ✓ Running at ${url}\n`)
    }

  } catch (err: any) {
    await prisma.deployment.update({ where: { id: deploymentId }, data: { status: 'FAILED', finishedAt: new Date() } })
    await appendLog(deploymentId, `[BuildOS] ✗ Failed: ${err.message}\n`)
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {})
  }
}
