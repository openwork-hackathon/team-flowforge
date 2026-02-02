"use client";

import { useState, useRef, useEffect } from "react";

export interface PipelineSummary {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
  _count?: { nodes: number; edges: number; runs: number };
}

export type SaveStatus = "saved" | "unsaved" | "saving" | "error";

interface ToolbarProps {
  onAddNode: (type: "job" | "condition" | "start" | "end") => void;
  onSave: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onClear: () => void;
  onRun: () => void;
  onLoadPipeline: (id: string) => void;
  pipelineName: string;
  onNameChange: (name: string) => void;
  saveStatus: SaveStatus;
  pipelineId: string | null;
  pipelines: PipelineSummary[];
  onRefreshPipelines: () => void;
  isRunning: boolean;
}

/* ── Tiny divider between groups ──────────────────────────────── */
function Divider() {
  return <div className="w-px h-6 bg-forge-border mx-1" />;
}

/* ── Tooltip wrapper ──────────────────────────────────────────── */
function Tip({ label, shortcut, children }: { label: string; shortcut?: string; children: React.ReactNode }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 rounded-lg glass-panel text-[10px] text-forge-text-secondary whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity z-50">
        {label}
        {shortcut && (
          <span className="ml-1.5 text-forge-text-muted font-mono">{shortcut}</span>
        )}
      </div>
    </div>
  );
}

export default function Toolbar({
  onAddNode,
  onSave,
  onExportJSON,
  onImportJSON,
  onClear,
  onRun,
  onLoadPipeline,
  pipelineName,
  onNameChange,
  saveStatus,
  pipelineId,
  pipelines,
  onRefreshPipelines,
  isRunning,
}: ToolbarProps) {
  const [showLoadDropdown, setShowLoadDropdown] = useState(false);
  const loadRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (loadRef.current && !loadRef.current.contains(e.target as HTMLElement)) {
        setShowLoadDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const statusConfig: Record<SaveStatus, { icon: string; color: string }> = {
    saved: { icon: "✓", color: "text-forge-success" },
    unsaved: { icon: "●", color: "text-forge-warning" },
    saving: { icon: "⟳", color: "text-forge-blue animate-spin" },
    error: { icon: "✕", color: "text-forge-error" },
  };

  const st = statusConfig[saveStatus];

  /* pill button base */
  const pill = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 active:scale-[0.97]";

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 px-3 py-1.5 glass-panel rounded-2xl shadow-card-float">

      {/* ── Pipeline name + status ──────────────────────────────── */}
      <div className="flex items-center gap-2 pr-1">
        <input
          type="text"
          value={pipelineName}
          onChange={(e) => onNameChange(e.target.value)}
          className="bg-transparent text-forge-text-primary text-sm font-semibold w-40 px-1.5 py-0.5 rounded-lg border border-transparent focus:border-forge-border-active focus:outline-none transition-colors"
          placeholder="Pipeline name..."
        />
        <span className={`text-sm ${st.color}`} title={saveStatus}>{st.icon}</span>
      </div>

      <Divider />

      {/* ── Node palette ────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        <Tip label="Add Start node">
          <button
            onClick={() => onAddNode("start")}
            className={`${pill} text-emerald-400 hover:bg-emerald-500/10 hover:shadow-[0_0_12px_rgba(16,185,129,0.15)]`}
          >
            <span>▶</span><span className="hidden sm:inline">Start</span>
          </button>
        </Tip>
        <Tip label="Add Job node">
          <button
            onClick={() => onAddNode("job")}
            className={`${pill} text-forge-blue-light hover:bg-forge-blue/10 hover:shadow-[0_0_12px_rgba(59,130,246,0.15)]`}
          >
            <span>💼</span><span className="hidden sm:inline">Job</span>
          </button>
        </Tip>
        <Tip label="Add Condition node">
          <button
            onClick={() => onAddNode("condition")}
            className={`${pill} text-amber-400 hover:bg-amber-500/10 hover:shadow-[0_0_12px_rgba(245,158,11,0.15)]`}
          >
            <span>🔀</span><span className="hidden sm:inline">Condition</span>
          </button>
        </Tip>
        <Tip label="Add End node">
          <button
            onClick={() => onAddNode("end")}
            className={`${pill} text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_12px_rgba(239,68,68,0.15)]`}
          >
            <span>⏹</span><span className="hidden sm:inline">End</span>
          </button>
        </Tip>
      </div>

      <Divider />

      {/* ── Pipeline actions ────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        <Tip label="Save pipeline" shortcut="⌘S">
          <button
            onClick={onSave}
            disabled={saveStatus === "saving"}
            className={`${pill} glass-btn-primary disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            💾 <span className="hidden sm:inline">Save</span>
          </button>
        </Tip>

        <Tip label={!pipelineId ? "Save first to run" : "Run pipeline"}>
          <button
            onClick={onRun}
            disabled={!pipelineId || isRunning}
            className={`${pill} glass-btn-success disabled:opacity-40 disabled:cursor-not-allowed ${
              isRunning ? "animate-glow-pulse" : ""
            }`}
          >
            {isRunning ? "⟳" : "▶"} <span className="hidden sm:inline">{isRunning ? "Running…" : "Run"}</span>
          </button>
        </Tip>

        {/* Load dropdown */}
        <div className="relative" ref={loadRef}>
          <Tip label="Load pipeline">
            <button
              onClick={() => {
                if (!showLoadDropdown) onRefreshPipelines();
                setShowLoadDropdown(!showLoadDropdown);
              }}
              className={`${pill} text-forge-text-secondary hover:text-forge-text-primary hover:bg-forge-border/30`}
            >
              📂 <span className="hidden sm:inline">Load</span>
            </button>
          </Tip>
          {showLoadDropdown && (
            <div className="absolute left-0 top-full mt-2 w-72 glass-panel rounded-xl shadow-card-float z-50 max-h-64 overflow-y-auto animate-scale-in">
              {pipelines.length === 0 ? (
                <div className="px-3 py-4 text-xs text-forge-text-muted text-center">
                  No pipelines saved yet
                </div>
              ) : (
                pipelines.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onLoadPipeline(p.id);
                      setShowLoadDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-forge-border/20 transition-colors border-b border-forge-border last:border-0 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="text-sm text-forge-text-primary font-medium truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-forge-text-muted flex gap-2 mt-0.5">
                      <span>{p._count?.nodes ?? 0} nodes</span>
                      <span>·</span>
                      <span>{p._count?.runs ?? 0} runs</span>
                      <span>·</span>
                      <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <Divider />

      {/* ── File actions ────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        <Tip label="Export JSON" shortcut="⌘E">
          <button
            onClick={onExportJSON}
            className={`${pill} text-forge-text-secondary hover:text-forge-text-primary hover:bg-forge-border/30`}
          >
            ↗
          </button>
        </Tip>
        <Tip label="Import JSON">
          <button
            onClick={onImportJSON}
            className={`${pill} text-forge-text-secondary hover:text-forge-text-primary hover:bg-forge-border/30`}
          >
            ↙
          </button>
        </Tip>
        <Tip label="Clear canvas">
          <button
            onClick={onClear}
            className={`${pill} text-forge-text-secondary hover:text-red-400 hover:bg-red-500/10`}
          >
            🗑
          </button>
        </Tip>
      </div>
    </div>
  );
}
