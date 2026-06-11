import { prisma } from './prisma'
import { buildCloneUrl } from './git-url'
import { spawn } from 'child_process'
import { rm, mkdir } from 'fs/promises'
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

    // Prepare work directory
    await rm(workDir, { recursive: true, force: true })
    await mkdir(workDir, { recursive: true })

    // git clone — supports https, ssh, owner/repo shorthand
    const repoUrl = buildCloneUrl(project.githubRepo, user.githubToken)
    const displayUrl = project.githubRepo.replace(/https?:\/\/[^@]+@/, 'https://')
    await appendLog(deploymentId, `[BuildOS] Cloning ${displayUrl} (branch: ${project.branch})\n`)
    const cloneCode = await runCmd('git', ['clone', '--depth=1', '--branch', project.branch, repoUrl, '.'], workDir, deploymentId)
    if (cloneCode !== 0) throw new Error('git clone failed')

    // docker build
    const imageTag = `buildos-${project.id}:${deploymentId.slice(0, 8)}`
    await appendLog(deploymentId, `[BuildOS] Building Docker image ${imageTag}\n`)
    const buildCode = await runCmd('docker', ['build', '-t', imageTag, '.'], workDir, deploymentId)
    if (buildCode !== 0) throw new Error('docker build failed')

    // Stop/remove old container
    await appendLog(deploymentId, `[BuildOS] Removing old container (if any)\n`)
    await runCmd('docker', ['rm', '-f', containerName], workDir, deploymentId) // ignore exit code

    // DEPLOYING
    await prisma.deployment.update({ where: { id: deploymentId }, data: { status: 'DEPLOYING', imageTag } })

    // docker run with env vars
    const envVars = (project.envVars as Record<string, string>) || {}
    const envArgs = Object.entries(envVars).flatMap(([k, v]) => ['-e', `${k}=${v}`])
    await appendLog(deploymentId, `[BuildOS] Starting container on port ${project.port}\n`)
    const runCode = await runCmd('docker', [
      'run', '-d',
      '--name', containerName,
      '-p', `${project.port}:${project.port}`,
      '--restart', 'unless-stopped',
      ...envArgs,
      imageTag,
    ], workDir, deploymentId)
    if (runCode !== 0) throw new Error('docker run failed')

    const url = `http://localhost:${project.port}`
    await prisma.deployment.update({ where: { id: deploymentId }, data: { status: 'RUNNING', finishedAt: new Date(), url, containerId: containerName } })
    await appendLog(deploymentId, `[BuildOS] ✓ Running at ${url}\n`)

  } catch (err: any) {
    await prisma.deployment.update({ where: { id: deploymentId }, data: { status: 'FAILED', finishedAt: new Date() } })
    await appendLog(deploymentId, `[BuildOS] ✗ Failed: ${err.message}\n`)
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {})
  }
}
