"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Session = {
  id: string;
  name: string;
  role: "JUNIOR" | "SENIOR";
  email: string;
};

export default function Navbar() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith("session="));
    if (cookie) {
      try {
        setSession(JSON.parse(decodeURIComponent(cookie.split("=").slice(1).join("="))));
      } catch {}
    }
  }, []);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <a href="/clients" className="text-lg font-semibold text-gray-900 hover:text-gray-700">
          Accounting App
        </a>
        <span className="text-gray-300">|</span>
        <a href="/clients" className="text-sm text-gray-600 hover:text-gray-900">
          Clients
        </a>
      </div>
      {session && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {session.name}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: session.role === "SENIOR" ? "#FEF3C7" : "#DBEAFE",
              color: session.role === "SENIOR" ? "#92400E" : "#1E40AF",
            }}
          >
            {session.role}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
