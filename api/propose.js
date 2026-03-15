import { getClient, MODEL, PROMPTS } from "./_shared.js";

export const config = { api: { bodyParser: { sizeLimit: "25mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { pdf_base64 } = req.body;
    if (!pdf_base64) return res.status(400).json({ error: "pdf_base64 requis" });

    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: PROMPTS.propose,
      messages: [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf_base64 } },
          { type: "text", text: PROMPTS.proposeUser },
        ],
      }],
    });

    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    const data = JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim());
    res.json(data);
  } catch (err) {
    console.error("Propose error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
