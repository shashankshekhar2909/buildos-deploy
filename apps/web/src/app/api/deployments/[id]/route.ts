import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runDeployment } from "@/lib/deploy-worker";
import { exec as execCb } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(execCb)

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deployment = await prisma.deployment.findFirst({
    where: { id: params.id, project: { userId: (session.user as any).id } },
    include: { project: true },
  });

  if (!deployment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(deployment);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  const deployment = await prisma.deployment.findFirst({
    where: { id: params.id, project: { userId: (session.user as any).id } },
  });
  if (!deployment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "restart") {
    const newDeployment = await prisma.deployment.create({
      data: { projectId: deployment.projectId, status: "QUEUED", commitMessage: "Restart" }
    });
    setImmediate(() => { runDeployment(newDeployment.id).catch(console.error); });
    return NextResponse.json(newDeployment);
  }

  if (action === "stop") {
    const containerName = `buildos-proj-${deployment.projectId}`;
    if ((deployment as any).deployMode === "COMPOSE") {
      // compose projects need `down` not `rm -f`
      await execAsync(`docker compose -p ${containerName} down --remove-orphans`).catch(() => {});
    } else {
      await execAsync(`docker rm -f ${containerName}`).catch(() => {});
    }
    const updated = await prisma.deployment.update({
      where: { id: params.id },
      data: { status: "STOPPED", finishedAt: new Date() }
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deployment = await prisma.deployment.findFirst({
    where: { id: params.id, project: { userId: (session.user as any).id } },
  });
  if (!deployment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.deployment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
