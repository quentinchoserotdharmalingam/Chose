import { getClient, MODEL_FAST, PROMPTS } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { extracted_text } = req.body;
    if (!extracted_text) return res.status(400).json({ error: "extracted_text requis" });

    // Claude analyzes the text extracted by Mistral OCR (client-side)
    const response = await getClient().messages.create({
      model: MODEL_FAST,
      max_tokens: 400,
      system: PROMPTS.analyze,
      messages: [{
        role: "user",
        content: `Voici le contenu extrait d'un document PDF :\n\n${extracted_text}\n\n${PROMPTS.analyzeUser}`,
      }],
    });

    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    const data = JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim());

    res.json(data);
  } catch (err) {
    console.error("Analyze error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
