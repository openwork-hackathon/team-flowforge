"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopBarProps {
  /** Pipeline name for editor page */
  pipelineName?: string;
  /** Save status indicator */
  saveStatus?: "saved" | "saving" | "unsaved" | "error";
  /** Pipeline ID (shown as breadcrumb) */
  pipelineId?: string | null;
  /** Whether a pipeline is currently running */
  isRunning?: boolean;
}

const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/editor": "Editor",
  "/dashboard": "Dashboard",
  "/templates": "Templates",
};

function SaveIndicator({ status }: { status: string }) {
  const config: Record<string, { dot: string; text: string; label: string }> = {
    saved: {
      dot: "bg-forge-success",
      text: "text-forge-success",
      label: "Saved ✓",
    },
    saving: {
      dot: "bg-forge-warning animate-live-pulse",
      text: "text-forge-warning",
      label: "Saving...",
    },
    unsaved: {
      dot: "bg-forge-text-muted",
      text: "text-forge-text-muted",
      label: "Unsaved",
    },
    error: {
      dot: "bg-forge-error",
      text: "text-forge-error",
      label: "Error",
    },
  };

  const c = config[status] || config.unsaved;

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className={`text-xs font-medium ${c.text}`}>{c.label}</span>
    </div>
  );
}

function LiveIndicator({ isRunning }: { isRunning: boolean }) {
  if (isRunning) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-forge-success/10 border border-forge-success/20">
        <div className="w-1.5 h-1.5 rounded-full bg-forge-success animate-live-pulse" />
        <span className="text-[11px] font-semibold text-forge-success tracking-wider">
          LIVE
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.02] border border-forge-border">
      <div className="w-1.5 h-1.5 rounded-full bg-forge-text-muted" />
      <span className="text-[11px] font-medium text-forge-text-muted tracking-wider">
        IDLE
      </span>
    </div>
  );
}

function AIHeartbeat() {
  return (
    <div className="relative w-8 h-8 flex items-center justify-center">
      {/* Pulse ring */}
      <div className="absolute inset-0 rounded-full bg-forge-cyan/10 animate-glow-pulse" />
      {/* Icon */}
      <svg
        className="w-4 h-4 text-forge-cyan animate-heartbeat"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l3-3 2.25 2.25 4.5-4.5 3 3 3.75-3.75"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5v3h-3" />
      </svg>
    </div>
  );
}

function WalletPill() {
  // Placeholder — shows disconnected state
  return (
    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.02] border border-forge-border text-xs">
      <div className="w-1.5 h-1.5 rounded-full bg-forge-text-muted" />
      <span className="text-forge-text-muted font-mono">Connect</span>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-blue-violet flex items-center justify-center text-[10px] font-bold text-white">
      FF
    </div>
  );
}

export default function TopBar({
  pipelineName,
  saveStatus,
  pipelineId,
  isRunning = false,
}: TopBarProps) {
  const pathname = usePathname();
  const pageName = PAGE_NAMES[pathname] || "";

  return (
    <header className="h-12 flex items-center justify-between px-4 glass-panel-strong border-b border-forge-border z-30">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href="/"
          className="text-sm font-bold text-gradient-blue-violet whitespace-nowrap"
        >
          FlowForge
        </Link>

        {pageName && (
          <>
            <span className="text-forge-text-dim text-xs">/</span>
            <span className="text-forge-text-secondary text-xs font-medium">
              {pageName}
            </span>
          </>
        )}

        {pipelineName && (
          <>
            <span className="text-forge-text-dim text-xs">/</span>
            <span className="text-forge-text-primary text-xs font-medium truncate max-w-[200px]">
              {pipelineName}
            </span>
          </>
        )}

        {pipelineId && (
          <span className="hidden lg:inline text-[10px] text-forge-text-dim font-mono">
            [{pipelineId.slice(0, 8)}]
          </span>
        )}
      </div>

      {/* Center: Save status (editor only) */}
      <div className="hidden sm:flex items-center">
        {saveStatus && <SaveIndicator status={saveStatus} />}
      </div>

      {/* Right: Status indicators */}
      <div className="flex items-center gap-3">
        <LiveIndicator isRunning={isRunning} />
        <AIHeartbeat />
        <WalletPill />
        <UserAvatar />
      </div>
    </header>
  );
}
