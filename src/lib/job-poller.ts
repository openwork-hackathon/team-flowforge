import prisma from './prisma';
import { getJob } from './openwork';
import { completeNode, failNode } from './execution-engine';
import { emitRunEvent, RunEventType } from './websocket-events';

const POLL_INTERVAL_MS = 5000; // 5 seconds
const MAX_POLL_DURATION_MS = 30 * 60 * 1000; // 30 minutes max

interface PollableJob {
  nodeRunId: string;
  runId: string;
  nodeId: string;
  openworkJobId: string;
  startedAt: Date;
}

// Active polling jobs
const activePolls = new Map<string, NodeJS.Timeout>();

/**
 * Start polling for a specific job
 */
export function startPolling(job: PollableJob): void {
  const key = `${job.runId}:${job.nodeId}`;
  
  // Don't start duplicate polls
  if (activePolls.has(key)) {
    console.log(`[JobPoller] Already polling ${key}`);
    return;
  }

  console.log(`[JobPoller] Starting poll for job ${job.openworkJobId}`);

  const poll = async () => {
    try {
      const jobStatus = await getJob(job.openworkJobId);
      console.log(`[JobPoller] Job ${job.openworkJobId} status:`, jobStatus.status);

      // Emit progress event
      emitRunEvent(job.runId, {
        type: RunEventType.JOB_PROGRESS,
        nodeId: job.nodeId,
        jobId: job.openworkJobId,
        progress: jobStatus.progress || 0,
        timestamp: new Date().toISOString(),
      });

      // Check if job is complete
      if (jobStatus.status === 'completed' || jobStatus.status === 'done') {
        stopPolling(key);
        await completeNode(job.runId, job.nodeId, {
          jobId: job.openworkJobId,
          result: jobStatus.result || jobStatus.output,
          submissions: jobStatus.submissions,
        });
        return;
      }

      // Check if job failed
      if (jobStatus.status === 'failed' || jobStatus.status === 'cancelled') {
        stopPolling(key);
        await failNode(job.runId, job.nodeId, jobStatus.error || 'Job failed');
        return;
      }

      // Check for timeout
      const elapsed = Date.now() - job.startedAt.getTime();
      if (elapsed > MAX_POLL_DURATION_MS) {
        stopPolling(key);
        await failNode(job.runId, job.nodeId, 'Job timed out');
        return;
      }

      // Continue polling
      const timeout = setTimeout(poll, POLL_INTERVAL_MS);
      activePolls.set(key, timeout);
    } catch (error) {
      console.error(`[JobPoller] Error polling job ${job.openworkJobId}:`, error);
      
      // On error, retry up to 3 times then fail
      const retryKey = `${key}:retries`;
      const retries = (activePolls.get(retryKey) as unknown as number) || 0;
      
      if (retries >= 3) {
        stopPolling(key);
        await failNode(
          job.runId,
          job.nodeId,
          `Failed to poll job status: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        return;
      }

      activePolls.set(retryKey as string, retries + 1 as unknown as NodeJS.Timeout);
      const timeout = setTimeout(poll, POLL_INTERVAL_MS * 2); // Longer delay on error
      activePolls.set(key, timeout);
    }
  };

  // Start polling immediately
  poll();
}

/**
 * Stop polling for a specific job
 */
export function stopPolling(key: string): void {
  const timeout = activePolls.get(key);
  if (timeout) {
    clearTimeout(timeout);
    activePolls.delete(key);
  }
  // Clean up retry counter
  activePolls.delete(`${key}:retries`);
  console.log(`[JobPoller] Stopped polling ${key}`);
}

/**
 * Stop all polling for a specific run
 */
export function stopRunPolling(runId: string): void {
  for (const key of Array.from(activePolls.keys())) {
    if (key.startsWith(`${runId}:`)) {
      stopPolling(key);
    }
  }
}

/**
 * Resume polling for all running jobs
 * Call this on server startup to resume any interrupted polls
 */
export async function resumePolling(): Promise<void> {
  console.log('[JobPoller] Resuming polling for running jobs...');

  const runningNodeRuns = await prisma.nodeRun.findMany({
    where: {
      status: 'RUNNING',
      openworkJobId: { not: null },
    },
    include: {
      pipelineRun: true,
    },
  });

  console.log(`[JobPoller] Found ${runningNodeRuns.length} running jobs to poll`);

  for (const nodeRun of runningNodeRuns) {
    if (nodeRun.openworkJobId && nodeRun.pipelineRun.status === 'RUNNING') {
      startPolling({
        nodeRunId: nodeRun.id,
        runId: nodeRun.pipelineRunId,
        nodeId: nodeRun.nodeId,
        openworkJobId: nodeRun.openworkJobId,
        startedAt: nodeRun.startedAt || new Date(),
      });
    }
  }
}

/**
 * Get polling status for debugging
 */
export function getPollingStatus(): { activeJobs: number; jobs: string[] } {
  const jobs = Array.from(activePolls.keys()).filter(k => !k.includes(':retries'));
  return {
    activeJobs: jobs.length,
    jobs,
  };
}
