export type NodeType = "job" | "condition" | "start" | "end";

export type PipelineStatus = "draft" | "running" | "completed" | "failed";
export type NodeRunStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface PipelineNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    title?: string;
    description?: string;
    tags?: string[];
    reward?: number;
    agentSpecialty?: string;
    condition?: string;
  };
}

export interface PipelineEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  status: PipelineStatus;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  isTemplate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineRun {
  id: string;
  pipelineId: string;
  status: PipelineStatus;
  nodeRuns: NodeRun[];
  startedAt: string;
  completedAt?: string;
}

export interface NodeRun {
  id: string;
  nodeId: string;
  openworkJobId?: string;
  status: NodeRunStatus;
  result?: string;
  startedAt?: string;
  completedAt?: string;
}
