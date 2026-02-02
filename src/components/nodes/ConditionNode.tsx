"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface ConditionNodeData {
  label: string;
  condition?: string;
}

function ConditionNode({ data, selected }: NodeProps & { data: ConditionNodeData }) {
  return (
    <div
      className={`
        glass-panel rounded-2xl px-4 py-3 min-w-[180px] max-w-[260px]
        transition-all duration-200 animate-node-enter
        relative overflow-hidden
        ${selected
          ? "shadow-neon-amber border-forge-border-active"
          : "hover:shadow-neon-amber hover:border-forge-border-hover"
        }
      `}
      style={{
        borderImage: "linear-gradient(135deg, #f59e0b, #d97706) 1",
        borderImageSlice: 1,
      }}
    >
      {/* Angled gradient overlay for hexagonal feel */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />

      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-forge-bg-subtle !border-2 !border-amber-500 !rounded-full !shadow-[0_0_8px_rgba(245,158,11,0.4)] hover:!shadow-[0_0_12px_rgba(245,158,11,0.7)] !transition-shadow"
      />

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1.5 relative">
        <span className="text-base leading-none">⑂</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400/70">
          Condition
        </span>
      </div>

      {/* Label */}
      <div className="font-semibold text-forge-text-primary text-sm relative">
        {data.label || "If / Else"}
      </div>

      {/* Condition expression */}
      {data.condition && (
        <div className="mt-2 px-2 py-1.5 rounded-lg bg-forge-bg/60 border border-forge-border relative">
          <code className="text-[11px] font-mono text-amber-300/90 break-all">
            {data.condition}
          </code>
        </div>
      )}

      {/* True / False handles with labels */}
      <div className="flex justify-between mt-2.5 text-[9px] font-mono uppercase tracking-wider relative">
        <span className="text-emerald-400/80">True</span>
        <span className="text-red-400/80">False</span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: "30%" }}
        className="!w-3.5 !h-3.5 !bg-forge-bg-subtle !border-2 !border-emerald-500 !rounded-full !shadow-[0_0_8px_rgba(16,185,129,0.4)] hover:!shadow-[0_0_12px_rgba(16,185,129,0.7)] !transition-shadow"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: "70%" }}
        className="!w-3.5 !h-3.5 !bg-forge-bg-subtle !border-2 !border-red-500 !rounded-full !shadow-[0_0_8px_rgba(239,68,68,0.4)] hover:!shadow-[0_0_12px_rgba(239,68,68,0.7)] !transition-shadow"
      />
    </div>
  );
}

export default memo(ConditionNode);
