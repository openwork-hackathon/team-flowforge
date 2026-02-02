import { NextResponse } from "next/server";

// Predefined workflow templates
const TEMPLATES = [
  {
    id: "content-pipeline",
    name: "Content Creation Pipeline",
    description: "Research, write, and review content with AI agents",
    nodes: [
      {
        id: "start",
        type: "start",
        position: { x: 100, y: 200 },
        data: { label: "Start" },
      },
      {
        id: "research",
        type: "job",
        position: { x: 300, y: 200 },
        data: {
          label: "Research",
          title: "Research Topic",
          description: "Gather information and sources on the given topic",
          tags: ["research", "content"],
          reward: 0.01,
          agentSpecialty: "researcher",
        },
      },
      {
        id: "write",
        type: "job",
        position: { x: 500, y: 200 },
        data: {
          label: "Write",
          title: "Write Content",
          description: "Create content based on research findings",
          tags: ["writing", "content"],
          reward: 0.02,
          agentSpecialty: "writer",
        },
      },
      {
        id: "review",
        type: "job",
        position: { x: 700, y: 200 },
        data: {
          label: "Review",
          title: "Review & Edit",
          description: "Review and polish the content",
          tags: ["editing", "review"],
          reward: 0.01,
          agentSpecialty: "editor",
        },
      },
      {
        id: "end",
        type: "end",
        position: { x: 900, y: 200 },
        data: { label: "End" },
      },
    ],
    edges: [
      { id: "e1", source: "start", target: "research" },
      { id: "e2", source: "research", target: "write" },
      { id: "e3", source: "write", target: "review" },
      { id: "e4", source: "review", target: "end" },
    ],
  },
  {
    id: "code-review",
    name: "Code Review Pipeline",
    description: "Analyze, review, and suggest improvements for code",
    nodes: [
      {
        id: "start",
        type: "start",
        position: { x: 100, y: 200 },
        data: { label: "Start" },
      },
      {
        id: "analyze",
        type: "job",
        position: { x: 300, y: 200 },
        data: {
          label: "Analyze",
          title: "Static Analysis",
          description: "Run static analysis on the codebase",
          tags: ["code", "analysis"],
          reward: 0.01,
          agentSpecialty: "code-analyzer",
        },
      },
      {
        id: "condition",
        type: "condition",
        position: { x: 500, y: 200 },
        data: {
          label: "Has Issues?",
          condition: "analysis.issues.length > 0",
        },
      },
      {
        id: "fix",
        type: "job",
        position: { x: 700, y: 100 },
        data: {
          label: "Fix Issues",
          title: "Auto-fix Issues",
          description: "Automatically fix detected issues",
          tags: ["code", "fix"],
          reward: 0.02,
          agentSpecialty: "code-fixer",
        },
      },
      {
        id: "approve",
        type: "job",
        position: { x: 700, y: 300 },
        data: {
          label: "Approve",
          title: "Approve Changes",
          description: "Approve the code changes",
          tags: ["code", "review"],
          reward: 0.005,
          agentSpecialty: "reviewer",
        },
      },
      {
        id: "end",
        type: "end",
        position: { x: 900, y: 200 },
        data: { label: "End" },
      },
    ],
    edges: [
      { id: "e1", source: "start", target: "analyze" },
      { id: "e2", source: "analyze", target: "condition" },
      { id: "e3", source: "condition", target: "fix", label: "Yes" },
      { id: "e4", source: "condition", target: "approve", label: "No" },
      { id: "e5", source: "fix", target: "end" },
      { id: "e6", source: "approve", target: "end" },
    ],
  },
  {
    id: "data-processing",
    name: "Data Processing Pipeline",
    description: "Extract, transform, and load data",
    nodes: [
      {
        id: "start",
        type: "start",
        position: { x: 100, y: 200 },
        data: { label: "Start" },
      },
      {
        id: "extract",
        type: "job",
        position: { x: 300, y: 200 },
        data: {
          label: "Extract",
          title: "Extract Data",
          description: "Extract data from source",
          tags: ["data", "etl"],
          reward: 0.01,
          agentSpecialty: "data-extractor",
        },
      },
      {
        id: "transform",
        type: "job",
        position: { x: 500, y: 200 },
        data: {
          label: "Transform",
          title: "Transform Data",
          description: "Clean and transform the data",
          tags: ["data", "etl"],
          reward: 0.015,
          agentSpecialty: "data-transformer",
        },
      },
      {
        id: "load",
        type: "job",
        position: { x: 700, y: 200 },
        data: {
          label: "Load",
          title: "Load Data",
          description: "Load data into destination",
          tags: ["data", "etl"],
          reward: 0.01,
          agentSpecialty: "data-loader",
        },
      },
      {
        id: "end",
        type: "end",
        position: { x: 900, y: 200 },
        data: { label: "End" },
      },
    ],
    edges: [
      { id: "e1", source: "start", target: "extract" },
      { id: "e2", source: "extract", target: "transform" },
      { id: "e3", source: "transform", target: "load" },
      { id: "e4", source: "load", target: "end" },
    ],
  },
];

// GET /api/templates - List workflow templates
export async function GET() {
  return NextResponse.json(TEMPLATES);
}
