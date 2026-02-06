"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

type Document = {
  id: string;
  filename: string;
  mimeType: string;
  status: string;
  uploadedAt: string;
};

type ClientDetail = {
  id: string;
  name: string;
  engagements: Array<{ id: string; year: number; documents: Document[] }>;
};

export default function UploadPage() {
  const router = useRouter();
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchClient = useCallback(() => {
    fetch(`/api/clients/${clientId}`)
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((d) => d && setClient(d))
      .finally(() => setLoading(false));
  }, [clientId, router]);

  useEffect(() => {
    fetchClient();
    const interval = setInterval(fetchClient, 5000);
    return () => clearInterval(interval);
  }, [fetchClient]);

  async function handleUpload(files: FileList) {
    if (!client?.engagements[0]) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("engagementId", client.engagements[0].id);

      await fetch("/api/documents", { method: "POST", body: formData });
    }

    setUploading(false);
    fetchClient();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-400">Loading...</div></div>;
  }

  const eng = client?.engagements[0];
  const docs = eng?.documents || [];

  return (
    <div>
      <button onClick={() => router.push(`/clients/${clientId}`)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        ← Back to {client?.name}
      </button>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Upload Documents</h1>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors mb-6 ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"
        }`}
      >
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-gray-400 mb-4">
          Supports CSV, PDF, XLSX
        </p>
        <label
          className="inline-block px-4 py-2 rounded-md text-white text-sm font-medium cursor-pointer transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#3B82F6" }}
        >
          {uploading ? "Uploading..." : "Choose Files"}
          <input
            type="file"
            className="hidden"
            accept=".csv,.pdf,.xlsx"
            multiple
            disabled={uploading}
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </label>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-700">
            Uploaded Documents ({docs.length})
          </h2>
        </div>
        {docs.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No documents uploaded yet
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2 font-medium text-gray-600">Filename</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-2 font-medium text-gray-600">Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100">
                  <td className="px-4 py-2 text-gray-900">{doc.filename}</td>
                  <td className="px-4 py-2 text-gray-600">{doc.mimeType}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    UPLOADED: "bg-gray-100 text-gray-600",
    PROCESSING: "bg-blue-50 text-blue-600",
    READY: "bg-green-50 text-green-600",
    FAILED: "bg-red-50 text-red-600",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || ""}`}>
      {status === "PROCESSING" ? "Processing..." : status}
    </span>
  );
}
