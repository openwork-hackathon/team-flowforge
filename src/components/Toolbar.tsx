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
  const [showFileMenu, setShowFileMenu] = useState(false);
  const loadRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (loadRef.current && !loadRef.current.contains(e.target as HTMLElement)) {
        setShowLoadDropdown(false);
      }
      if (fileRef.current && !fileRef.current.contains(e.target as HTMLElement)) {
        setShowFileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const statusConfig: Record<SaveStatus, { text: string; color: string }> = {
    saved: { text: "✓ Saved", color: "text-green-400" },
    unsaved: { text: "● Unsaved changes", color: "text-amber-400" },
    saving: { text: "⟳ Saving…", color: "text-blue-400 animate-pulse" },
    error: { text: "✕ Save failed", color: "text-red-400" },
  };

  const status = statusConfig[saveStatus];

  return (
    <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-3">
      {/* Pipeline Name */}
      <input
        type="text"
        value={pipelineName}
        onChange={(e) => onNameChange(e.target.value)}
        className="bg-transparent border-b border-slate-600 text-slate-200 text-sm font-semibold px-1 py-0.5 focus:border-blue-500 focus:outline-none w-48"
        placeholder="Pipeline name..."
      />

      {/* Save status indicator */}
      <span className={`text-[11px] ${status.color} whitespace-nowrap`}>
        {status.text}
      </span>

      <div className="h-6 w-px bg-slate-700" />

      {/* Add Nodes */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">
          Add:
        </span>
        <button
          onClick={() => onAddNode("start")}
          className="px-2.5 py-1 text-xs bg-green-900/50 text-green-400 border border-green-700 rounded-md hover:bg-green-800/50 transition-colors"
        >
          ▶ Start
        </button>
        <button
          onClick={() => onAddNode("job")}
          className="px-2.5 py-1 text-xs bg-blue-900/50 text-blue-400 border border-blue-700 rounded-md hover:bg-blue-800/50 transition-colors"
        >
          + Job
        </button>
        <button
          onClick={() => onAddNode("condition")}
          className="px-2.5 py-1 text-xs bg-amber-900/50 text-amber-400 border border-amber-700 rounded-md hover:bg-amber-800/50 transition-colors"
        >
          ⑂ Condition
        </button>
        <button
          onClick={() => onAddNode("end")}
          className="px-2.5 py-1 text-xs bg-red-900/50 text-red-400 border border-red-700 rounded-md hover:bg-red-800/50 transition-colors"
        >
          ⏹ End
        </button>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Save to API */}
        <button
          onClick={onSave}
          disabled={saveStatus === "saving"}
          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-blue-400 text-white rounded-md transition-colors font-medium"
        >
          💾 Save
        </button>

        {/* Run pipeline */}
        <button
          onClick={onRun}
          disabled={!pipelineId || isRunning}
          title={!pipelineId ? "Save pipeline first" : "Run pipeline"}
          className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-md transition-colors font-medium"
        >
          {isRunning ? "⟳ Running…" : "▶ Run"}
        </button>

        {/* Load Pipeline dropdown */}
        <div className="relative" ref={loadRef}>
          <button
            onClick={() => {
              if (!showLoadDropdown) onRefreshPipelines();
              setShowLoadDropdown(!showLoadDropdown);
            }}
            className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors"
          >
            📂 Load Pipeline
          </button>
          {showLoadDropdown && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
              {pipelines.length === 0 ? (
                <div className="px-3 py-4 text-xs text-slate-500 text-center">
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
                    className="w-full text-left px-3 py-2 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0"
                  >
                    <div className="text-sm text-slate-200 font-medium truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-500 flex gap-2 mt-0.5">
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

        {/* File menu (Export/Import JSON) */}
        <div className="relative" ref={fileRef}>
          <button
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-400 rounded-md transition-colors"
            title="More options"
          >
            ⋯
          </button>
          {showFileMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50">
              <button
                onClick={() => {
                  onExportJSON();
                  setShowFileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 transition-colors rounded-t-lg"
              >
                📄 Export JSON
              </button>
              <button
                onClick={() => {
                  onImportJSON();
                  setShowFileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
              >
                📥 Import JSON
              </button>
              <div className="border-t border-slate-700" />
              <button
                onClick={() => {
                  onClear();
                  setShowFileMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-900/30 transition-colors rounded-b-lg"
              >
                🗑 Clear Canvas
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
