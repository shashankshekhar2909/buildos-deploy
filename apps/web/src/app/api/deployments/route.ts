import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runDeployment } from "@/lib/deploy-worker";
import { z } from "zod";

const createDeploymentSchema = z.object({
  projectId: z.string(),
  commitSha: z.string().optional(),
  commitMessage: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const deployments = await prisma.deployment.findMany({
    where: {
      project: { userId: (session.user as any).id },
      ...(projectId ? { projectId } : {}),
    },
    include: { project: { select: { name: true, githubRepo: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(deployments);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = createDeploymentSchema.parse(body);

  const project = await prisma.project.findFirst({
    where: { id: data.projectId, userId: (session.user as any).id },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const deployment = await prisma.deployment.create({
    data: {
      projectId: data.projectId,
      status: "QUEUED",
      commitSha: data.commitSha,
      commitMessage: data.commitMessage,
    },
  });

  // Fire-and-forget background build
  setImmediate(() => { runDeployment(deployment.id).catch(console.error); });

  return NextResponse.json(deployment, { status: 201 });
}
