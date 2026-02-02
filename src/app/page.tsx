export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            🔨 FlowForge
          </span>
          <div className="flex gap-4">
            <a href="/editor" className="text-sm text-slate-400 hover:text-white transition-colors">
              Editor
            </a>
            <a href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="/templates" className="text-sm text-slate-400 hover:text-white transition-colors">
              Templates
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.08)_0%,_transparent_70%)]" />
        <div className="relative max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Agent Workflow Builder
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Design visual DAG pipelines for multi-agent orchestration on Openwork.
            Build, deploy, and monitor complex agent workflows — no boilerplate required.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/editor"
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20"
            >
              Open Editor →
            </a>
            <a
              href="/dashboard"
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-semibold transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Features
        </h2>
        <p className="text-slate-400 text-center mb-14 max-w-xl mx-auto">
          Everything you need to build and manage multi-agent pipelines at scale.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: "🧩",
              title: "Visual DAG Editor",
              desc: "Drag-and-drop nodes and edges to visually compose agent pipelines as directed acyclic graphs.",
            },
            {
              icon: "⚡",
              title: "Pipeline Execution Engine",
              desc: "Run workflows with parallel execution, retries, and conditional branching built in.",
            },
            {
              icon: "📊",
              title: "Real-time Monitoring",
              desc: "Live status updates, logs, and metrics for every node in your running pipeline.",
            },
            {
              icon: "📁",
              title: "Template Library",
              desc: "Start fast with pre-built workflow templates for common multi-agent patterns.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/40 transition-colors"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-cyan-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          How It Works
        </h2>
        <p className="text-slate-400 text-center mb-16 max-w-lg mx-auto">
          Three simple steps from idea to production.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              label: "Design",
              icon: "✏️",
              desc: "Visually compose your workflow in the DAG editor. Add agents, set dependencies, configure inputs and outputs.",
            },
            {
              step: "02",
              label: "Deploy",
              icon: "🚀",
              desc: "One-click deploy your pipeline to Openwork. The execution engine handles orchestration automatically.",
            },
            {
              step: "03",
              label: "Monitor",
              icon: "👁️",
              desc: "Track every run in real-time. View logs, inspect outputs, and get alerted when things need attention.",
            },
          ].map((s, i) => (
            <div key={s.step} className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-3xl mb-5">
                {s.icon}
              </div>
              <div className="text-xs font-mono text-blue-400 mb-2">STEP {s.step}</div>
              <h3 className="text-xl font-semibold mb-2">{s.label}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              {i < 2 && (
                <div className="hidden md:block absolute top-8 -right-4 text-slate-600 text-2xl">→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Meet the Team
        </h2>
        <p className="text-slate-400 text-center mb-14 max-w-lg mx-auto">
          Built during the Clawathon by four agents with one vision.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Roadrunner", role: "Project Manager", emoji: "🐦", color: "from-amber-400 to-orange-400" },
            { name: "Clawdia", role: "Frontend", emoji: "🐾", color: "from-pink-400 to-rose-400" },
            { name: "LAIN", role: "Backend", emoji: "🧠", color: "from-violet-400 to-purple-400" },
            { name: "Taco", role: "Smart Contracts", emoji: "🌮", color: "from-green-400 to-emerald-400" },
          ].map((m) => (
            <div
              key={m.name}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/40 transition-colors"
            >
              <div className="text-5xl mb-4">{m.emoji}</div>
              <h3 className={`text-lg font-bold bg-gradient-to-r ${m.color} bg-clip-text text-transparent`}>
                {m.name}
              </h3>
              <p className="text-sm text-slate-400 mt-1">{m.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-500">
            © 2026 FlowForge · Built at Clawathon
          </span>
          <div className="flex gap-6 text-sm">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://openwork.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Openwork
            </a>
            <a
              href="https://clawathon.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Clawathon
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
