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
import EnergyEdge from "@/components/edges/EnergyEdge";
import NodeSidebar from "@/components/NodeSidebar";
import Toolbar, { type PipelineSummary, type SaveStatus } from "@/components/Toolbar";
import TopBar from "@/components/TopBar";

const nodeTypes = {
  job: JobNode,
  condition: ConditionNode,
  start: StartEndNode,
  end: StartEndNode,
};

const edgeTypes = {
  energy: EnergyEdge,
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
  { id: "e-start-job1", source: "start-1", target: "job-1", type: "energy" },
  { id: "e-job1-job2", source: "job-1", target: "job-2", type: "energy" },
  { id: "e-job2-end", source: "job-2", target: "end-1", type: "energy" },
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
          success: "border-emerald-500/30 text-emerald-300",
          error: "border-red-500/30 text-red-300",
          info: "border-forge-blue/30 text-forge-blue-light",
        };
        return (
          <div
            key={t.id}
            className={`glass-panel px-4 py-2.5 rounded-xl text-sm shadow-card-depth animate-slide-up ${colors[t.type]}`}
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
          { ...connection, type: "energy" },
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
              type: "energy",
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
              type: "energy",
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
            edgeTypes={edgeTypes}
            fitView
            defaultEdgeOptions={{
              type: "energy",
            }}
            className="!bg-forge-bg"
          >
            <Controls className="!bg-forge-card-solid !border !border-forge-border !rounded-xl !shadow-glass [&>button]:!bg-forge-card-solid [&>button]:!border-forge-border [&>button]:!text-forge-text-secondary [&>button:hover]:!bg-forge-bg-subtle [&>button:hover]:!text-forge-text-primary" />
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1}
              color="rgba(59, 130, 246, 0.06)"
            />
            <MiniMap
              className="!bg-forge-card-solid/80 !border !border-forge-border !rounded-xl !shadow-glass !backdrop-blur-lg"
              nodeColor={(n) => {
                if (n.type === "start") return "#10b981";
                if (n.type === "end") return "#ef4444";
                if (n.type === "condition") return "#f59e0b";
                return "#3b82f6";
              }}
              maskColor="rgba(5, 5, 8, 0.85)"
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

      {/* Animations handled by design system (tailwind.config.ts) */}
    </div>
  );
}
