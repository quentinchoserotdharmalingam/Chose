const API_BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erreur ${res.status}`);
  }
  return res.json();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Step 1: Extract text from PDF via Mistral OCR (called from client)
 * Returns raw extracted text from all pages
 */
export async function extractPdfText(file) {
  const b64 = await fileToBase64(file);

  const res = await fetch("https://api.mistral.ai/v1/ocr", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${await getMistralKey()}`,
    },
    body: JSON.stringify({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        document_url: `data:application/pdf;base64,${b64}`,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Mistral OCR erreur ${res.status}`);
  }

  const data = await res.json();
  return (data.pages || [])
    .map((p) => p.markdown || "")
    .join("\n\n")
    .substring(0, 8000);
}

/** Fetch Mistral key from our backend (keeps it server-side) */
async function getMistralKey() {
  const { key } = await request("/mistral-key");
  return key;
}

export async function healthCheck() {
  return request("/health");
}

/**
 * Step 2: Analyze extracted text → { s, c, f[], _extracted_text }
 */
export async function analyzeText(extractedText) {
  return request("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extracted_text: extractedText }),
  });
}

/**
 * Step 3: Propose 6 pages from extracted text
 */
export async function proposePdf(extractedText) {
  return request("/propose", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ extracted_text: extractedText }),
  });
}

export async function generatePage({ prompt, context, company, color }) {
  return request("/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, context, company, color }),
  });
}

export async function modifyPage({ history, message }) {
  return request("/modify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ history, message }),
  });
}

export async function getSuggestions(html) {
  return request("/suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html }),
  });
}
