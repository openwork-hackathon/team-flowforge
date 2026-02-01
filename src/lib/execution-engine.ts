import prisma from './prisma';
import { createJob } from './openwork';
import { emitRunEvent, RunEventType } from './websocket-events';
import { startPolling } from './job-poller';

interface Node {
  nodeId: string;
  type: string;
  label: string;
  config: Record<string, unknown>;
}

interface Edge {
  sourceNode: string;
  targetNode: string;
  label?: string;
}

interface ExecutionContext {
  runId: string;
  pipelineId: string;
  nodes: Node[];
  edges: Edge[];
  input: Record<string, unknown>;
}

/**
 * Build adjacency list and in-degree map for DAG traversal
 */
function buildGraph(nodes: Node[], edges: Edge[]) {
  const adjacencyList = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize all nodes
  for (const node of nodes) {
    adjacencyList.set(node.nodeId, []);
    inDegree.set(node.nodeId, 0);
  }

  // Build edges
  for (const edge of edges) {
    const neighbors = adjacencyList.get(edge.sourceNode) || [];
    neighbors.push(edge.targetNode);
    adjacencyList.set(edge.sourceNode, neighbors);

    const currentDegree = inDegree.get(edge.targetNode) || 0;
    inDegree.set(edge.targetNode, currentDegree + 1);
  }

  return { adjacencyList, inDegree };
}

/**
 * Topological sort using Kahn's algorithm
 * Returns nodes in execution order
 */
export function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
  const { adjacencyList, inDegree } = buildGraph(nodes, edges);
  const queue: string[] = [];
  const result: string[] = [];

  // Find all start nodes (in-degree 0)
  for (const [nodeId, degree] of Array.from(inDegree.entries())) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    const neighbors = adjacencyList.get(current) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // Check for cycles
  if (result.length !== nodes.length) {
    throw new Error('Pipeline contains a cycle - invalid DAG');
  }

  return result;
}

/**
 * Find nodes that are ready to execute (all dependencies completed)
 */
export async function findReadyNodes(runId: string): Promise<string[]> {
  // Get all node runs for this pipeline run
  const nodeRuns = await prisma.nodeRun.findMany({
    where: { pipelineRunId: runId },
  });

  // Get pipeline with edges
  const run = await prisma.pipelineRun.findUnique({
    where: { id: runId },
    include: {
      pipeline: {
        include: { edges: true },
      },
    },
  });

  if (!run) return [];

  const nodeStatusMap = new Map(nodeRuns.map((nr) => [nr.nodeId, nr.status]));
  const readyNodes: string[] = [];

  // Build reverse adjacency (what nodes does each node depend on)
  const dependencies = new Map<string, string[]>();
  for (const edge of run.pipeline.edges) {
    const deps = dependencies.get(edge.targetNode) || [];
    deps.push(edge.sourceNode);
    dependencies.set(edge.targetNode, deps);
  }

  // Check each pending node
  for (const nodeRun of nodeRuns) {
    if (nodeRun.status !== 'PENDING') continue;

    const deps = dependencies.get(nodeRun.nodeId) || [];
    const allDepsCompleted = deps.every(
      (depId) => nodeStatusMap.get(depId) === 'COMPLETED'
    );

    // If no dependencies or all dependencies completed, node is ready
    if (deps.length === 0 || allDepsCompleted) {
      readyNodes.push(nodeRun.nodeId);
    }
  }

  return readyNodes;
}

/**
 * Execute a single node by creating an Openwork job
 */
export async function executeNode(
  runId: string,
  nodeId: string,
  nodeConfig: Node,
  input: Record<string, unknown>
): Promise<void> {
  console.log(`[ExecutionEngine] Executing node ${nodeId} for run ${runId}`);

  // Get the NodeRun record
  const nodeRun = await prisma.nodeRun.findFirst({
    where: { pipelineRunId: runId, nodeId },
  });

  if (!nodeRun) {
    throw new Error(`NodeRun not found for ${nodeId}`);
  }

  // Update status to RUNNING
  await prisma.nodeRun.update({
    where: { id: nodeRun.id },
    data: {
      status: 'RUNNING',
      startedAt: new Date(),
      input: input as object,
    },
  });

  // Emit WebSocket event
  emitRunEvent(runId, {
    type: RunEventType.NODE_STARTED,
    nodeId,
    timestamp: new Date().toISOString(),
  });

  try {
    // Handle different node types
    if (nodeConfig.type === 'start' || nodeConfig.type === 'input') {
      // Start nodes just pass through input
      await completeNode(runId, nodeId, input);
      return;
    }

    if (nodeConfig.type === 'end' || nodeConfig.type === 'output') {
      // End nodes collect results
      await completeNode(runId, nodeId, input);
      return;
    }

    if (nodeConfig.type === 'condition') {
      // Evaluate condition and decide branch
      const result = evaluateCondition(nodeConfig.config, input);
      await completeNode(runId, nodeId, { ...input, conditionResult: result });
      return;
    }

    // For agent/job nodes, create Openwork job
    const config = nodeConfig.config as {
      title?: string;
      description?: string;
      tags?: string[];
      reward?: number;
      prompt?: string;
    };

    const jobParams = {
      title: config.title || nodeConfig.label,
      description: config.description || config.prompt || `Execute node: ${nodeConfig.label}`,
      tags: config.tags || ['flowforge', 'pipeline'],
      reward: config.reward || 0,
      type: 'task',
    };

    console.log(`[ExecutionEngine] Creating Openwork job for node ${nodeId}:`, jobParams);

    const job = await createJob(jobParams);
    console.log(`[ExecutionEngine] Created Openwork job ${job.id} for node ${nodeId}`);

    // Store the Openwork job ID
    await prisma.nodeRun.update({
      where: { id: nodeRun.id },
      data: { openworkJobId: job.id },
    });

    // Emit event with job ID
    emitRunEvent(runId, {
      type: RunEventType.JOB_CREATED,
      nodeId,
      jobId: job.id,
      timestamp: new Date().toISOString(),
    });

    // Start polling for job completion
    startPolling({
      nodeRunId: nodeRun.id,
      runId,
      nodeId,
      openworkJobId: job.id,
      startedAt: new Date(),
    });
  } catch (error) {
    console.error(`[ExecutionEngine] Error executing node ${nodeId}:`, error);
    await failNode(runId, nodeId, error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Evaluate a condition node
 */
function evaluateCondition(
  config: Record<string, unknown>,
  input: Record<string, unknown>
): boolean {
  const condition = config.condition as string;
  if (!condition) return true;

  try {
    // Simple expression evaluation (in production, use a proper expression parser)
    // eslint-disable-next-line no-new-func
    const evalFn = new Function('input', `return ${condition}`);
    return Boolean(evalFn(input));
  } catch {
    console.warn('Condition evaluation failed, defaulting to true');
    return true;
  }
}

/**
 * Mark a node as completed and trigger downstream execution
 */
export async function completeNode(
  runId: string,
  nodeId: string,
  output: Record<string, unknown>
): Promise<void> {
  console.log(`[ExecutionEngine] Completing node ${nodeId} for run ${runId}`);

  const nodeRun = await prisma.nodeRun.findFirst({
    where: { pipelineRunId: runId, nodeId },
  });

  if (!nodeRun) {
    throw new Error(`NodeRun not found for ${nodeId}`);
  }

  // Update node status to COMPLETED
  await prisma.nodeRun.update({
    where: { id: nodeRun.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      output: output as object,
    },
  });

  // Emit WebSocket event
  emitRunEvent(runId, {
    type: RunEventType.NODE_COMPLETED,
    nodeId,
    output,
    timestamp: new Date().toISOString(),
  });

  // Check if pipeline is complete or execute downstream nodes
  await checkAndContinue(runId);
}

/**
 * Mark a node as failed and propagate failure
 */
export async function failNode(
  runId: string,
  nodeId: string,
  error: string
): Promise<void> {
  console.log(`[ExecutionEngine] Failing node ${nodeId} for run ${runId}: ${error}`);

  const nodeRun = await prisma.nodeRun.findFirst({
    where: { pipelineRunId: runId, nodeId },
  });

  if (!nodeRun) return;

  // Update node status to FAILED
  await prisma.nodeRun.update({
    where: { id: nodeRun.id },
    data: {
      status: 'FAILED',
      completedAt: new Date(),
      error,
    },
  });

  // Emit WebSocket event
  emitRunEvent(runId, {
    type: RunEventType.NODE_FAILED,
    nodeId,
    error,
    timestamp: new Date().toISOString(),
  });

  // Fail the entire pipeline run
  await prisma.pipelineRun.update({
    where: { id: runId },
    data: {
      status: 'FAILED',
      completedAt: new Date(),
    },
  });

  emitRunEvent(runId, {
    type: RunEventType.RUN_FAILED,
    error: `Node ${nodeId} failed: ${error}`,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Check pipeline status and continue execution if needed
 */
async function checkAndContinue(runId: string): Promise<void> {
  const nodeRuns = await prisma.nodeRun.findMany({
    where: { pipelineRunId: runId },
  });

  const allCompleted = nodeRuns.every((nr) => nr.status === 'COMPLETED');
  const anyFailed = nodeRuns.some((nr) => nr.status === 'FAILED');

  if (anyFailed) {
    // Pipeline already marked as failed
    return;
  }

  if (allCompleted) {
    // Pipeline completed successfully!
    const outputs = nodeRuns
      .filter((nr) => nr.output)
      .map((nr) => ({ nodeId: nr.nodeId, output: nr.output }));

    await prisma.pipelineRun.update({
      where: { id: runId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        output: outputs as object[],
      },
    });

    emitRunEvent(runId, {
      type: RunEventType.RUN_COMPLETED,
      outputs,
      timestamp: new Date().toISOString(),
    });

    console.log(`[ExecutionEngine] Pipeline run ${runId} completed successfully`);
    return;
  }

  // Find and execute ready nodes
  const readyNodes = await findReadyNodes(runId);
  console.log(`[ExecutionEngine] Ready nodes for run ${runId}:`, readyNodes);

  if (readyNodes.length > 0) {
    // Get pipeline for node configs
    const run = await prisma.pipelineRun.findUnique({
      where: { id: runId },
      include: {
        pipeline: { include: { nodes: true } },
      },
    });

    if (!run) return;

    // Get input from completed predecessor nodes
    const completedNodeRuns = await prisma.nodeRun.findMany({
      where: { pipelineRunId: runId, status: 'COMPLETED' },
    });

    const inputContext: Record<string, unknown> = {
      ...(run.input as object),
      nodeOutputs: Object.fromEntries(
        completedNodeRuns.map((nr) => [nr.nodeId, nr.output])
      ),
    };

    // Execute all ready nodes in parallel
    await Promise.all(
      readyNodes.map(async (nodeId) => {
        const nodeConfig = run.pipeline.nodes.find((n) => n.nodeId === nodeId);
        if (nodeConfig) {
          await executeNode(runId, nodeId, {
            nodeId: nodeConfig.nodeId,
            type: nodeConfig.type,
            label: nodeConfig.label,
            config: nodeConfig.config as Record<string, unknown>,
          }, inputContext);
        }
      })
    );
  }
}

/**
 * Start executing a pipeline run
 */
export async function startPipelineExecution(ctx: ExecutionContext): Promise<void> {
  console.log(`[ExecutionEngine] Starting execution for run ${ctx.runId}`);

  // Validate DAG (will throw if cycles exist)
  topologicalSort(ctx.nodes, ctx.edges);

  // Emit run started event
  emitRunEvent(ctx.runId, {
    type: RunEventType.RUN_STARTED,
    pipelineId: ctx.pipelineId,
    timestamp: new Date().toISOString(),
  });

  // Find initial nodes (no dependencies) and execute them
  const readyNodes = await findReadyNodes(ctx.runId);
  console.log(`[ExecutionEngine] Initial ready nodes:`, readyNodes);

  if (readyNodes.length === 0) {
    throw new Error('No starting nodes found in pipeline');
  }

  // Execute all ready nodes in parallel
  await Promise.all(
    readyNodes.map(async (nodeId) => {
      const nodeConfig = ctx.nodes.find((n) => n.nodeId === nodeId);
      if (nodeConfig) {
        await executeNode(ctx.runId, nodeId, nodeConfig, ctx.input);
      }
    })
  );
}
