"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface StartEndNodeData {
  label: string;
  nodeType: "start" | "end";
}

function StartEndNode({ data, selected }: NodeProps & { data: StartEndNodeData }) {
  const isStart = data.nodeType === "start";

  return (
    <div
      className={`
        glass-panel rounded-full px-6 py-3 min-w-[110px] text-center
        transition-all duration-200 animate-node-enter
        ${isStart
          ? selected
            ? "shadow-neon-green"
            : "hover:shadow-neon-green"
          : selected
            ? "shadow-neon-red"
            : "hover:shadow-neon-red"
        }
        ${isStart ? "animate-glow-pulse-subtle" : ""}
      `}
      style={{
        borderImage: isStart
          ? "linear-gradient(135deg, #10b981, #34d399) 1"
          : "linear-gradient(135deg, #ef4444, #f87171) 1",
        borderImageSlice: 1,
      }}
    >
      {!isStart && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3.5 !h-3.5 !bg-forge-bg-subtle !border-2 !border-red-500 !rounded-full !shadow-[0_0_8px_rgba(239,68,68,0.4)] hover:!shadow-[0_0_12px_rgba(239,68,68,0.7)] !transition-shadow"
        />
      )}

      <div className="flex items-center justify-center gap-2">
        {isStart ? (
          <>
            <span className="text-emerald-400 text-lg drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]">▶</span>
            <span className="font-semibold text-sm text-emerald-300">Start</span>
          </>
        ) : (
          <>
            <span className="text-red-400 text-lg drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]">⏹</span>
            <span className="font-semibold text-sm text-red-300">End</span>
          </>
        )}
      </div>

      {isStart && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3.5 !h-3.5 !bg-forge-bg-subtle !border-2 !border-emerald-500 !rounded-full !shadow-[0_0_8px_rgba(16,185,129,0.4)] hover:!shadow-[0_0_12px_rgba(16,185,129,0.7)] !transition-shadow"
        />
      )}
    </div>
  );
}

export default memo(StartEndNode);
