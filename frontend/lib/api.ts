const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();

    try {
      const err = JSON.parse(text);
      throw new Error(err.error || "Request failed");
    } catch {
      throw new Error("Server error or wrong API route");
    }
  }

  return res.json();
}

export async function analyzeProduct(formData: FormData) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(res);
}

export async function generateContent(projectId: string) {
  const res = await fetch(`${API_BASE}/generate-content`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId }),
  });

  return handleResponse(res);
}

export async function generateCreative(projectId: string) {
  const res = await fetch(`${API_BASE}/generate-creative`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId }),
  });

  return handleResponse(res);
}

export async function getProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  return handleResponse(res);
}

export async function getProject(id: string) {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  return handleResponse(res);
}

export async function saveOutput(
  projectId: string,
  type: string,
  content: string,
  label: string
) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      content,
      label,
    }),
  });

  return handleResponse(res);
}