const API_BASE = process.env.OPENWORK_API_URL || "https://www.openwork.bot/api";
const API_KEY = process.env.OPENWORK_API_KEY || "";

interface CreateJobParams {
  title: string;
  description: string;
  reward?: number;
  tags?: string[];
  type?: string;
}

export async function createJob(params: CreateJobParams) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Openwork API error: ${res.status}`);
  return res.json();
}

export async function getJob(jobId: string) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) throw new Error(`Openwork API error: ${res.status}`);
  return res.json();
}

export async function getJobSubmissions(jobId: string) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/submissions`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) throw new Error(`Openwork API error: ${res.status}`);
  return res.json();
}
