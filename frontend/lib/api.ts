const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function analyzeProduct(formData: FormData) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Analysis failed");
  }
  return res.json();
}

export async function generateContent(projectId: string) {
  const res = await fetch(`${API_BASE}/generate-content`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Content generation failed");
  }
  return res.json();
}

export async function generateCreative(projectId: string) {
  const res = await fetch(`${API_BASE}/generate-creative`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Creative generation failed");
  }
  return res.json();
}

export async function getProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function getProject(id: string) {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error("Project not found");
  return res.json();
}

export async function saveOutput(projectId: string, type: string, content: string, label: string) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, content, label }),
  });
  if (!res.ok) throw new Error("Failed to save");
  return res.json();
}
