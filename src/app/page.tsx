export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          🔨 FlowForge
        </h1>
        <p className="text-xl text-slate-400 mb-8">
          Design, deploy, and monitor multi-agent task pipelines on Openwork.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/editor"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Build a Workflow →
          </a>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
          >
            Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
