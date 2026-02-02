import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Template 1: Content Pipeline
// Start → Research (research agent) → Write Draft (writing agent) → Review (code-review agent) → End
const contentPipelineDAG = {
  nodes: [
    {
      id: "start-1",
      type: "start",
      position: { x: 100, y: 200 },
      data: { label: "Start", title: "Start Pipeline" },
    },
    {
      id: "job-1",
      type: "job",
      position: { x: 300, y: 200 },
      data: {
        label: "Research",
        title: "Research Topic",
        description:
          "Conduct thorough research on the given topic. Gather relevant sources, statistics, and key insights to inform the content creation process.",
        tags: ["research", "content", "analysis"],
        reward: 50,
        agentSpecialty: "research",
      },
    },
    {
      id: "job-2",
      type: "job",
      position: { x: 500, y: 200 },
      data: {
        label: "Write Draft",
        title: "Write Content Draft",
        description:
          "Create a comprehensive first draft based on the research findings. Include clear structure, engaging narrative, and proper citations.",
        tags: ["writing", "content", "creative"],
        reward: 100,
        agentSpecialty: "writing",
      },
    },
    {
      id: "job-3",
      type: "job",
      position: { x: 700, y: 200 },
      data: {
        label: "Review",
        title: "Editorial Review",
        description:
          "Review the draft for quality, accuracy, grammar, and style. Provide detailed feedback and suggestions for improvement.",
        tags: ["review", "editing", "quality"],
        reward: 75,
        agentSpecialty: "code-review",
      },
    },
    {
      id: "end-1",
      type: "end",
      position: { x: 900, y: 200 },
      data: { label: "End", title: "Pipeline Complete" },
    },
  ],
  edges: [
    { id: "e1", source: "start-1", target: "job-1" },
    { id: "e2", source: "job-1", target: "job-2" },
    { id: "e3", source: "job-2", target: "job-3" },
    { id: "e4", source: "job-3", target: "end-1" },
  ],
};

// Template 2: Code Audit Chain
// Start → Write Code (coding agent) → Security Audit (security-audit agent) → Condition (pass?) → [true] Deploy → End / [false] Fix → loop back
const codeAuditDAG = {
  nodes: [
    {
      id: "start-1",
      type: "start",
      position: { x: 100, y: 200 },
      data: { label: "Start", title: "Start Code Audit" },
    },
    {
      id: "job-1",
      type: "job",
      position: { x: 300, y: 200 },
      data: {
        label: "Write Code",
        title: "Implement Feature",
        description:
          "Write clean, well-documented code according to the specification. Follow best practices and coding standards.",
        tags: ["coding", "development", "implementation"],
        reward: 150,
        agentSpecialty: "coding",
      },
    },
    {
      id: "job-2",
      type: "job",
      position: { x: 500, y: 200 },
      data: {
        label: "Security Audit",
        title: "Security Review",
        description:
          "Perform comprehensive security audit. Check for vulnerabilities, injection risks, authentication issues, and data exposure. Return PASS or FAIL with detailed findings.",
        tags: ["security", "audit", "review"],
        reward: 200,
        agentSpecialty: "security-audit",
      },
    },
    {
      id: "condition-1",
      type: "condition",
      position: { x: 700, y: 200 },
      data: {
        label: "Audit Passed?",
        title: "Check Audit Result",
        condition: "result.status === 'PASS'",
      },
    },
    {
      id: "job-3",
      type: "job",
      position: { x: 900, y: 100 },
      data: {
        label: "Deploy",
        title: "Deploy to Production",
        description:
          "Deploy the audited code to production environment. Verify deployment success and run smoke tests.",
        tags: ["deployment", "devops", "release"],
        reward: 100,
        agentSpecialty: "coding",
      },
    },
    {
      id: "job-4",
      type: "job",
      position: { x: 900, y: 300 },
      data: {
        label: "Fix Issues",
        title: "Fix Security Issues",
        description:
          "Address all security vulnerabilities identified in the audit. Apply patches and refactor code as needed.",
        tags: ["bugfix", "security", "refactor"],
        reward: 125,
        agentSpecialty: "coding",
      },
    },
    {
      id: "end-1",
      type: "end",
      position: { x: 1100, y: 100 },
      data: { label: "End", title: "Deployment Complete" },
    },
  ],
  edges: [
    { id: "e1", source: "start-1", target: "job-1" },
    { id: "e2", source: "job-1", target: "job-2" },
    { id: "e3", source: "job-2", target: "condition-1" },
    { id: "e4", source: "condition-1", target: "job-3", label: "true", condition: "true" },
    { id: "e5", source: "condition-1", target: "job-4", label: "false", condition: "false" },
    { id: "e6", source: "job-3", target: "end-1" },
    { id: "e7", source: "job-4", target: "job-2" }, // Loop back to security audit
  ],
};

// Template 3: Multi-Agent Research
// Start → [parallel] Research A + Research B + Research C → Merge Results → Summarize → End
const multiAgentResearchDAG = {
  nodes: [
    {
      id: "start-1",
      type: "start",
      position: { x: 100, y: 250 },
      data: { label: "Start", title: "Start Parallel Research" },
    },
    {
      id: "job-1a",
      type: "job",
      position: { x: 350, y: 100 },
      data: {
        label: "Research A",
        title: "Market Research",
        description:
          "Analyze market trends, competitor landscape, and target audience demographics. Provide quantitative data and insights.",
        tags: ["research", "market", "analysis"],
        reward: 100,
        agentSpecialty: "research",
      },
    },
    {
      id: "job-1b",
      type: "job",
      position: { x: 350, y: 250 },
      data: {
        label: "Research B",
        title: "Technical Research",
        description:
          "Investigate technical feasibility, available technologies, and implementation approaches. Include pros/cons analysis.",
        tags: ["research", "technical", "engineering"],
        reward: 100,
        agentSpecialty: "research",
      },
    },
    {
      id: "job-1c",
      type: "job",
      position: { x: 350, y: 400 },
      data: {
        label: "Research C",
        title: "User Research",
        description:
          "Gather user needs, pain points, and expectations. Analyze user behavior patterns and feedback from similar products.",
        tags: ["research", "user", "ux"],
        reward: 100,
        agentSpecialty: "research",
      },
    },
    {
      id: "job-2",
      type: "job",
      position: { x: 600, y: 250 },
      data: {
        label: "Merge Results",
        title: "Consolidate Findings",
        description:
          "Combine all research streams into a unified dataset. Identify overlaps, contradictions, and key themes across sources.",
        tags: ["analysis", "synthesis", "data"],
        reward: 75,
        agentSpecialty: "research",
      },
    },
    {
      id: "job-3",
      type: "job",
      position: { x: 850, y: 250 },
      data: {
        label: "Summarize",
        title: "Executive Summary",
        description:
          "Create a comprehensive executive summary with key findings, recommendations, and actionable next steps.",
        tags: ["writing", "summary", "reporting"],
        reward: 125,
        agentSpecialty: "writing",
      },
    },
    {
      id: "end-1",
      type: "end",
      position: { x: 1050, y: 250 },
      data: { label: "End", title: "Research Complete" },
    },
  ],
  edges: [
    { id: "e1a", source: "start-1", target: "job-1a" },
    { id: "e1b", source: "start-1", target: "job-1b" },
    { id: "e1c", source: "start-1", target: "job-1c" },
    { id: "e2a", source: "job-1a", target: "job-2" },
    { id: "e2b", source: "job-1b", target: "job-2" },
    { id: "e2c", source: "job-1c", target: "job-2" },
    { id: "e3", source: "job-2", target: "job-3" },
    { id: "e4", source: "job-3", target: "end-1" },
  ],
};

// Template 4: API Build Pipeline
// Start → Design API (api agent) → Implement (backend agent) → Write Tests (coding agent) → Review (code-review agent) → End
const apiBuildDAG = {
  nodes: [
    {
      id: "start-1",
      type: "start",
      position: { x: 100, y: 200 },
      data: { label: "Start", title: "Start API Development" },
    },
    {
      id: "job-1",
      type: "job",
      position: { x: 300, y: 200 },
      data: {
        label: "Design API",
        title: "API Specification",
        description:
          "Design RESTful API endpoints, request/response schemas, authentication flow, and error handling. Create OpenAPI/Swagger specification.",
        tags: ["api", "design", "architecture"],
        reward: 125,
        agentSpecialty: "api",
      },
    },
    {
      id: "job-2",
      type: "job",
      position: { x: 500, y: 200 },
      data: {
        label: "Implement",
        title: "Backend Implementation",
        description:
          "Implement the API endpoints according to specification. Include proper validation, error handling, and database integration.",
        tags: ["backend", "coding", "implementation"],
        reward: 200,
        agentSpecialty: "backend",
      },
    },
    {
      id: "job-3",
      type: "job",
      position: { x: 700, y: 200 },
      data: {
        label: "Write Tests",
        title: "Test Suite",
        description:
          "Create comprehensive test suite including unit tests, integration tests, and API endpoint tests. Aim for >80% coverage.",
        tags: ["testing", "qa", "automation"],
        reward: 150,
        agentSpecialty: "coding",
      },
    },
    {
      id: "job-4",
      type: "job",
      position: { x: 900, y: 200 },
      data: {
        label: "Code Review",
        title: "Final Review",
        description:
          "Perform thorough code review. Check code quality, adherence to specifications, test coverage, and documentation completeness.",
        tags: ["review", "quality", "standards"],
        reward: 100,
        agentSpecialty: "code-review",
      },
    },
    {
      id: "end-1",
      type: "end",
      position: { x: 1100, y: 200 },
      data: { label: "End", title: "API Ready" },
    },
  ],
  edges: [
    { id: "e1", source: "start-1", target: "job-1" },
    { id: "e2", source: "job-1", target: "job-2" },
    { id: "e3", source: "job-2", target: "job-3" },
    { id: "e4", source: "job-3", target: "job-4" },
    { id: "e5", source: "job-4", target: "end-1" },
  ],
};

const templates = [
  {
    id: "template-content-pipeline",
    name: "Content Pipeline",
    description:
      "A linear content creation workflow: research a topic, write a draft, and get it reviewed. Great for blog posts, articles, and documentation.",
    status: "draft",
    dagJson: contentPipelineDAG,
    isTemplate: true,
  },
  {
    id: "template-code-audit",
    name: "Code Audit Chain",
    description:
      "Secure development workflow with built-in security audit loop. Code is checked for vulnerabilities before deployment, with automatic retry on failures.",
    status: "draft",
    dagJson: codeAuditDAG,
    isTemplate: true,
  },
  {
    id: "template-multi-research",
    name: "Multi-Agent Research",
    description:
      "Parallel research workflow that gathers insights from multiple angles simultaneously, then merges and summarizes findings. Ideal for comprehensive analysis.",
    status: "draft",
    dagJson: multiAgentResearchDAG,
    isTemplate: true,
  },
  {
    id: "template-api-build",
    name: "API Build Pipeline",
    description:
      "End-to-end API development workflow from design to review. Covers specification, implementation, testing, and code review stages.",
    status: "draft",
    dagJson: apiBuildDAG,
    isTemplate: true,
  },
];

async function main() {
  console.log("🌱 Seeding workflow templates...\n");

  for (const template of templates) {
    const existing = await prisma.pipeline.findUnique({
      where: { id: template.id },
    });

    if (existing) {
      console.log(`⏭️  Template "${template.name}" already exists, updating...`);
      await prisma.pipeline.update({
        where: { id: template.id },
        data: template,
      });
    } else {
      console.log(`✨ Creating template: ${template.name}`);
      await prisma.pipeline.create({
        data: template,
      });
    }
  }

  console.log("\n✅ Seeding complete! Created/updated 4 workflow templates.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
