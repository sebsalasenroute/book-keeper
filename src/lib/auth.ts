import { cookies } from "next/headers";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "JUNIOR" | "SENIOR";
  tenantId: string;
};

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session?.value) return null;
  try {
    return JSON.parse(session.value) as SessionUser;
  } catch {
    return null;
  }
}
