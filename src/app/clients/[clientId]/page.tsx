"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type Engagement = {
  id: string;
  year: number;
  documents: Array<{ id: string; filename: string; status: string; uploadedAt: string }>;
  transactions: Array<{
    id: string;
    state: string;
    amountCents: number;
    classifications: Array<{ category: string; confidence: number; source: string }>;
  }>;
};

type ClientDetail = {
  id: string;
  name: string;
  entityType: string;
  province: string;
  gstRegistered: boolean;
  engagements: Engagement[];
};

const ENTITY_LABELS: Record<string, string> = {
  SOLE_PROP: "Sole Proprietorship",
  CORP: "Corporation",
  PARTNERSHIP: "Partnership",
};

export default function ClientDetailPage() {
  const router = useRouter();
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        if (!r.ok) return null;
        return r.json();
      })
      .then((d) => d && setClient(d))
      .finally(() => setLoading(false));
  }, [clientId, router]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-400">Loading...</div></div>;
  }

  if (!client) {
    return <div className="text-center text-gray-500 py-12">Client not found</div>;
  }

  const eng = client.engagements[0];
  const txns = eng?.transactions || [];
  const total = txns.reduce((sum, t) => sum + t.amountCents, 0);
  const byState = {
    NEW: txns.filter((t) => t.state === "NEW").length,
    SUGGESTED: txns.filter((t) => t.state === "SUGGESTED").length,
    PREPARED: txns.filter((t) => t.state === "PREPARED").length,
    REVIEWED: txns.filter((t) => t.state === "REVIEWED").length,
  };
  const lowConfidence = txns.filter(
    (t) => t.classifications[0] && t.classifications[0].confidence < 70
  ).length;

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => router.push("/clients")} className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
          ← Back to Clients
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{client.name}</h1>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
          <span>{ENTITY_LABELS[client.entityType]}</span>
          <span>•</span>
          <span>{client.province}</span>
          {client.gstRegistered && (
            <>
              <span>•</span>
              <span className="text-blue-600">GST Registered</span>
            </>
          )}
        </div>
      </div>

      {eng && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <StatCard label="Total" value={`$${(total / 100).toLocaleString()}`} />
            <StatCard label="New" value={byState.NEW} highlight={byState.NEW > 0} />
            <StatCard label="Suggested" value={byState.SUGGESTED} highlight={byState.SUGGESTED > 0} />
            <StatCard label="Prepared" value={byState.PREPARED} />
            <StatCard label="Reviewed" value={byState.REVIEWED} />
          </div>

          {lowConfidence > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 mb-6 text-sm text-amber-800">
              {lowConfidence} transaction{lowConfidence > 1 ? "s" : ""} with low confidence (&lt;70%) need attention
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <ActionButton href={`/clients/${clientId}/upload`} label="Upload Documents" sublabel={`${eng.documents.length} documents`} />
            <ActionButton href={`/clients/${clientId}/review/junior`} label="Junior Review" sublabel={`${byState.NEW + byState.SUGGESTED} pending`} primary />
            <ActionButton href={`/clients/${clientId}/review/senior`} label="Senior Review" sublabel={`${byState.PREPARED} to review`} />
            <ActionButton href={`/clients/${clientId}/export`} label="Export" sublabel={`${byState.REVIEWED} reviewed`} />
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Documents</h2>
            {eng.documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents uploaded yet</p>
            ) : (
              <div className="space-y-2">
                {eng.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{doc.filename}</span>
                    <StatusBadge status={doc.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!eng && (
        <div className="text-center text-gray-500 py-12 bg-white rounded-lg border border-gray-200">
          No engagements found for this client
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${highlight ? "text-blue-600" : "text-gray-900"}`}>
        {value}
      </div>
    </div>
  );
}

function ActionButton({ href, label, sublabel, primary }: { href: string; label: string; sublabel: string; primary?: boolean }) {
  return (
    <a
      href={href}
      className={`block rounded-lg border px-4 py-3 text-center transition-colors ${
        primary
          ? "text-white border-transparent hover:opacity-90"
          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
      }`}
      style={primary ? { backgroundColor: "#3B82F6" } : {}}
    >
      <div className={`text-sm font-medium ${primary ? "text-white" : ""}`}>{label}</div>
      <div className={`text-xs mt-0.5 ${primary ? "text-blue-100" : "text-gray-400"}`}>{sublabel}</div>
    </a>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    UPLOADED: "bg-gray-100 text-gray-600",
    PROCESSING: "bg-blue-50 text-blue-600",
    READY: "bg-blue-50 text-blue-600",
    FAILED: "bg-red-50 text-red-600",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || ""}`}>
      {status}
    </span>
  );
}
