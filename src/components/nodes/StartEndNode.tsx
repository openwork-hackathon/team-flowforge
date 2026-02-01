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
      className={`border-2 rounded-full px-5 py-2 min-w-[100px] text-center shadow-lg transition-all ${
        isStart
          ? "bg-green-900/50 border-green-500"
          : "bg-red-900/50 border-red-500"
      } ${selected ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900" : ""}`}
    >
      {!isStart && (
        <Handle
          type="target"
          position={Position.Top}
          className={`!border-slate-700 !w-3 !h-3 ${
            isStart ? "!bg-green-500" : "!bg-red-500"
          }`}
        />
      )}

      <div
        className={`font-semibold text-sm ${
          isStart ? "text-green-300" : "text-red-300"
        }`}
      >
        {isStart ? "▶ Start" : "⏹ End"}
      </div>

      {isStart && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-green-500 !border-slate-700 !w-3 !h-3"
        />
      )}
    </div>
  );
}

export default memo(StartEndNode);
