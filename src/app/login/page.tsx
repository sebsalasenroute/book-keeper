"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin(role: "JUNIOR" | "SENIOR") {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        router.push("/clients");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Accounting App
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Maple Leaf Accounting LLP
          </p>
        </div>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Select your role to continue
        </p>
        <div className="space-y-3">
          <button
            onClick={() => handleLogin("JUNIOR")}
            disabled={loading}
            className="w-full py-3 px-4 rounded-md text-white font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#3B82F6" }}
          >
            Login as Junior Bookkeeper
            <span className="block text-xs opacity-80 mt-0.5">
              Sarah Chen – Prepare transactions for review
            </span>
          </button>
          <button
            onClick={() => handleLogin("SENIOR")}
            disabled={loading}
            className="w-full py-3 px-4 bg-gray-100 rounded-md text-gray-700 font-medium hover:bg-gray-200 transition-colors border border-gray-300 disabled:opacity-50"
          >
            Login as Senior Reviewer
            <span className="block text-xs text-gray-500 mt-0.5">
              David Thompson – Review and approve transactions
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
