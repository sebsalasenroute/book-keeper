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

  if (!engagementId) {
    return NextResponse.json({ error: "engagementId required" }, { status: 400 });
  }

  const transactions = await prisma.transaction.findMany({
    where: { engagementId, state: "REVIEWED", parentId: null },
    include: {
      classifications: { orderBy: { createdAt: "desc" }, take: 1 },
      children: {
        include: { classifications: { orderBy: { createdAt: "desc" }, take: 1 } },
      },
    },
    orderBy: { date: "asc" },
  });

  const rows: string[] = ["Date,Vendor,Amount,Currency,Category,Description"];

  for (const txn of transactions) {
    if (txn.children.length > 0) {
      for (const child of txn.children) {
        const cat = child.classifications[0]?.category || "Uncategorized";
        rows.push(
          `${txn.date.toISOString().split("T")[0]},${csvEscape(txn.vendorNorm || txn.vendorRaw)},${(child.amountCents / 100).toFixed(2)},${txn.currency},${csvEscape(cat)},${csvEscape(child.description)}`
        );
      }
    } else {
      const cat = txn.classifications[0]?.category || "Uncategorized";
      rows.push(
        `${txn.date.toISOString().split("T")[0]},${csvEscape(txn.vendorNorm || txn.vendorRaw)},${(txn.amountCents / 100).toFixed(2)},${txn.currency},${csvEscape(cat)},${csvEscape(txn.description)}`
      );
    }
  }

  const csv = rows.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="reviewed-transactions.csv"`,
    },
  });
}

function csvEscape(str: string): string {
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
