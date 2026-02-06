import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const engagementId = searchParams.get("engagementId");
  const state = searchParams.get("state");
  const uncategorizedOnly = searchParams.get("uncategorizedOnly") === "true";
  const lowConfidence = searchParams.get("lowConfidence") === "true";
  const changedVsPriorYear = searchParams.get("changedVsPriorYear") === "true";

  if (!engagementId) {
    return NextResponse.json({ error: "engagementId required" }, { status: 400 });
  }

  const where: any = { engagementId, parentId: null };
  if (state) where.state = state;

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      classifications: { orderBy: { createdAt: "desc" } },
      children: {
        include: { classifications: { orderBy: { createdAt: "desc" } } },
      },
    },
    orderBy: { date: "asc" },
  });

  let filtered = transactions;

  if (uncategorizedOnly) {
    filtered = filtered.filter((t) => {
      const latest = t.classifications[0];
      return !latest || latest.category === "Uncategorized";
    });
  }

  if (lowConfidence) {
    filtered = filtered.filter((t) => {
      const latest = t.classifications[0];
      return latest && latest.confidence < 70;
    });
  }

  if (changedVsPriorYear) {
    filtered = filtered.filter((t) => {
      const latest = t.classifications[0];
      return latest && latest.source !== "PRIOR_YEAR";
    });
  }

  return NextResponse.json(filtered);
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { ids, action, category } = body;

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ error: "ids required" }, { status: 400 });
  }

  if (action === "prepare" && session.role !== "JUNIOR" && session.role !== "SENIOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (action === "review" && session.role !== "SENIOR") {
    return NextResponse.json({ error: "Only seniors can review" }, { status: 403 });
  }

  const results = [];

  for (const id of ids) {
    const txn = await prisma.transaction.findUnique({
      where: { id },
      include: { classifications: { orderBy: { createdAt: "desc" }, take: 1 } },
    });

    if (!txn) continue;

    const beforeState = txn.state;

    if (action === "prepare") {
      await prisma.transaction.update({
        where: { id },
        data: { state: "PREPARED" },
      });
    } else if (action === "review") {
      await prisma.transaction.update({
        where: { id },
        data: { state: "REVIEWED" },
      });
    } else if (action === "classify" && category) {
      await prisma.classification.create({
        data: {
          transactionId: id,
          category,
          source: "MANUAL",
          confidence: 100,
          explanation: `Manually classified by ${session.name}`,
        },
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId: session.tenantId,
        userId: session.id,
        entityType: "Transaction",
        entityId: id,
        action: action,
        beforeJson: { state: beforeState },
        afterJson: { state: action === "prepare" ? "PREPARED" : action === "review" ? "REVIEWED" : beforeState, category },
      },
    });

    results.push(id);
  }

  return NextResponse.json({ updated: results });
}
