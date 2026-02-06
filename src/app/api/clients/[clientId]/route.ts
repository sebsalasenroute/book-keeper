import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { clientId } = await params;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      engagements: {
        include: {
          documents: true,
          transactions: {
            include: { classifications: { orderBy: { createdAt: "desc" }, take: 1 } },
          },
        },
        orderBy: { year: "desc" },
      },
    },
  });

  if (!client || client.tenantId !== session.tenantId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(client);
}
