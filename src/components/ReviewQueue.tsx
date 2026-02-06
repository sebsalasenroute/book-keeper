"use client";

import { Fragment, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/constants";

type Classification = {
  id: string;
  category: string;
  source: string;
  confidence: number;
  explanation: string;
};

type Transaction = {
  id: string;
  date: string;
  vendorRaw: string;
  vendorNorm: string | null;
  amountCents: number;
  currency: string;
  description: string;
  state: string;
  classifications: Classification[];
  children: Transaction[];
};

type Props = {
  role: "JUNIOR" | "SENIOR";
};

type Filters = {
  state: string;
  uncategorizedOnly: boolean;
  lowConfidence: boolean;
  changedVsPriorYear: boolean;
};

export default function ReviewQueue({ role }: Props) {
  const router = useRouter();
  const { clientId } = useParams<{ clientId: string }>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [engagementId, setEngagementId] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [focusIdx, setFocusIdx] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    state: "",
    uncategorizedOnly: false,
    lowConfidence: false,
    changedVsPriorYear: false,
  });
  const [splitTxnId, setSplitTxnId] = useState<string | null>(null);
  const [splitAmounts, setSplitAmounts] = useState<[number, number]>([0, 0]);
  const [splitCategories, setSplitCategories] = useState<[string, string]>(["Uncategorized", "Uncategorized"]);
  const [splitDescs, setSplitDescs] = useState<[string, string]>(["", ""]);
  const tableRef = useRef<HTMLDivElement>(null);

  // Fetch engagement ID first
  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then((r) => {
        if (r.status === 401) { router.push("/login"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d?.engagements?.[0]) {
          setEngagementId(d.engagements[0].id);
          setClientName(d.name);
        }
      });
  }, [clientId, router]);

  const fetchTransactions = useCallback(() => {
    if (!engagementId) return;

    const params = new URLSearchParams({ engagementId });
    if (filters.state) params.set("state", filters.state);
    if (filters.uncategorizedOnly) params.set("uncategorizedOnly", "true");
    if (filters.lowConfidence) params.set("lowConfidence", "true");
    if (filters.changedVsPriorYear) params.set("changedVsPriorYear", "true");

    fetch(`/api/transactions?${params}`)
      .then((r) => r.json())
      .then(setTransactions)
      .finally(() => setLoading(false));
  }, [engagementId, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA") return;

      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => Math.min(i + 1, transactions.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const txn = transactions[focusIdx];
        if (txn) {
          if (role === "JUNIOR") {
            handleBulkAction("prepare", [txn.id]);
          } else {
            handleBulkAction("review", [txn.id]);
          }
        }
      } else if (e.key === " ") {
        e.preventDefault();
        const txn = transactions[focusIdx];
        if (txn) {
          setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(txn.id)) next.delete(txn.id);
            else next.add(txn.id);
            return next;
          });
        }
      } else if (CATEGORY_KEYS[e.key]) {
        e.preventDefault();
        const txn = transactions[focusIdx];
        if (txn) {
          handleClassify(txn.id, CATEGORY_KEYS[e.key]);
        }
      } else if (e.key === "a" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (selected.size === transactions.length) {
          setSelected(new Set());
        } else {
          setSelected(new Set(transactions.map((t) => t.id)));
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [transactions, focusIdx, role, selected]);

  // Scroll focused row into view
  useEffect(() => {
    const row = document.querySelector(`[data-row-idx="${focusIdx}"]`);
    if (row) row.scrollIntoView({ block: "nearest" });
  }, [focusIdx]);

  async function handleBulkAction(action: string, ids?: string[]) {
    const targetIds = ids || Array.from(selected);
    if (targetIds.length === 0) return;

    await fetch("/api/transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: targetIds, action }),
    });

    setSelected(new Set());
    fetchTransactions();
  }

  async function handleClassify(id: string, category: string) {
    await fetch("/api/transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id], action: "classify", category }),
    });
    fetchTransactions();
  }

  async function handleSplit(transactionId: string) {
    const res = await fetch("/api/transactions/split", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionId,
        splits: [
          { amountCents: splitAmounts[0], category: splitCategories[0], description: splitDescs[0] },
          { amountCents: splitAmounts[1], category: splitCategories[1], description: splitDescs[1] },
        ],
      }),
    });

    if (res.ok) {
      setSplitTxnId(null);
      fetchTransactions();
    }
  }

  function openSplit(txn: Transaction) {
    const half = Math.floor(txn.amountCents / 2);
    setSplitTxnId(txn.id);
    setSplitAmounts([half, txn.amountCents - half]);
    const cat = txn.classifications[0]?.category || "Uncategorized";
    setSplitCategories([cat, "Uncategorized"]);
    setSplitDescs([txn.description, txn.description]);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-400">Loading transactions...</div></div>;
  }

  const actionLabel = role === "JUNIOR" ? "Prepare" : "Review";
  const actionKey = role === "JUNIOR" ? "prepare" : "review";

  return (
    <div>
      <button onClick={() => router.push(`/clients/${clientId}`)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
        ← Back to {clientName}
      </button>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">
          {role === "JUNIOR" ? "Junior" : "Senior"} Review Queue
        </h1>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={() => handleBulkAction(actionKey)}
              className="px-3 py-1.5 rounded-md text-white text-sm font-medium"
              style={{ backgroundColor: "#3B82F6" }}
            >
              {actionLabel} Selected ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4 bg-white rounded-lg border border-gray-200 px-4 py-3">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Filters</label>
        <select
          value={filters.state}
          onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
        >
          <option value="">All States</option>
          <option value="NEW">New</option>
          <option value="SUGGESTED">Suggested</option>
          <option value="PREPARED">Prepared</option>
          <option value="REVIEWED">Reviewed</option>
        </select>
        <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.uncategorizedOnly}
            onChange={(e) => setFilters((f) => ({ ...f, uncategorizedOnly: e.target.checked }))}
            className="rounded border-gray-300"
          />
          Uncategorized
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.lowConfidence}
            onChange={(e) => setFilters((f) => ({ ...f, lowConfidence: e.target.checked }))}
            className="rounded border-gray-300"
          />
          Low Confidence
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.changedVsPriorYear}
            onChange={(e) => setFilters((f) => ({ ...f, changedVsPriorYear: e.target.checked }))}
            className="rounded border-gray-300"
          />
          Changed vs Prior Year
        </label>
        <span className="ml-auto text-xs text-gray-400">{transactions.length} transactions</span>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-400">
        <span><kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">j/k</kbd> navigate</span>
        <span><kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">space</kbd> select</span>
        <span><kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">enter</kbd> {actionLabel.toLowerCase()}</span>
        <span><kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">1-0</kbd> set category</span>
        <span><kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">Ctrl+A</kbd> select all</span>
      </div>

      {/* Transaction table */}
      <div ref={tableRef} className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="w-8 px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.size === transactions.length && transactions.length > 0}
                  onChange={() => {
                    if (selected.size === transactions.length) setSelected(new Set());
                    else setSelected(new Set(transactions.map((t) => t.id)));
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Date</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Vendor</th>
              <th className="text-right px-3 py-2 font-medium text-gray-600">Amount</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Category</th>
              <th className="text-center px-3 py-2 font-medium text-gray-600">Conf.</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Source</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">State</th>
              <th className="text-left px-3 py-2 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No transactions match the current filters
                </td>
              </tr>
            ) : (
              transactions.map((txn, idx) => {
                const cls = txn.classifications[0];
                const isFocused = idx === focusIdx;
                const isSelected = selected.has(txn.id);
                const isLowConf = cls && cls.confidence < 70;
                const isUncategorized = cls?.category === "Uncategorized" || !cls;

                return (
                  <Fragment key={txn.id}>
                    <tr
                      data-row-idx={idx}
                      onClick={() => setFocusIdx(idx)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${
                        isFocused ? "bg-blue-50 ring-1 ring-inset ring-blue-200" : isSelected ? "bg-blue-25" : "hover:bg-gray-50"
                      } ${isLowConf ? "bg-amber-25" : ""}`}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (next.has(txn.id)) next.delete(txn.id);
                              else next.add(txn.id);
                              return next;
                            });
                          }}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                        {new Date(txn.date).toLocaleDateString("en-CA")}
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-gray-900 font-medium">{txn.vendorNorm || txn.vendorRaw}</div>
                        {txn.vendorNorm && txn.vendorNorm !== txn.vendorRaw && (
                          <div className="text-xs text-gray-400">{txn.vendorRaw}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-gray-900 whitespace-nowrap">
                        ${(txn.amountCents / 100).toFixed(2)}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={cls?.category || "Uncategorized"}
                          onChange={(e) => handleClassify(txn.id, e.target.value)}
                          className={`text-sm border rounded px-1.5 py-0.5 w-full max-w-[180px] ${
                            isUncategorized ? "border-red-300 bg-red-50" : "border-gray-300 bg-white"
                          }`}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-xs font-medium ${
                          (cls?.confidence || 0) >= 80 ? "text-blue-600" :
                          (cls?.confidence || 0) >= 50 ? "text-amber-600" : "text-red-500"
                        }`}>
                          {cls?.confidence ?? "-"}%
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <SourceBadge source={cls?.source || "AI"} />
                      </td>
                      <td className="px-3 py-2">
                        <StateBadge state={txn.state} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {role === "JUNIOR" && txn.state !== "PREPARED" && txn.state !== "REVIEWED" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleBulkAction("prepare", [txn.id]); }}
                              className="text-xs px-2 py-1 rounded text-white font-medium"
                              style={{ backgroundColor: "#3B82F6" }}
                            >
                              Prepare
                            </button>
                          )}
                          {role === "SENIOR" && txn.state === "PREPARED" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleBulkAction("review", [txn.id]); }}
                              className="text-xs px-2 py-1 rounded text-white font-medium"
                              style={{ backgroundColor: "#3B82F6" }}
                            >
                              Review
                            </button>
                          )}
                          {txn.children.length === 0 && txn.state !== "REVIEWED" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openSplit(txn); }}
                              className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                              Split
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {/* Split children */}
                    {txn.children.length > 0 && txn.children.map((child) => {
                      const childCls = child.classifications[0];
                      return (
                        <tr key={child.id} className="border-b border-gray-100 bg-gray-50/50">
                          <td className="px-3 py-1.5"></td>
                          <td className="px-3 py-1.5 text-gray-400 text-xs">↳ split</td>
                          <td className="px-3 py-1.5 text-gray-500 text-xs">{child.description}</td>
                          <td className="px-3 py-1.5 text-right font-mono text-gray-600 text-xs">
                            ${(child.amountCents / 100).toFixed(2)}
                          </td>
                          <td className="px-3 py-1.5">
                            <select
                              value={childCls?.category || "Uncategorized"}
                              onChange={(e) => handleClassify(child.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white"
                            >
                              {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-1.5 text-center text-xs text-gray-400">
                            {childCls?.confidence ?? "-"}%
                          </td>
                          <td className="px-3 py-1.5">
                            <SourceBadge source={childCls?.source || "MANUAL"} />
                          </td>
                          <td className="px-3 py-1.5">
                            <StateBadge state={child.state} />
                          </td>
                          <td></td>
                        </tr>
                      );
                    })}
                    {/* Split editor inline */}
                    {splitTxnId === txn.id && (
                      <tr className="border-b border-blue-200 bg-blue-50/50">
                        <td colSpan={9} className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-700 mb-2">
                            Split Transaction (${(txn.amountCents / 100).toFixed(2)})
                          </div>
                          <div className="space-y-2">
                            {[0, 1].map((i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-16">Split {i + 1}:</span>
                                <input
                                  type="number"
                                  value={(splitAmounts[i] / 100).toFixed(2)}
                                  onChange={(e) => {
                                    const cents = Math.round(parseFloat(e.target.value) * 100) || 0;
                                    setSplitAmounts((prev) => {
                                      const next = [...prev] as [number, number];
                                      next[i] = cents;
                                      next[1 - i] = txn.amountCents - cents;
                                      return next;
                                    });
                                  }}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm w-28"
                                  step="0.01"
                                />
                                <select
                                  value={splitCategories[i]}
                                  onChange={(e) => {
                                    setSplitCategories((prev) => {
                                      const next = [...prev] as [string, string];
                                      next[i] = e.target.value;
                                      return next;
                                    });
                                  }}
                                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                  {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={splitDescs[i]}
                                  onChange={(e) => {
                                    setSplitDescs((prev) => {
                                      const next = [...prev] as [string, string];
                                      next[i] = e.target.value;
                                      return next;
                                    });
                                  }}
                                  placeholder="Description"
                                  className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                                />
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => handleSplit(txn.id)}
                              disabled={splitAmounts[0] + splitAmounts[1] !== txn.amountCents || splitAmounts[0] <= 0 || splitAmounts[1] <= 0}
                              className="text-xs px-3 py-1.5 rounded text-white font-medium disabled:opacity-50"
                              style={{ backgroundColor: "#3B82F6" }}
                            >
                              Confirm Split
                            </button>
                            <button
                              onClick={() => setSplitTxnId(null)}
                              className="text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-600"
                            >
                              Cancel
                            </button>
                            {splitAmounts[0] + splitAmounts[1] !== txn.amountCents && (
                              <span className="text-xs text-red-500">
                                Amounts must sum to ${(txn.amountCents / 100).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {transactions.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 bg-white rounded-lg border border-gray-200 px-4 py-3">
          <span>
            Total: ${(transactions.reduce((s, t) => s + t.amountCents, 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <span>
            {transactions.filter((t) => t.state === "PREPARED").length} prepared · {transactions.filter((t) => t.state === "REVIEWED").length} reviewed
          </span>
        </div>
      )}
    </div>
  );
}

function StateBadge({ state }: { state: string }) {
  const colors: Record<string, string> = {
    NEW: "bg-gray-100 text-gray-600",
    SUGGESTED: "bg-blue-50 text-blue-600",
    PREPARED: "bg-amber-50 text-amber-600",
    REVIEWED: "bg-blue-50 text-blue-600",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${colors[state] || ""}`}>
      {state}
    </span>
  );
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    PRIOR_YEAR: "bg-purple-50 text-purple-600",
    RULE: "bg-indigo-50 text-indigo-600",
    AI: "bg-cyan-50 text-cyan-600",
    MANUAL: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${colors[source] || ""}`}>
      {source === "PRIOR_YEAR" ? "Prior Year" : source}
    </span>
  );
}
