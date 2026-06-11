import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  githubRepo: z.string().min(1),
  branch: z.string().default("main"),
  buildCommand: z.string().optional(),
  startCommand: z.string().optional(),
  port: z.coerce.number().int().min(1).max(65535).default(3000),
  envVars: z.record(z.string()).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: (session.user as any).id },
    include: { deployments: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = createProjectSchema.parse(body);

  const project = await prisma.project.create({
    data: {
      ...data,
      userId: (session.user as any).id,
      envVars: data.envVars || {},
    },
  });

  return NextResponse.json(project, { status: 201 });
}
