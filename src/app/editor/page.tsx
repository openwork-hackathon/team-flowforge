"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import JobNode from "@/components/nodes/JobNode";
import ConditionNode from "@/components/nodes/ConditionNode";
import StartEndNode from "@/components/nodes/StartEndNode";
import NodeSidebar from "@/components/NodeSidebar";
import Toolbar, { type PipelineSummary, type SaveStatus } from "@/components/Toolbar";
import TopBar from "@/components/TopBar";

const nodeTypes = {
  job: JobNode,
  condition: ConditionNode,
  start: StartEndNode,
  end: StartEndNode,
};

// Default starter workflow
const defaultNodes: Node[] = [
  {
    id: "start-1",
    type: "start",
    position: { x: 300, y: 50 },
    data: { label: "Start", nodeType: "start" },
  },
  {
    id: "job-1",
    type: "job",
    position: { x: 250, y: 180 },
    data: {
      label: "Research",
      title: "Research Task",
      description: "Research and gather information",
      tags: ["research"],
      reward: 0,
      agentSpecialty: "research",
    },
  },
  {
    id: "job-2",
    type: "job",
    position: { x: 250, y: 380 },
    data: {
      label: "Build",
      title: "Implementation",
      description: "Build based on research findings",
      tags: ["coding"],
      reward: 0,
      agentSpecialty: "coding",
    },
  },
  {
    id: "end-1",
    type: "end",
    position: { x: 300, y: 540 },
    data: { label: "End", nodeType: "end" },
  },
];

const defaultEdges: Edge[] = [
  { id: "e-start-job1", source: "start-1", target: "job-1", animated: true },
  { id: "e-job1-job2", source: "job-1", target: "job-2", animated: true },
  { id: "e-job2-end", source: "job-2", target: "end-1", animated: true },
];

let nodeIdCounter = 10;

// ── Toast notification ──────────────────────────────────────────────
interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

let toastId = 0;

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const colors = {
          success: "bg-emerald-900/90 border-emerald-600 text-emerald-200",
          error: "bg-red-900/90 border-red-600 text-red-200",
          info: "bg-blue-900/90 border-blue-600 text-blue-200",
        };
        return (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-lg border text-sm shadow-lg backdrop-blur-sm animate-slide-up ${colors[t.type]}`}
          >
            <div className="flex items-center gap-2">
              <span>{t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}</span>
              <span>{t.message}</span>
              <button
                onClick={() => onDismiss(t.id)}
                className="ml-2 opacity-60 hover:opacity-100"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Editor ─────────────────────────────────────────────────────
export default function EditorPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [pipelineName, setPipelineName] = useState("My Workflow");
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("unsaved");
  const [pipelines, setPipelines] = useState<PipelineSummary[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Toast helpers
  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Mark unsaved when nodes/edges/name change
  useEffect(() => {
    setSaveStatus((prev) => (prev === "saving" ? prev : "unsaved"));
  }, [nodes, edges, pipelineName]);

  // ── ReactFlow callbacks ─────────────────────────────────────────
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          { ...connection, animated: true, style: { stroke: "#475569" } },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onUpdateNode = useCallback(
    (id: string, newData: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...newData } } : n))
      );
      setSelectedNode((prev) =>
        prev && prev.id === id ? { ...prev, data: { ...prev.data, ...newData } } : prev
      );
    },
    [setNodes]
  );

  const addNode = useCallback(
    (type: "job" | "condition" | "start" | "end") => {
      nodeIdCounter++;
      const id = `${type}-${nodeIdCounter}`;
      const centerX = 300 + Math.random() * 100 - 50;
      const centerY = 200 + Math.random() * 200;

      const dataMap: Record<string, Record<string, unknown>> = {
        job: {
          label: "New Job",
          title: "",
          description: "",
          tags: [],
          reward: 0,
          agentSpecialty: "",
        },
        condition: { label: "Condition", condition: "" },
        start: { label: "Start", nodeType: "start" },
        end: { label: "End", nodeType: "end" },
      };

      const newNode: Node = {
        id,
        type,
        position: { x: centerX, y: centerY },
        data: dataMap[type],
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  // ── Build workflow payload ──────────────────────────────────────
  const buildPayload = useCallback(() => {
    return {
      name: pipelineName,
      nodes: nodes.map((n) => ({
        nodeId: n.id,
        type: n.type,
        label: (n.data as Record<string, unknown>).label || "",
        positionX: n.position.x,
        positionY: n.position.y,
        config: n.data,
      })),
      edges: edges.map((e) => ({
        edgeId: e.id,
        sourceNode: e.source,
        targetNode: e.target,
        sourceHandle: e.sourceHandle || undefined,
        targetHandle: e.targetHandle || undefined,
        label: (e as Edge & { label?: string }).label || undefined,
      })),
    };
  }, [nodes, edges, pipelineName]);

  // ── Save to API ─────────────────────────────────────────────────
  const onSave = useCallback(async () => {
    setSaveStatus("saving");
    const payload = buildPayload();

    try {
      let res: Response;
      if (pipelineId) {
        res = await fetch(`/api/pipelines/${pipelineId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/pipelines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const { data } = await res.json();
      if (data.id && !pipelineId) {
        setPipelineId(data.id);
      }
      setSaveStatus("saved");
      addToast(pipelineId ? "Pipeline updated" : "Pipeline created", "success");
    } catch (err: unknown) {
      setSaveStatus("error");
      addToast(`Save failed: ${(err as Error).message}`, "error");
    }
  }, [buildPayload, pipelineId, addToast]);

  // ── Load pipeline list ──────────────────────────────────────────
  const refreshPipelines = useCallback(async () => {
    try {
      const res = await fetch("/api/pipelines?limit=50");
      if (!res.ok) return;
      const { data } = await res.json();
      setPipelines(data);
    } catch {
      // silent
    }
  }, []);

  // ── Load single pipeline ────────────────────────────────────────
  const loadPipeline = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/pipelines/${id}`);
        if (!res.ok) throw new Error("Failed to load pipeline");
        const { data } = await res.json();

        setPipelineName(data.name || "Untitled");
        setPipelineId(data.id);

        if (data.nodes) {
          setNodes(
            data.nodes.map((n: Record<string, unknown>) => ({
              id: n.nodeId,
              type: n.type,
              position: { x: n.positionX, y: n.positionY },
              data: (n.config && typeof n.config === "object" && Object.keys(n.config as object).length > 0)
                ? n.config
                : { label: n.label },
            }))
          );
        }
        if (data.edges) {
          setEdges(
            data.edges.map((e: Record<string, unknown>) => ({
              id: e.edgeId,
              source: e.sourceNode,
              target: e.targetNode,
              sourceHandle: e.sourceHandle,
              targetHandle: e.targetHandle,
              animated: true,
            }))
          );
        }

        // After loading, mark as saved
        setTimeout(() => setSaveStatus("saved"), 0);
        addToast(`Loaded "${data.name}"`, "info");
      } catch (err: unknown) {
        addToast(`Load failed: ${(err as Error).message}`, "error");
      }
    },
    [setNodes, setEdges, addToast]
  );

  // ── Run pipeline ────────────────────────────────────────────────
  const onRun = useCallback(async () => {
    if (!pipelineId) {
      addToast("Save pipeline before running", "error");
      return;
    }
    setIsRunning(true);
    try {
      const res = await fetch(`/api/pipelines/${pipelineId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const { data } = await res.json();
      addToast(`Pipeline run started (${data.status})`, "success");
    } catch (err: unknown) {
      addToast(`Run failed: ${(err as Error).message}`, "error");
    } finally {
      setIsRunning(false);
    }
  }, [pipelineId, addToast]);

  // ── Export JSON (local file download) ───────────────────────────
  const onExportJSON = useCallback(() => {
    const workflow = buildPayload();
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pipelineName.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [buildPayload, pipelineName]);

  // ── Import JSON (local file upload) ─────────────────────────────
  const onImportJSON = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const workflow = JSON.parse(text);
        if (workflow.name) setPipelineName(workflow.name);
        setPipelineId(null); // Imported file = new pipeline
        if (workflow.nodes) {
          setNodes(
            workflow.nodes.map((n: Record<string, unknown>) => ({
              id: n.nodeId,
              type: n.type,
              position: { x: n.positionX, y: n.positionY },
              data: n.config || { label: n.label },
            }))
          );
        }
        if (workflow.edges) {
          setEdges(
            workflow.edges.map((e: Record<string, unknown>) => ({
              id: e.edgeId,
              source: e.sourceNode,
              target: e.targetNode,
              sourceHandle: e.sourceHandle,
              targetHandle: e.targetHandle,
              animated: true,
            }))
          );
        }
        addToast("Imported workflow from file", "info");
      } catch {
        addToast("Invalid workflow JSON file", "error");
      }
    };
    input.click();
  }, [setNodes, setEdges, addToast]);

  // ── Clear canvas ────────────────────────────────────────────────
  const onClear = useCallback(() => {
    if (confirm("Clear the entire canvas?")) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setPipelineId(null);
      setSaveStatus("unsaved");
    }
  }, [setNodes, setEdges]);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <TopBar
        pipelineName={pipelineName}
        saveStatus={saveStatus}
        pipelineId={pipelineId}
        isRunning={isRunning}
      />

      {/* Toolbar */}
      <Toolbar
        onAddNode={addNode}
        onSave={onSave}
        onExportJSON={onExportJSON}
        onImportJSON={onImportJSON}
        onClear={onClear}
        onRun={onRun}
        onLoadPipeline={loadPipeline}
        pipelineName={pipelineName}
        onNameChange={setPipelineName}
        saveStatus={saveStatus}
        pipelineId={pipelineId}
        pipelines={pipelines}
        onRefreshPipelines={refreshPipelines}
        isRunning={isRunning}
      />

      {/* Editor + Sidebar */}
      <div className="flex-1 flex">
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: "#475569", strokeWidth: 2 },
            }}
            className="bg-slate-950"
          >
            <Controls className="!bg-slate-800 !border-slate-700 !rounded-lg [&>button]:!bg-slate-800 [&>button]:!border-slate-600 [&>button]:!text-slate-400 [&>button:hover]:!bg-slate-700" />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#1e293b"
            />
            <MiniMap
              className="!bg-slate-900 !border-slate-700 !rounded-lg"
              nodeColor={(n) => {
                if (n.type === "start") return "#22c55e";
                if (n.type === "end") return "#ef4444";
                if (n.type === "condition") return "#f59e0b";
                return "#3b82f6";
              }}
              maskColor="rgba(15, 23, 42, 0.8)"
            />
          </ReactFlow>
        </div>

        {/* Sidebar */}
        <NodeSidebar
          node={selectedNode}
          onUpdate={onUpdateNode}
          onClose={() => setSelectedNode(null)}
        />
      </div>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Slide-up animation */}
      <style jsx global>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
