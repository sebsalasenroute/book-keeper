import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    where: { tenantId: session.tenantId },
    include: {
      engagements: {
        include: {
          _count: { select: { transactions: true, documents: true } },
        },
        orderBy: { year: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(clients);
}
