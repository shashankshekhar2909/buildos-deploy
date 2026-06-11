import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addDomainSchema = z.object({
  projectId: z.string().cuid(),
  domain: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const domains = await prisma.domain.findMany({
    where: { project: { userId: (session.user as any).id } },
    include: { project: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(domains);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = addDomainSchema.parse(body);

  const project = await prisma.project.findFirst({
    where: { id: data.projectId, userId: (session.user as any).id },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const domain = await prisma.domain.create({
    data: {
      domain: data.domain,
      projectId: data.projectId,
      verified: false,
    },
  });

  // TODO: create Cloudflare DNS record
  return NextResponse.json(domain, { status: 201 });
}
