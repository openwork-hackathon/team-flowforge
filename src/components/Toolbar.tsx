"use client";

interface ToolbarProps {
  onAddNode: (type: "job" | "condition" | "start" | "end") => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  pipelineName: string;
  onNameChange: (name: string) => void;
}

export default function Toolbar({
  onAddNode,
  onSave,
  onLoad,
  onClear,
  pipelineName,
  onNameChange,
}: ToolbarProps) {
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
        <button
          onClick={onSave}
          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
        >
          💾 Save
        </button>
        <button
          onClick={onLoad}
          className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md transition-colors"
        >
          📂 Load
        </button>
        <button
          onClick={onClear}
          className="px-3 py-1 text-xs bg-slate-700 hover:bg-red-900/50 text-slate-400 hover:text-red-400 rounded-md transition-colors"
        >
          🗑 Clear
        </button>
      </div>
    </div>
  );
}
