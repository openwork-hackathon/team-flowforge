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
      className={`bg-slate-800 border-2 border-amber-600 rounded-lg px-4 py-3 min-w-[160px] shadow-lg transition-all ${
        selected ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-amber-500 !border-slate-700 !w-3 !h-3"
      />

      <div className="flex items-center gap-2 mb-1">
        <div className="text-amber-400 text-xs font-mono uppercase tracking-wider">
          ⑂ Condition
        </div>
      </div>

      <div className="font-semibold text-slate-100 text-sm">
        {data.label || "If / Else"}
      </div>

      {data.condition && (
        <div className="text-slate-400 text-xs mt-1 font-mono bg-slate-900 rounded px-2 py-1">
          {data.condition}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: "30%" }}
        className="!bg-green-500 !border-slate-700 !w-3 !h-3"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: "70%" }}
        className="!bg-red-500 !border-slate-700 !w-3 !h-3"
      />
    </div>
  );
}

export default memo(ConditionNode);
