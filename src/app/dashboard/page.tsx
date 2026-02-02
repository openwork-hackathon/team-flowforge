"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types (mirror API responses)                                       */
/* ------------------------------------------------------------------ */

interface PipelineSummary {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: { nodes: number; edges: number; runs: number };
}

interface PipelineRun {
  id: string;
  pipelineId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  _count: { nodeRuns: number };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-700 text-slate-300",
  ACTIVE: "bg-green-900/60 text-green-400",
  ARCHIVED: "bg-amber-900/60 text-amber-400",
  RUNNING: "bg-blue-900/60 text-blue-400",
  PENDING: "bg-blue-900/60 text-blue-400",
  COMPLETED: "bg-green-900/60 text-green-400",
  FAILED: "bg-red-900/60 text-red-400",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-slate-700 text-slate-300";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {status}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [pipelines, setPipelines] = useState<PipelineSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected pipeline for runs panel
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);

  /* ---------- Fetch pipelines ---------- */
  const fetchPipelines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/pipelines");
      if (!res.ok) throw new Error(`Failed to fetch pipelines (${res.status})`);
      const json = await res.json();
      setPipelines(json.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipelines();
  }, [fetchPipelines]);

  /* ---------- Fetch runs for selected pipeline ---------- */
  useEffect(() => {
    if (!selectedId) {
      setRuns([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setRunsLoading(true);
      try {
        const res = await fetch(`/api/pipelines/${selectedId}/runs`);
        if (!res.ok) throw new Error("Failed to fetch runs");
        const json = await res.json();
        if (!cancelled) setRuns(json.data ?? []);
      } catch {
        if (!cancelled) setRuns([]);
      } finally {
        if (!cancelled) setRunsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  /* ---------- Actions ---------- */
  const handleRun = async (id: string) => {
    try {
      const res = await fetch(`/api/pipelines/${id}/run`, { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        alert(json.error ?? "Failed to start run");
        return;
      }
      // Refresh runs if this pipeline is selected
      if (selectedId === id) {
        setSelectedId(null);
        setTimeout(() => setSelectedId(id), 50);
      }
      fetchPipelines();
    } catch {
      alert("Network error — could not start run");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete pipeline "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/pipelines/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete pipeline");
        return;
      }
      if (selectedId === id) setSelectedId(null);
      fetchPipelines();
    } catch {
      alert("Network error — could not delete pipeline");
    }
  };

  /* ---------- Render ---------- */
  const selectedPipeline = pipelines.find((p) => p.id === selectedId);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* ===== Header / Nav ===== */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-blue-400 hover:text-blue-300 transition-colors">
            🔨 FlowForge
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-400">
            <Link href="/" className="hover:text-slate-200 transition-colors">
              Home
            </Link>
            <Link href="/editor" className="hover:text-slate-200 transition-colors">
              Editor
            </Link>
            <Link
              href="/dashboard"
              className="text-blue-400 font-medium"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* ===== Title Bar ===== */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pipeline Dashboard</h1>
            <p className="mt-1 text-sm text-slate-400">
              Monitor, run, and manage your automation pipelines
            </p>
          </div>
          <Link
            href="/editor"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            + New Pipeline
          </Link>
        </div>

        {/* ===== Loading / Error ===== */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            <span className="ml-3 text-slate-400">Loading pipelines…</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-800 bg-red-950/50 p-4 text-red-400">
            <p className="font-medium">Error loading pipelines</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              onClick={fetchPipelines}
              className="mt-3 rounded bg-red-800/60 px-3 py-1 text-xs hover:bg-red-800 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* ===== Empty State ===== */}
        {!loading && !error && pipelines.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 py-24">
            <div className="text-5xl">🚀</div>
            <h2 className="mt-4 text-xl font-semibold text-slate-200">
              No pipelines yet
            </h2>
            <p className="mt-2 max-w-md text-center text-sm text-slate-400">
              Create your first automation pipeline in the visual editor and it
              will show up here for monitoring and execution.
            </p>
            <Link
              href="/editor"
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Open Editor →
            </Link>
          </div>
        )}

        {/* ===== Pipeline Grid + Runs ===== */}
        {!loading && !error && pipelines.length > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* --- Pipeline Cards --- */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {pipelines.map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      setSelectedId(selectedId === p.id ? null : p.id)
                    }
                    className={`group relative rounded-xl border text-left transition-all ${
                      selectedId === p.id
                        ? "border-blue-500/60 bg-slate-900 ring-1 ring-blue-500/30"
                        : "border-slate-800 bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <div className="p-5">
                      {/* Top row: name + status */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-100 truncate">
                          {p.name}
                        </h3>
                        <StatusBadge status={p.status} />
                      </div>

                      {/* Description */}
                      {p.description && (
                        <p className="mt-1.5 text-sm text-slate-400 line-clamp-2">
                          {p.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                        <span title="Nodes">
                          <NodeIcon /> {p._count.nodes}
                        </span>
                        <span title="Edges">
                          <EdgeIcon /> {p._count.edges}
                        </span>
                        <span title="Runs">
                          ▶ {p._count.runs}
                        </span>
                        <span className="ml-auto" title="Created">
                          {fmtDate(p.createdAt)}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRun(p.id);
                          }}
                          className="rounded-md bg-blue-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
                          title="Run pipeline"
                        >
                          ▶ Run
                        </button>
                        <Link
                          href={`/editor?pipeline=${p.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
                        >
                          ✏️ Edit
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(p.id, p.name);
                          }}
                          className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/40 transition-colors"
                          title="Delete pipeline"
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* --- Runs Panel --- */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 rounded-xl border border-slate-800 bg-slate-900">
                <div className="border-b border-slate-800 px-5 py-3">
                  <h2 className="text-sm font-semibold text-slate-300">
                    {selectedPipeline
                      ? `Runs — ${selectedPipeline.name}`
                      : "Pipeline Runs"}
                  </h2>
                </div>

                <div className="p-5">
                  {!selectedId && (
                    <p className="text-sm text-slate-500 text-center py-8">
                      Select a pipeline to view its runs
                    </p>
                  )}

                  {selectedId && runsLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                      <span className="ml-2 text-sm text-slate-400">
                        Loading runs…
                      </span>
                    </div>
                  )}

                  {selectedId && !runsLoading && runs.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500">No runs yet</p>
                      <button
                        onClick={() => handleRun(selectedId)}
                        className="mt-3 rounded-md bg-blue-600/80 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-500 transition-colors"
                      >
                        ▶ Start First Run
                      </button>
                    </div>
                  )}

                  {selectedId && !runsLoading && runs.length > 0 && (
                    <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {runs.map((r) => (
                        <li
                          key={r.id}
                          className="rounded-lg border border-slate-800 bg-slate-950 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <StatusBadge status={r.status} />
                            <span className="text-xs text-slate-500 font-mono">
                              {r.id.slice(0, 8)}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1 text-xs text-slate-400">
                            <p>
                              <span className="text-slate-500">Started:</span>{" "}
                              {fmtDate(r.startedAt)}
                            </p>
                            {r.completedAt && (
                              <p>
                                <span className="text-slate-500">
                                  Completed:
                                </span>{" "}
                                {fmtDate(r.completedAt)}
                              </p>
                            )}
                            <p>
                              <span className="text-slate-500">
                                Node runs:
                              </span>{" "}
                              {r._count.nodeRuns}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  Tiny inline icons                                                  */
/* ------------------------------------------------------------------ */

function NodeIcon() {
  return (
    <svg
      className="inline -mt-0.5 mr-0.5 h-3.5 w-3.5"
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      <rect x="3" y="3" width="10" height="10" rx="2" />
    </svg>
  );
}

function EdgeIcon() {
  return (
    <svg
      className="inline -mt-0.5 mr-0.5 h-3.5 w-3.5"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M4 12 L12 4" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="4" r="1.5" fill="currentColor" />
    </svg>
  );
}
