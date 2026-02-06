"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Client = {
  id: string;
  name: string;
  entityType: string;
  province: string;
  gstRegistered: boolean;
  engagements: Array<{
    id: string;
    year: number;
    _count: { transactions: number; documents: number };
  }>;
};

const ENTITY_LABELS: Record<string, string> = {
  SOLE_PROP: "Sole Prop",
  CORP: "Corporation",
  PARTNERSHIP: "Partnership",
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return [];
        }
        return r.json();
      })
      .then(setClients)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading clients...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
        <span className="text-sm text-gray-500">{clients.length} clients</span>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Client Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Type
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">
                Province
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">
                GST
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">
                Transactions
              </th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">
                Documents
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const eng = client.engagements[0];
              return (
                <tr
                  key={client.id}
                  onClick={() => router.push(`/clients/${client.id}`)}
                  className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {client.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {ENTITY_LABELS[client.entityType] || client.entityType}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{client.province}</td>
                  <td className="px-4 py-3 text-center">
                    {client.gstRegistered ? (
                      <span className="text-green-600 text-xs font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-400 text-xs">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {eng?._count?.transactions ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {eng?._count?.documents ?? 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
