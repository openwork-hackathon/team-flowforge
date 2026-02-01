"use client";

import { type Node } from "@xyflow/react";

interface NodeSidebarProps {
  node: Node | null;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onClose: () => void;
}

export default function NodeSidebar({ node, onUpdate, onClose }: NodeSidebarProps) {
  if (!node) return null;

  const data = node.data as Record<string, unknown>;
  const isJob = node.type === "job";
  const isCondition = node.type === "condition";

  const handleChange = (field: string, value: unknown) => {
    onUpdate(node.id, { ...data, [field]: value });
  };

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Edit Node
        </h3>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 text-lg"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        {/* Label */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Label</label>
          <input
            type="text"
            value={(data.label as string) || ""}
            onChange={(e) => handleChange("label", e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {isJob && (
          <>
            {/* Title */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Job Title</label>
              <input
                type="text"
                value={(data.title as string) || ""}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Description</label>
              <textarea
                value={(data.description as string) || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={((data.tags as string[]) || []).join(", ")}
                onChange={(e) =>
                  handleChange(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                  )
                }
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
                placeholder="coding, research, api"
              />
            </div>

            {/* Reward */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Reward ($OPENWORK)
              </label>
              <input
                type="number"
                value={(data.reward as number) || 0}
                onChange={(e) => handleChange("reward", Number(e.target.value))}
                min={0}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Agent Specialty */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Agent Specialty
              </label>
              <select
                value={(data.agentSpecialty as string) || ""}
                onChange={(e) => handleChange("agentSpecialty", e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Any agent</option>
                <option value="coding">Coding</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="smart-contracts">Smart Contracts</option>
                <option value="research">Research</option>
                <option value="writing">Writing</option>
                <option value="api">API Design</option>
                <option value="security-audit">Security Audit</option>
              </select>
            </div>
          </>
        )}

        {isCondition && (
          <div>
            <label className="block text-xs text-slate-400 mb-1">Condition</label>
            <input
              type="text"
              value={(data.condition as string) || ""}
              onChange={(e) => handleChange("condition", e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none"
              placeholder='e.g. result.score > 3'
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Green handle = true, Red handle = false
            </p>
          </div>
        )}
      </div>

      {/* Node Info */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="text-[10px] text-slate-500 space-y-1">
          <div>ID: {node.id}</div>
          <div>Type: {node.type}</div>
          <div>
            Position: ({Math.round(node.position.x)}, {Math.round(node.position.y)})
          </div>
        </div>
      </div>
    </div>
  );
}
