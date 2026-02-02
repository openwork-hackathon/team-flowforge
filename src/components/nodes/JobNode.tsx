"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface JobNodeData {
  label: string;
  title?: string;
  description?: string;
  tags?: string[];
  reward?: number;
  agentSpecialty?: string;
  status?: "pending" | "running" | "completed" | "failed";
}

const specialtyIcons: Record<string, string> = {
  research: "🔬",
  coding: "💻",
  writing: "✍️",
  audit: "🛡️",
  deploy: "🚀",
  frontend: "🎨",
  backend: "⚙️",
  api: "📡",
};

const statusDot: Record<string, string> = {
  pending: "bg-slate-500",
  running: "bg-amber-400 animate-glow-pulse",
  completed: "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.6)]",
  failed: "bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]",
};

function JobNode({ data, selected }: NodeProps & { data: JobNodeData }) {
  const status = data.status || "pending";
  const icon = specialtyIcons[(data.agentSpecialty || "").toLowerCase()] || "⚡";

  return (
    <div
      className={`
        glass-panel rounded-2xl px-4 py-3 min-w-[220px] max-w-[280px]
        transition-all duration-200 animate-node-enter
        border border-transparent
        bg-gradient-to-br from-forge-card to-transparent
        ${selected
          ? "shadow-neon-blue-strong border-forge-border-active"
          : "hover:shadow-neon-blue hover:border-forge-border-hover"
        }
      `}
      style={{
        borderImage: selected
          ? "linear-gradient(135deg, #3b82f6, #8b5cf6) 1"
          : undefined,
        borderImageSlice: selected ? 1 : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-forge-bg-subtle !border-2 !border-forge-blue !rounded-full !shadow-[0_0_8px_rgba(59,130,246,0.4)] hover:!shadow-[0_0_12px_rgba(59,130,246,0.7)] !transition-shadow"
      />

      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{icon}</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-forge-blue-light/70">
            Job
          </span>
        </div>
        <div className={`w-2 h-2 rounded-full ${statusDot[status]}`} />
      </div>

      {/* Title */}
      <div className="font-semibold text-forge-text-primary text-sm truncate">
        {data.title || data.label || "Untitled Job"}
      </div>

      {/* Description */}
      {data.description && (
        <div className="text-forge-text-secondary text-xs mt-1 line-clamp-2 leading-relaxed">
          {data.description}
        </div>
      )}

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {data.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="glass-badge text-[10px] px-1.5 py-0.5 rounded-md text-forge-text-secondary border border-forge-border"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      {(data.reward !== undefined || data.agentSpecialty) && (
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-forge-border">
          {data.reward !== undefined && (
            <span className="text-[10px] font-mono text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]">
              ⚡ {data.reward} $OW
            </span>
          )}
          {data.agentSpecialty && (
            <span className="text-[10px] text-forge-violet-light/80 font-medium">
              {data.agentSpecialty}
            </span>
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-forge-bg-subtle !border-2 !border-forge-blue !rounded-full !shadow-[0_0_8px_rgba(59,130,246,0.4)] hover:!shadow-[0_0_12px_rgba(59,130,246,0.7)] !transition-shadow"
      />
    </div>
  );
}

export default memo(JobNode);
