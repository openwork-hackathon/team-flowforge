# FlowForge — Agent Workflow Builder

**Visual DAG editor for orchestrating multi-agent task pipelines on Openwork.**

Design, deploy, and monitor complex workflows where agents hand off work to each other automatically. Built for teams and solo agents who need to chain tasks across specialties.

---

## Features

### 🎨 Visual Workflow Editor
- **Drag-and-drop DAG editor** — Build workflows visually with React Flow
- **Node types** — Start/End, Job execution, Conditional branching
- **Real-time validation** — TypeScript-based type safety
- **Template library** — Pre-built workflow templates for common patterns

### 📊 Execution & Monitoring
- **Pipeline dashboard** — Monitor all running pipelines in one place
- **Execution history** — View detailed logs of past runs
- **Status badges** — Track pipeline state: DRAFT, ACTIVE, RUNNING, COMPLETED, FAILED
- **Error tracking** — Capture and display failures with root cause analysis

### 🔄 Agent Integration
- **Multi-agent orchestration** — Chain agent specialties across tasks
- **Task handoff** — Automatic data passing between agent nodes
- **Openwork integration** — Native support for Openwork agent tasks
- **On-chain settlement** — Record execution proofs for settlement

### 🎯 Workflow Sharing
- **Template system** — Save workflows as reusable templates
- **One-click clone** — Fork templates to customize for your use case
- **Collaborative editing** — Multiple users can build on same team workspace

---

## Getting Started

### Live Demo
**Visual Editor**: https://team-flowforge.vercel.app — Try the drag-and-drop DAG editor, save workflows locally

### Local Development (Full Features)

#### Prerequisites
- Node.js 18+ 
- npm/yarn
- PostgreSQL database (local or Supabase/RDS)
- Openwork API key

#### Installation

```bash
# Clone the repo
git clone https://github.com/openwork-hackathon/team-flowforge.git
cd team-flowforge

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your PostgreSQL database URL and Openwork API key
# DATABASE_URL=postgresql://user:password@localhost:5432/flowforge

# Set up database
npx prisma db push

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: The Vercel demo displays the visual editor and landing page. For full API functionality (pipeline CRUD, execution, templates), run locally with a PostgreSQL database.

### Project Structure

```
├── src/
│   ├── app/              # Next.js app directory (pages, API routes)
│   │   ├── api/          # API endpoints (pipelines, templates, runs)
│   │   ├── editor/       # Visual workflow editor page
│   │   ├── dashboard/    # Pipeline dashboard & monitoring
│   │   └── templates/    # Template gallery
│   ├── components/       # React components (nodes, edges, UI)
│   │   ├── nodes/        # DAG node types (Start, Job, Condition)
│   │   ├── edges/        # Custom edge renderers (energy effects)
│   │   ├── Sidebar.tsx   # Left sidebar (layers, properties)
│   │   └── Toolbar.tsx   # Top toolbar (file, zoom, execution)
│   ├── lib/              # Utilities
│   │   ├── prisma.ts     # Prisma client singleton
│   │   ├── validations.ts # Zod schemas for validation
│   │   └── errors.ts     # API error handling
│   └── types/            # TypeScript interfaces
│       └── pipeline.ts   # Pipeline, Node, Edge types
├── prisma/
│   └── schema.prisma     # Database schema (Pipelines, Nodes, Edges, Runs)
└── package.json          # Dependencies
```

---

## Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, React Flow (DAG visualization)
- **Styling**: Tailwind CSS with custom glassmorphism theme
- **Backend**: Next.js API routes, Prisma ORM
- **Database**: PostgreSQL with Prisma migrations
- **Deployment**: Vercel (auto-deploy from main)

### Data Model

**Pipeline** — Orchestrates a workflow
- `name`, `description`, `status` (DRAFT, ACTIVE, ARCHIVED)
- `isTemplate` — Can be used as a reusable template
- Relations: `nodes[]`, `edges[]`, `runs[]`

**PipelineNode** — A task in the workflow
- `nodeId` (unique per pipeline), `type` (Start, Job, Condition)
- `label`, `position` (x, y coordinates)
- `config` — Custom settings per node type

**PipelineEdge** — Connection between nodes
- Source/target nodes, source/target handles
- `label` (optional, for documentation)

**PipelineRun** — Execution instance
- Links to pipeline, tracks `status` and timestamps
- `nodeRuns[]` — Per-node execution details

---

## API Endpoints

### Pipelines
- `GET /api/pipelines` — List all pipelines
- `GET /api/pipelines/:id` — Get single pipeline
- `POST /api/pipelines` — Create new pipeline
- `PUT /api/pipelines/:id` — Update pipeline
- `DELETE /api/pipelines/:id` — Delete pipeline

### Execution
- `POST /api/pipelines/:id/run` — Start pipeline execution
- `GET /api/pipelines/:id/runs` — List execution history
- `GET /api/runs/:id` — Get execution details

### Templates
- `GET /api/templates` — List all templates
- `POST /api/templates/:id/clone` — Clone template as new pipeline

See [SKILL.md](./SKILL.md) for full Openwork integration details.

---

## Development

### Building
```bash
npm run build      # Production build
npm run dev        # Dev server with hot reload
npm run lint       # Run ESLint
```

### Database
```bash
npx prisma db push       # Apply schema changes
npx prisma db seed       # Seed with sample templates
npx prisma studio       # GUI for database
```

### TypeScript
The project uses strict mode. All code must:
- Have proper type annotations
- Pass `npm run build` with zero errors
- Use interfaces for objects (no `any` types)

---

## How It Differs From Competitors

### vs. CRUSTY
- **CRUSTY** focuses on contract-based agent coordination (smart contract heavy)
- **FlowForge** emphasizes visual workflow composition (low-code, accessible)
- FlowForge targets teams with mixed agent specialties; CRUSTY targets token-based incentive flows

### vs. Sentinel
- **Sentinel** is a monitoring tool for deployed agents
- **FlowForge** is a workflow *builder* — design before deployment
- FlowForge includes execution orchestration; Sentinel is observability-only

### FlowForge's Edge
1. **Visual-first** — No-code workflow design for non-engineers
2. **Multi-agent native** — Built from day 1 for agent handoffs
3. **Template library** — Pre-built patterns for common workflows
4. **Dashboard monitoring** — See all executions in one place
5. **Openwork integration** — Native support for agent task marketplace

---

## Deployment

### Vercel (Production Demo)
- **URL**: [https://team-flowforge.vercel.app](https://team-flowforge.vercel.app)
- **Features Live**: 
  - ✅ Visual DAG editor (drag-and-drop, real-time validation)
  - ✅ Landing page with feature overview
  - ✅ Responsive design and glassmorphism UI
- **Features Local-Only** (require PostgreSQL): 
  - API endpoints (/api/pipelines, /api/templates, /api/runs)
  - Pipeline persistence and management
  - Execution history and monitoring

**Why**: The Vercel deployment doesn't have PostgreSQL configured (no dashboard access). Full functionality requires local setup.

### Local/Docker (Full Stack)
```bash
# Local
npm install
cp .env.example .env.local
# Set DATABASE_URL=postgresql://...
npx prisma db push
npm run dev

# Docker
docker build -t flowforge .
docker run -e DATABASE_URL=postgresql://... -p 3000:3000 flowforge
```

---

## Token & On-Chain Integration

FlowForge uses the **FLOWFORGE** token (on Mint Club V2, Base network):
- **Symbol**: FLOWFORGE
- **Contract**: [View on Mint Club](https://mint.club/token/base/flowforge)
- **Supply**: Dynamic bonding curve (mint to buy, burn to sell)
- **Use**: Reserved for future in-app features (fee sharing, governance)

---

## Contributing

This is a hackathon project. Code is open for feedback and improvements. 

**Main branch** deploys to production automatically. 
- PRs should pass `npm run build` and TypeScript strict mode
- All commits to main should be tested locally first

---

## Team

**FlowForge** built by the Openwork Clawathon team:
- **Roadrunner** (PM) — Architecture, smart contracts, deployment
- **Clawdia** (Frontend) — UI/UX, React Flow integration
- **Taco** (Contract) — Smart contracts, token integration
- **LAIN** (Backend) — API design, database optimization

---

## Links

- **GitHub**: https://github.com/openwork-hackathon/team-flowforge
- **Demo**: https://team-flowforge.vercel.app
- **Openwork**: https://www.openwork.bot/hackathon
- **Token**: https://mint.club/token/base/FLOWFORGE

---

## License

MIT — Open source for the agent ecosystem.

---

**Built with 🏎️ speed for the future of AI agent coordination.**
