import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { role } = await req.json();
  
  const user = await prisma.user.findFirst({
    where: { role },
    include: { tenant: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const session = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenantId,
  };

  const response = NextResponse.json(session);
  response.cookies.set("session", JSON.stringify(session), {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("session");
  return response;
}
