import { getClient, MODEL, PROMPTS } from "./_shared.js";

export const config = { api: { bodyParser: { sizeLimit: "25mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { pdf_base64 } = req.body;
    if (!pdf_base64) return res.status(400).json({ error: "pdf_base64 requis" });

    // Step 1: Mistral OCR extracts structured text from PDF
    const ocrResult = await fetch("https://api.mistral.ai/v1/ocr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          document_url: `data:application/pdf;base64,${pdf_base64}`,
        },
      }),
    });

    if (!ocrResult.ok) {
      const err = await ocrResult.json().catch(() => ({}));
      throw new Error(`Mistral OCR error: ${err.message || ocrResult.status}`);
    }

    const ocr = await ocrResult.json();

    // Extract text from OCR pages
    const extractedText = (ocr.pages || [])
      .map((p) => p.markdown || "")
      .join("\n\n")
      .substring(0, 8000); // Limit to ~8k chars

    // Step 2: Claude analyzes the extracted text (much faster, no PDF base64)
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 400,
      system: PROMPTS.analyze,
      messages: [{
        role: "user",
        content: `Voici le contenu extrait d'un document PDF :\n\n${extractedText}\n\n${PROMPTS.analyzeUser}`,
      }],
    });

    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    const data = JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim());

    // Return analysis + extracted text for reuse in propose/generate
    res.json({ ...data, _extracted_text: extractedText });
  } catch (err) {
    console.error("Analyze error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
