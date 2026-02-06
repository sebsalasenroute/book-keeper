import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { transactionId, splits } = await req.json();

  if (!transactionId || !splits || splits.length < 2) {
    return NextResponse.json({ error: "Need transactionId and at least 2 splits" }, { status: 400 });
  }

  const parent = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!parent) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const totalSplit = splits.reduce((sum: number, s: any) => sum + s.amountCents, 0);
  if (totalSplit !== parent.amountCents) {
    return NextResponse.json({ error: "Split amounts must equal original" }, { status: 400 });
  }

  const children = [];
  for (const split of splits) {
    const child = await prisma.transaction.create({
      data: {
        engagementId: parent.engagementId,
        documentId: parent.documentId,
        parentId: parent.id,
        date: parent.date,
        vendorRaw: parent.vendorRaw,
        vendorNorm: parent.vendorNorm,
        amountCents: split.amountCents,
        currency: parent.currency,
        description: split.description || parent.description,
        state: "NEW",
      },
    });

    if (split.category) {
      await prisma.classification.create({
        data: {
          transactionId: child.id,
          category: split.category,
          source: "MANUAL",
          confidence: 100,
          explanation: `Split transaction classified by ${session.name}`,
        },
      });
    }

    children.push(child);
  }

  return NextResponse.json({ parent: parent.id, children });
}
