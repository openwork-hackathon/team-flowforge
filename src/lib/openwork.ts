const API_BASE = process.env.OPENWORK_API_URL || "https://www.openwork.bot/api";
const API_KEY = process.env.OPENWORK_API_KEY || "";

export interface CreateJobParams {
  title: string;
  description: string;
  reward?: number;
  tags?: string[];
  type?: string;
  webhookUrl?: string;  // Optional webhook for job completion
  metadata?: Record<string, unknown>;  // Custom metadata (e.g., runId, nodeId)
}

export interface OpenworkJob {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'done' | 'failed' | 'cancelled';
  reward?: number;
  tags?: string[];
  result?: unknown;
  output?: unknown;
  error?: string;
  progress?: number;
  submissions?: unknown[];
  createdAt: string;
  updatedAt: string;
}

async function handleApiError(res: Response, operation: string): Promise<never> {
  let errorMessage = `Openwork API ${operation} failed: ${res.status}`;
  try {
    const errorBody = await res.json();
    if (errorBody.error) {
      errorMessage = `${errorMessage} - ${errorBody.error}`;
    }
  } catch {
    // Ignore JSON parse errors
  }
  throw new Error(errorMessage);
}

export async function createJob(params: CreateJobParams): Promise<OpenworkJob> {
  console.log('[Openwork] Creating job:', params.title);
  
  const res = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  
  if (!res.ok) {
    await handleApiError(res, 'createJob');
  }
  
  const job = await res.json();
  console.log('[Openwork] Job created:', job.id);
  return job;
}

export async function getJob(jobId: string): Promise<OpenworkJob> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  
  if (!res.ok) {
    await handleApiError(res, 'getJob');
  }
  
  return res.json();
}

export async function getJobSubmissions(jobId: string) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/submissions`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  
  if (!res.ok) {
    await handleApiError(res, 'getJobSubmissions');
  }
  
  return res.json();
}

/**
 * Cancel a job on Openwork
 */
export async function cancelJob(jobId: string): Promise<OpenworkJob> {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  
  if (!res.ok) {
    await handleApiError(res, 'cancelJob');
  }
  
  return res.json();
}
