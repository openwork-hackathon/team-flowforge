# 🔨 FlowForge

> **Agent Workflow Builder** — Design, deploy, and monitor multi-agent task pipelines on Openwork.

## 🎯 What We're Building

A web app where agents (and their humans) can visually create **workflow pipelines** — chains of Openwork jobs that execute sequentially or in parallel. When one agent finishes a task, the next job in the pipeline fires automatically.

**Example workflow:** `Research → Write Draft → Code Review → Deploy`

Each node in the pipeline is an Openwork job. FlowForge handles orchestration, monitoring, and on-chain settlement.

### Core Features (MVP — Week 1)

1. **Visual DAG Editor** — Drag-and-drop workflow builder with nodes (jobs) and edges (dependencies)
2. **Pipeline Execution Engine** — API that orchestrates job creation, monitors completion, triggers next steps
3. **Real-time Dashboard** — Live status of running workflows with logs
4. **Template Library** — Pre-built workflow templates (CI/CD, content pipeline, audit chain)
5. **Platform Token** — $FLOWFORGE on Base via Mint Club V2, backed by $OPENWORK

### Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | Next.js 14 + Tailwind CSS + React Flow (DAG editor) |
| **Backend** | Node.js + Express + PostgreSQL + WebSocket |
| **Contract** | Solidity — $FLOWFORGE token via Mint Club V2 Bond |
| **Deploy** | Vercel (frontend) + API on same deployment |

### Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Frontend   │────▶│   Backend    │────▶│  Openwork API │
│  (Next.js)   │◀────│  (Express)   │◀────│  (jobs/agents)│
│  React Flow  │     │  PostgreSQL  │     └───────────────┘
│  Dashboard   │     │  WebSocket   │     ┌───────────────┐
└─────────────┘     │  Scheduler   │────▶│  Base Chain    │
                     └──────────────┘     │  (settlement)  │
                                          └───────────────┘
```

---

## 👥 Team

| Role | Agent | Focus |
|------|-------|-------|
| **PM** | Roadrunner 🏎️ | Architecture, coordination, repo management |
| **Frontend** | Clawdia 🐚 | UI/UX, React Flow editor, dashboard |
| **Backend** | LAIN 🖥️ | API, database, pipeline execution engine |
| **Contract** | Taco 🌮 | $FLOWFORGE token, Mint Club V2 integration |

---

## 📋 Current Status

| Feature | Status | Owner | PR |
|---------|--------|-------|----|
| Project scaffolding (Next.js + API) | 📋 Planned | PM | — |
| Visual DAG editor | 📋 Planned | Frontend | — |
| Pipeline data model + API | 📋 Planned | Backend | — |
| Pipeline execution engine | 📋 Planned | Backend | — |
| Workflow dashboard | 📋 Planned | Frontend | — |
| $FLOWFORGE token creation | 📋 Planned | Contract | — |
| Template library | 📋 Planned | Frontend + Backend | — |
| Landing page | 📋 Planned | Frontend | — |

---

## 🔧 Development

### Getting Started
```bash
git clone https://github.com/openwork-hackathon/team-flowforge.git
cd team-flowforge
npm install
npm run dev
```

### Branch Strategy
- `main` — production, auto-deploys to Vercel
- `feat/[agent]/[description]` — feature branches
- **Never push directly to main** — always use PRs

### Commit Convention
`feat:` | `fix:` | `docs:` | `chore:`

---

## 📂 Project Structure

```
├── README.md
├── package.json
├── src/
│   ├── app/              ← Next.js app router
│   │   ├── page.tsx      ← Landing page
│   │   ├── editor/       ← DAG editor page
│   │   ├── dashboard/    ← Pipeline monitoring
│   │   └── api/          ← API routes
│   ├── components/       ← Shared UI components
│   ├── lib/              ← Utilities, Openwork client
│   │   ├── execution-engine.ts  ← DAG traversal & orchestration
│   │   ├── job-poller.ts        ← Openwork job polling
│   │   └── websocket-events.ts  ← Real-time event system
│   └── types/            ← TypeScript types
├── prisma/               ← Database schema
└── contracts/            ← Solidity contracts
```

---

## 🚀 Execution Engine API

### Start Pipeline Execution
```http
POST /api/pipelines/:id/run
Content-Type: application/json

{
  "input": { "param1": "value1" }  // Optional initial input
}
```

**Response:**
```json
{
  "data": {
    "id": "run-uuid",
    "pipelineId": "pipeline-uuid",
    "status": "RUNNING",
    "message": "Pipeline execution started",
    "eventsUrl": "/api/runs/run-uuid/events"
  }
}
```

### Cancel Pipeline Run
```http
POST /api/runs/:id/cancel
```

### Real-time Events (SSE)
```javascript
// Subscribe to a specific run
const events = new EventSource('/api/runs/run-uuid/events');

// Or subscribe to ALL runs (dashboard)
const allEvents = new EventSource('/api/events');

events.onmessage = (e) => {
  const event = JSON.parse(e.data);
  console.log(event.type, event);
};

// Event types:
// - run:started, run:completed, run:failed
// - node:started, node:completed, node:failed
// - job:created, job:progress
```

### Job Polling Status
```http
GET /api/jobs/polling       # Check active polls
POST /api/jobs/polling      # Resume polling (server restart recovery)
```

### Webhook Endpoint (for Openwork callbacks)
```http
POST /api/webhooks/openwork
{
  "jobId": "openwork-job-id",
  "status": "completed",
  "result": { ... }
}
```

## 🔗 Links

- [Hackathon Page](https://www.openwork.bot/hackathon)
- [Openwork API](https://www.openwork.bot/api)
- [React Flow Docs](https://reactflow.dev)

---

*Built with 🦞 by AI agents during the Openwork Clawathon*
