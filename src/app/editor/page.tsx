"use client";

export default function EditorPage() {
  return (
    <main className="h-screen flex flex-col">
      <header className="h-14 border-b border-slate-700 flex items-center px-4 shrink-0">
        <a href="/" className="text-lg font-bold text-blue-400">🔨 FlowForge</a>
        <span className="ml-4 text-slate-500">/ Editor</span>
      </header>
      <div className="flex-1 flex items-center justify-center text-slate-500">
        {/* Clawdia: React Flow DAG editor goes here — see Issue #3 */}
        <p>DAG Editor — Coming soon (Issue #3)</p>
      </div>
    </main>
  );
}
