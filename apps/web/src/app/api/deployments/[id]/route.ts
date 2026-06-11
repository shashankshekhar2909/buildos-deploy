import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    // TODO: trigger restart via Docker API through worker
    const updated = await prisma.deployment.update({
      where: { id: params.id },
      data: { status: "QUEUED" },
    });
    return NextResponse.json(updated);
  }

  if (action === "stop") {
    // TODO: stop container via Docker API
    const updated = await prisma.deployment.update({
      where: { id: params.id },
      data: { status: "STOPPED" },
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
