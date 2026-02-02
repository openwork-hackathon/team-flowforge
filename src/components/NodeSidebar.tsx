"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { type Node } from "@xyflow/react";

interface NodeSidebarProps {
  node: Node | null;
  onUpdate: (id: string, data: Record<string, unknown>) => void;
  onClose: () => void;
}

/* ── Collapsible accordion panel ────────────────────────────────── */
function Panel({
  title,
  icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-forge-border/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-forge-text-secondary">
            {title}
          </span>
        </div>
        <span
          className={`text-forge-text-muted text-xs transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      <div
        className={`transition-all duration-200 overflow-hidden ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 pb-3 pt-1 space-y-3">{children}</div>
      </div>
    </div>
  );
}

/* ── Label for form fields ──────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium text-forge-text-muted uppercase tracking-wider mb-1">
      {children}
    </label>
  );
}

/* ── Tag Input with pills ───────────────────────────────────────── */
function TagInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addTag = useCallback(() => {
    const tag = input.trim();
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
    }
    setInput("");
  }, [input, tags, onChange]);

  const removeTag = useCallback(
    (t: string) => onChange(tags.filter((x) => x !== t)),
    [tags, onChange]
  );

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="glass-badge flex items-center gap-1 text-forge-text-secondary"
          >
            {t}
            <button
              onClick={() => removeTag(t)}
              className="text-forge-text-muted hover:text-forge-error ml-0.5 text-[10px]"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={addTag}
        className="glass-input w-full"
        placeholder="Type + Enter to add"
      />
    </div>
  );
}

/* ── AI Model selector ──────────────────────────────────────────── */
const AI_MODELS = [
  { value: "", label: "Auto (default)" },
  { value: "claude-sonnet", label: "Claude Sonnet" },
  { value: "claude-opus", label: "Claude Opus" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gemini-pro", label: "Gemini Pro" },
  { value: "gemini-ultra", label: "Gemini Ultra" },
];

/* ── Main Sidebar ───────────────────────────────────────────────── */
export default function NodeSidebar({ node, onUpdate, onClose }: NodeSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (!node && !collapsed) {
    return (
      <div className="w-80 glass-panel-strong border-l border-forge-border flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="text-4xl mb-3 opacity-30">🖱️</div>
        <p className="text-sm text-forge-text-muted">Select a node to edit</p>
        <p className="text-[11px] text-forge-text-dim mt-1">
          Click any node on the canvas
        </p>
      </div>
    );
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="w-8 glass-panel-strong border-l border-forge-border flex items-center justify-center hover:bg-forge-border/10 transition-colors"
        title="Expand sidebar"
      >
        <span className="text-forge-text-muted text-xs">◀</span>
      </button>
    );
  }

  const data = (node?.data || {}) as Record<string, unknown>;
  const isJob = node?.type === "job";
  const isCondition = node?.type === "condition";

  const handleChange = (field: string, value: unknown) => {
    if (node) onUpdate(node.id, { ...data, [field]: value });
  };

  return (
    <div className="w-80 glass-panel-strong border-l border-forge-border flex flex-col overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-forge-border">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-forge-text-secondary">
          Inspector
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 text-forge-text-muted hover:text-forge-text-secondary transition-colors"
            title="Collapse"
          >
            <span className="text-xs">▶</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 text-forge-text-muted hover:text-forge-error transition-colors"
            title="Close"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>
      </div>

      {/* Panels */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* ── Properties Panel ──────────────────────────────────── */}
        <Panel title="Properties" icon="⚙️">
          <div>
            <Label>Label</Label>
            <input
              type="text"
              value={(data.label as string) || ""}
              onChange={(e) => handleChange("label", e.target.value)}
              className="glass-input w-full"
            />
          </div>

          {isJob && (
            <>
              <div>
                <Label>Job Title</Label>
                <input
                  type="text"
                  value={(data.title as string) || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="glass-input w-full"
                />
              </div>

              <div>
                <Label>Description</Label>
                <textarea
                  value={(data.description as string) || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="glass-input w-full resize-none"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <TagInput
                  tags={(data.tags as string[]) || []}
                  onChange={(tags) => handleChange("tags", tags)}
                />
              </div>

              <div>
                <Label>Reward ($OW)</Label>
                <input
                  type="number"
                  value={(data.reward as number) || 0}
                  onChange={(e) => handleChange("reward", Number(e.target.value))}
                  min={0}
                  className="glass-input w-full"
                />
              </div>

              <div>
                <Label>Agent Specialty</Label>
                <select
                  value={(data.agentSpecialty as string) || ""}
                  onChange={(e) => handleChange("agentSpecialty", e.target.value)}
                  className="glass-input w-full"
                >
                  <option value="">Any agent</option>
                  <option value="coding">💻 Coding</option>
                  <option value="frontend">🎨 Frontend</option>
                  <option value="backend">⚙️ Backend</option>
                  <option value="smart-contracts">🛡️ Smart Contracts</option>
                  <option value="research">🔬 Research</option>
                  <option value="writing">✍️ Writing</option>
                  <option value="api">📡 API Design</option>
                  <option value="security-audit">🔒 Security Audit</option>
                </select>
              </div>
            </>
          )}

          {isCondition && (
            <div>
              <Label>Condition Expression</Label>
              <input
                type="text"
                value={(data.condition as string) || ""}
                onChange={(e) => handleChange("condition", e.target.value)}
                className="glass-input w-full font-mono"
                placeholder="e.g. result.score > 3"
              />
              <p className="text-[10px] text-forge-text-muted mt-1.5 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> True
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> False
                </span>
              </p>
            </div>
          )}
        </Panel>

        {/* ── AI Model Panel (Job nodes only) ──────────────────── */}
        {isJob && (
          <Panel title="AI Model" icon="🧠" defaultOpen={false}>
            <div>
              <Label>Model</Label>
              <select
                value={(data.model as string) || ""}
                onChange={(e) => handleChange("model", e.target.value)}
                className="glass-input w-full"
              >
                {AI_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-forge-text-muted mt-1.5">
                Assign a specific AI model to this job node
              </p>
            </div>
          </Panel>
        )}

        {/* ── Node Info Panel ──────────────────────────────────── */}
        {node && (
          <Panel title="Node Info" icon="📋" defaultOpen={false}>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-forge-text-muted">ID</span>
                <span className="text-forge-text-secondary font-mono">{node.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-forge-text-muted">Type</span>
                <span className="text-forge-text-secondary capitalize">{node.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-forge-text-muted">Position</span>
                <span className="text-forge-text-secondary font-mono">
                  {Math.round(node.position.x)}, {Math.round(node.position.y)}
                </span>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
