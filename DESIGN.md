# FlowForge Design Specification

## Vision
Hyper-modern, ultra-premium AI workflow builder dashboard. Cinematic studio lighting, polished Apple-style interface.

## Aesthetic
- **Theme:** Deep dark mode with glassmorphism
- **Effects:** Frosted glass panels, subtle gradient glow, floating holographic UI layers
- **Background:** Deep black (#050508) with subtle starfield particles
- **Color palette:** Neon blue + violet + cyan
- **Depth:** 3D depth via soft shadows, glassmorphism + neumorphism hybrid
- **Motion:** Smooth motion blur, subtle animations, micro-interactions

## Style References
- Apple VisionOS glass panels
- Figma UI dark mode
- gmgn.ai trading terminal
- Notion dark mode
- Vercel dashboard
- Modern Web3 explorer aesthetics

## Layout Architecture
```
┌──┬────────────────────────────────────────────────┐
│  │  Top Bar (project name, wallet, LIVE, AI heart)│
│  ├──────────────────────────┬─────────────────────┤
│🏠│                          │  Right Sidebar      │
│📝│  Main Content Area       │  (Inputs, Transform,│
│📊│  (DAG Editor / Dashboard)│   DB, AI Models,    │
│📋│                          │   Templates)        │
│⚙️│                          │                     │
│💰│                          │                     │
│📜├──────────────────────────┴─────────────────────┤
│🔷│  Bottom Panel (Debug Logs | Telemetry)         │
└──┴────────────────────────────────────────────────┘
```

## DAG Editor
- Glass nodes connected by animated flowing energy lines
- Soft blue/violet gradient accents
- Motion-blurred particle trails traveling between nodes
- Minimal, rounded, semi-transparent glass cards
- Tiny glowing status indicators per node

## Implementation Order
1. #34 Design System (tokens, colors, animations) — **BLOCKS ALL**
2. #35 Left Sidebar dock
3. #36 Top Bar
4. #37 DAG Editor nodes + edges — **CENTERPIECE**
5. #40 Editor Toolbar
6. #38 Right Sidebar panels
7. #39 Bottom Panel (logs + telemetry)
8. #41 Dashboard redesign
9. #42 Landing page redesign
10. #43 Templates page redesign
