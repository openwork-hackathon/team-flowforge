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

const statusColors: Record<string, string> = {
  pending: "border-slate-600",
  running: "border-yellow-500 shadow-yellow-500/20",
  completed: "border-green-500 shadow-green-500/20",
  failed: "border-red-500 shadow-red-500/20",
};

function JobNode({ data, selected }: NodeProps & { data: JobNodeData }) {
  const status = data.status || "pending";
  const borderColor = statusColors[status] || statusColors.pending;

  return (
    <div
      className={`bg-slate-800 border-2 ${borderColor} rounded-xl px-4 py-3 min-w-[200px] max-w-[280px] shadow-lg transition-all ${
        selected ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !border-slate-700 !w-3 !h-3"
      />

      <div className="flex items-center gap-2 mb-1">
        <div className="text-blue-400 text-xs font-mono uppercase tracking-wider">
          Job
        </div>
        {status !== "pending" && (
          <div
            className={`w-2 h-2 rounded-full ${
              status === "running"
                ? "bg-yellow-400 animate-pulse"
                : status === "completed"
                ? "bg-green-400"
                : "bg-red-400"
            }`}
          />
        )}
      </div>

      <div className="font-semibold text-slate-100 text-sm truncate">
        {data.title || data.label || "Untitled Job"}
      </div>

      {data.description && (
        <div className="text-slate-400 text-xs mt-1 line-clamp-2">
          {data.description}
        </div>
      )}

      {data.tags && data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {data.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {(data.reward !== undefined || data.agentSpecialty) && (
        <div className="flex items-center justify-between mt-2 text-[10px]">
          {data.reward !== undefined && (
            <span className="text-amber-400 font-mono">
              {data.reward} $OPENWORK
            </span>
          )}
          {data.agentSpecialty && (
            <span className="text-purple-400">{data.agentSpecialty}</span>
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !border-slate-700 !w-3 !h-3"
      />
    </div>
  );
}

export default memo(JobNode);
