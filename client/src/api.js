const API_BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

export async function healthCheck() {
  return request("/health");
}

/**
 * Analyze PDF → { s: summary, c: company, f: [facts] }
 */
export async function analyzePdf(file) {
  const form = new FormData();
  form.append("pdf", file);
  return request("/analyze", { method: "POST", body: form });
}

/**
 * Propose 6 pages → { p: [{ i, t, d, r }] }
 */
export async function proposePdf(file) {
  const form = new FormData();
  form.append("pdf", file);
  return request("/propose", { method: "POST", body: form });
}

/**
 * Generate HTML page → { html }
 */
export async function generatePage({ prompt, context, company, color }) {
  return request("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, context, company, color }),
  });
}

/**
 * Modify HTML via chat → { html }
 */
export async function modifyPage({ history, message }) {
  return request("/modify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history, message }),
  });
}

/**
 * Get suggestions → { suggestions: [str] }
 */
export async function getSuggestions(html) {
  return request("/suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html }),
  });
}
