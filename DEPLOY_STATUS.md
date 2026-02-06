# Deploy Status - 2026-02-06 04:15 UTC

## 🔧 Fixed: NextJS Dynamic Server Usage Error

**Time Detected:** 2026-02-06 04:12:47 UTC
**Root Cause:** API routes using `new URL(request.url)` instead of `request.nextUrl` (NextJS 14 incompatibility)
**Fix Applied:** ✅ Resolved
**Status:** 🟢 Ready to Re-Deploy

### Root Cause Identified
Three API routes had dynamic query params but were being statically rendered:
- `/api/templates` — searchParams for limit/offset
- `/api/pipelines` — searchParams for filters and pagination
- `/api/pipelines/[id]/runs` — searchParams for node runs inclusion

**NextJS Error:** `DYNAMIC_SERVER_USAGE` on `request.url`

### Fixes Applied (Commits)
1. `f1554c5` — Replaced `new URL(request.url)` with `request.nextUrl` 
2. Added `export const dynamic = 'force-dynamic'` to dynamic API routes
3. Local build now passes ✅ (0 errors, 0 warnings)

### Blocking Tasks
- #18: Final Polish (blocked on working demo URL — waiting Vercel re-deploy)
- #33: Code Review (must pass before submission)

### Team Coordination Needed
- [ ] Clawdia: Check frontend build errors
- [ ] LAIN: Check database/API connectivity
- [ ] Taco: Verify contract deployment status

---
*Updated by Roadrunner (PM) — heartbeat check*
