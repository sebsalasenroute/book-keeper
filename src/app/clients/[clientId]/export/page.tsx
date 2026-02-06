"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Transaction = {
  id: string;
  date: string;
  vendorRaw: string;
  vendorNorm: string | null;
  amountCents: number;
  currency: string;
  description: string;
  state: string;
  classifications: Array<{ category: string; confidence: number }>;
  children: Array<{
    id: string;
    amountCents: number;
    description: string;
    classifications: Array<{ category: string }>;
  }>;
};

type ClientDetail = {
  id: string;
  name: string;
  engagements: Array<{ id: string; year: number }>;
};

export default function ExportPage() {
  const router = useRouter();
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [engagementId, setEngagementId] = useState("");

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setClient(d);
          if (d.engagements[0]) setEngagementId(d.engagements[0].id);
        }
      });
  }, [clientId, router]);

  useEffect(() => {
    if (!engagementId) return;
    fetch(`/api/transactions?engagementId=${engagementId}&state=REVIEWED`)
      .then((r) => r.json())
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, [engagementId]);

  function handleExport() {
    window.open(`/api/export?engagementId=${engagementId}`, "_blank");
  }

  // Calculate totals by category
  const categoryTotals: Record<string, number> = {};
  for (const txn of transactions) {
    if (txn.children.length > 0) {
      for (const child of txn.children) {
        const cat = child.classifications[0]?.category || "Uncategorized";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + child.amountCents;
      }
    } else {
      const cat = txn.classifications[0]?.category || "Uncategorized";
      categoryTotals[cat] = (categoryTotals[cat] || 0) + txn.amountCents;
    }
  }

  const grandTotal = Object.values(categoryTotals).reduce((s, v) => s + v, 0);

  if (loading && engagementId) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-400">Loading...</div></div>;
  }

  return (
    <div>
      <button onClick={() => router.push(`/clients/${clientId}`)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        ← Back to {client?.name}
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Export Reviewed Transactions</h1>
        <button
          onClick={handleExport}
          disabled={transactions.length === 0}
          className="px-4 py-2 rounded-md text-white text-sm font-medium disabled:opacity-50"
          style={{ backgroundColor: "#3B82F6" }}
        >
          Download CSV ({transactions.length} transactions)
        </button>
      </div>

      {/* Category summary */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-700">Summary by Category</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2 font-medium text-gray-600">Category</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">Amount</th>
              <th className="text-right px-4 py-2 font-medium text-gray-600">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, cents]) => (
                <tr key={cat} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-900">{cat}</td>
                  <td className="px-4 py-2 text-right font-mono text-gray-900">
                    ${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-500">
                    {grandTotal > 0 ? ((cents / grandTotal) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            <tr className="bg-gray-50 font-medium">
              <td className="px-4 py-2 text-gray-900">Total</td>
              <td className="px-4 py-2 text-right font-mono text-gray-900">
                ${(grandTotal / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-2 text-right text-gray-500">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-700">
            Reviewed Transactions ({transactions.length})
          </h2>
        </div>
        {transactions.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No reviewed transactions to export
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Vendor</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">Amount</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Category</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-600">
                    {new Date(txn.date).toLocaleDateString("en-CA")}
                  </td>
                  <td className="px-4 py-2 text-gray-900">{txn.vendorNorm || txn.vendorRaw}</td>
                  <td className="px-4 py-2 text-right font-mono text-gray-900">
                    ${(txn.amountCents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-gray-600">
                    {txn.classifications[0]?.category || "Uncategorized"}
                  </td>
                  <td className="px-4 py-2 text-gray-500 max-w-xs truncate">{txn.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
