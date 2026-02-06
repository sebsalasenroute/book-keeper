import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { storage } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const engagementId = formData.get("engagementId") as string;

  if (!file || !engagementId) {
    return NextResponse.json({ error: "Missing file or engagementId" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const savedPath = await storage.save(file.name, buffer);

  const doc = await prisma.document.create({
    data: {
      engagementId,
      filename: savedPath.split("/").pop() || file.name,
      mimeType: file.type || "application/octet-stream",
      status: "UPLOADED",
    },
  });

  // Enqueue processing job
  await prisma.jobQueue.create({
    data: {
      type: "PROCESS_DOCUMENT",
      payload: { documentId: doc.id },
    },
  });

  return NextResponse.json(doc);
}
