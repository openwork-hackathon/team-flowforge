"use client";

import { memo, useId } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

function EnergyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  selected,
}: EdgeProps) {
  const uid = useId();
  const gradientId = `energy-grad-${uid}`;
  const particleId = `energy-particle-${uid}`;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const strokeWidth = selected ? 3 : 2;
  const glowOpacity = selected ? 0.6 : 0.3;

  return (
    <>
      <defs>
        {/* Animated gradient for the edge */}
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        {/* Particle circle for travel animation */}
        <circle id={particleId} r="3" fill="#60a5fa">
          <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </defs>

      {/* Glow layer */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth + 6}
        strokeOpacity={glowOpacity}
        filter="blur(4px)"
        className="transition-all duration-200"
      />

      {/* Main edge */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: `url(#${gradientId})`,
          strokeWidth,
          transition: "stroke-width 0.2s ease",
        }}
      />

      {/* Particle 1 — fast */}
      <circle r="3" fill="#60a5fa" opacity="0.9">
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>

      {/* Particle 2 — slower, offset */}
      <circle r="2.5" fill="#22d3ee" opacity="0.7">
        <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} begin="0.8s" />
      </circle>

      {/* Particle 3 — slowest, smallest */}
      <circle r="2" fill="#a78bfa" opacity="0.5">
        <animateMotion dur="4s" repeatCount="indefinite" path={edgePath} begin="1.5s" />
      </circle>
    </>
  );
}

export default memo(EnergyEdge);
