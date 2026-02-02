"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TemplateNode {
  nodeId: string;
  type: string;
  label: string;
  config: Record<string, unknown>;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  status: string;
  isTemplate: boolean;
  nodes: TemplateNode[];
  edges: { edgeId: string; sourceNode: string; targetNode: string }[];
  createdAt: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  content: "📝",
  code: "🔒",
  research: "🔬",
  audit: "🛡️",
  deploy: "🚀",
  default: "⚡",
};

function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("content") || lower.includes("write")) return CATEGORY_ICONS.content;
  if (lower.includes("code") || lower.includes("audit")) return CATEGORY_ICONS.code;
  if (lower.includes("research") || lower.includes("parallel")) return CATEGORY_ICONS.research;
  if (lower.includes("deploy")) return CATEGORY_ICONS.deploy;
  return CATEGORY_ICONS.default;
}

function getSpecialties(template: Template): string[] {
  const specialties = new Set<string>();
  template.nodes.forEach((n) => {
    const config = n.config as Record<string, unknown>;
    if (config.agentSpecialty && typeof config.agentSpecialty === "string") {
      specialties.add(config.agentSpecialty);
    }
    if (Array.isArray(config.tags)) {
      (config.tags as string[]).slice(0, 2).forEach((t) => specialties.add(t));
    }
  });
  return Array.from(specialties).slice(0, 5);
}

function getTotalReward(template: Template): number {
  return template.nodes.reduce((sum, n) => {
    const config = n.config as Record<string, unknown>;
    return sum + (typeof config.reward === "number" ? config.reward : 0);
  }, 0);
}

function getJobCount(template: Template): number {
  return template.nodes.filter((n) => n.type === "job").length;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cloning, setCloning] = useState<string | null>(null);
  const [cloneSuccess, setCloneSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch templates");
        return r.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : data.templates || [];
        setTemplates(list);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleClone = async (templateId: string) => {
    setCloning(templateId);
    setCloneSuccess(null);
    try {
      const res = await fetch(`/api/templates/${templateId}/clone`, { method: "POST" });
      if (!res.ok) throw new Error("Clone failed");
      const data = await res.json();
      setCloneSuccess(data.id || templateId);
      // Redirect to editor with the cloned pipeline
      if (data.id) {
        window.location.href = `/editor?pipeline=${data.id}`;
      }
    } catch {
      setError("Failed to clone template");
    } finally {
      setCloning(null);
    }
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Template Library
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Start from a pre-built workflow. Clone any template and customize it in the editor.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6 animate-pulse">
                <div className="h-8 w-8 bg-slate-800 rounded-lg mb-4" />
                <div className="h-5 bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-800 rounded w-full mb-1" />
                <div className="h-4 bg-slate-800 rounded w-2/3 mb-4" />
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-slate-800 rounded-full" />
                  <div className="h-6 w-16 bg-slate-800 rounded-full" />
                </div>
                <div className="h-9 bg-slate-800 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-300 text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && templates.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-slate-300 mb-2">No templates yet</h2>
            <p className="text-slate-500 mb-6">Templates will appear here once the database is seeded.</p>
            <Link
              href="/editor"
              className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
            >
              Build from scratch →
            </Link>
          </div>
        )}

        {/* Template Grid */}
        {!loading && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const specialties = getSpecialties(template);
              const totalReward = getTotalReward(template);
              const jobCount = getJobCount(template);
              const icon = getCategoryIcon(template.name);
              const isCloning = cloning === template.id;

              return (
                <div
                  key={template.id}
                  className="group bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-blue-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5"
                >
                  {/* Icon + Title */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl w-10 h-10 flex items-center justify-center bg-slate-800 rounded-lg shrink-0">
                      {icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100 group-hover:text-white transition-colors">
                        {template.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {template.description || "A pre-built workflow template."}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      {jobCount} jobs
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {template.nodes.length} nodes
                    </span>
                    {totalReward > 0 && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {totalReward} $OW
                      </span>
                    )}
                  </div>

                  {/* Specialty Tags */}
                  {specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {specialties.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleClone(template.id)}
                      disabled={isCloning}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isCloning ? "Cloning..." : "Use Template →"}
                    </button>
                    <Link
                      href={`/editor?template=${template.id}`}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-slate-300"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Banner */}
        {!loading && templates.length > 0 && (
          <div className="mt-10 bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-sm text-slate-300 font-medium">How templates work</p>
              <p className="text-sm text-slate-500 mt-1">
                Click &quot;Use Template&quot; to clone a workflow into your own pipelines. You can then customize
                the nodes, adjust rewards, change agent specialties, and add or remove steps in the editor.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
