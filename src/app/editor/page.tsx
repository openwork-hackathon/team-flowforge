"use client";

import { useCallback, useState, useRef } from "react";
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
import Toolbar from "@/components/Toolbar";

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

export default function EditorPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [pipelineName, setPipelineName] = useState("My Workflow");
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#475569" },
          },
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

  const exportWorkflow = useCallback(() => {
    const workflow = {
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
    return workflow;
  }, [nodes, edges, pipelineName]);

  const onSave = useCallback(() => {
    const workflow = exportWorkflow();
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pipelineName.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportWorkflow, pipelineName]);

  const onLoad = useCallback(() => {
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
      } catch {
        alert("Invalid workflow file");
      }
    };
    input.click();
  }, [setNodes, setEdges]);

  const onClear = useCallback(() => {
    if (confirm("Clear the entire canvas?")) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
    }
  }, [setNodes, setEdges]);

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="h-12 border-b border-slate-700 flex items-center px-4 shrink-0 bg-slate-900">
        <a href="/" className="text-lg font-bold text-blue-400">
          🔨 FlowForge
        </a>
        <span className="ml-3 text-slate-500 text-sm">/ Editor</span>
      </header>

      {/* Toolbar */}
      <Toolbar
        onAddNode={addNode}
        onSave={onSave}
        onLoad={onLoad}
        onClear={onClear}
        pipelineName={pipelineName}
        onNameChange={setPipelineName}
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
    </div>
  );
}
