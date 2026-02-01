import { z } from 'zod';

// Node validation
export const pipelineNodeSchema = z.object({
  nodeId: z.string().min(1, 'Node ID is required'),
  type: z.string().min(1, 'Node type is required'),
  label: z.string().min(1, 'Label is required'),
  positionX: z.number(),
  positionY: z.number(),
  config: z.record(z.unknown()).optional().default({}),
});

// Edge validation
export const pipelineEdgeSchema = z.object({
  edgeId: z.string().min(1, 'Edge ID is required'),
  sourceNode: z.string().min(1, 'Source node is required'),
  targetNode: z.string().min(1, 'Target node is required'),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional(),
});

// Create pipeline validation
export const createPipelineSchema = z.object({
  name: z.string().min(1, 'Pipeline name is required').max(100),
  description: z.string().max(500).optional(),
  isTemplate: z.boolean().optional().default(false),
  ownerAgentId: z.string().optional(),
  nodes: z.array(pipelineNodeSchema).optional().default([]),
  edges: z.array(pipelineEdgeSchema).optional().default([]),
});

// Update pipeline validation
export const updatePipelineSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
  isTemplate: z.boolean().optional(),
  nodes: z.array(pipelineNodeSchema).optional(),
  edges: z.array(pipelineEdgeSchema).optional(),
});

// Run pipeline validation
export const runPipelineSchema = z.object({
  input: z.record(z.unknown()).optional(),
});

// Types
export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>;
export type PipelineNodeInput = z.infer<typeof pipelineNodeSchema>;
export type PipelineEdgeInput = z.infer<typeof pipelineEdgeSchema>;
export type RunPipelineInput = z.infer<typeof runPipelineSchema>;
