import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      let lastLength = 0;

      const send = (data: object) => {
        if (!closed) {
          try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
        }
      };

      const poll = async () => {
        if (closed) return;
        const d = await prisma.deployment.findFirst({
          where: { id: params.id, project: { userId: (session.user as any).id } },
          select: { logs: true, status: true },
        });
        if (!d) { send({ error: "not found" }); controller.close(); return; }

        if (d.logs && d.logs.length > lastLength) {
          send({ log: d.logs.slice(lastLength) });
          lastLength = d.logs.length;
        }

        if (["RUNNING", "FAILED", "STOPPED"].includes(d.status)) {
          send({ status: d.status, done: true });
          controller.close();
          return;
        }
        if (!closed) setTimeout(poll, 1000);
      };

      send({ status: "connected" });
      poll();

      req.signal.addEventListener("abort", () => { closed = true; try { controller.close(); } catch {} });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
