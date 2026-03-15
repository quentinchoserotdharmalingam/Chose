import { getClient, MODEL_FAST, PROMPTS } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { extracted_text } = req.body;
    if (!extracted_text) return res.status(400).json({ error: "extracted_text requis" });

    // Run analyze + propose in PARALLEL on the SAME serverless function (1 cold start)
    const [analyzeRes, proposeRes] = await Promise.all([
      getClient().messages.create({
        model: MODEL_FAST,
        max_tokens: 400,
        system: PROMPTS.analyze,
        messages: [{
          role: "user",
          content: `Voici le contenu extrait d'un document PDF :\n\n${extracted_text}\n\n${PROMPTS.analyzeUser}`,
        }],
      }),
      getClient().messages.create({
        model: MODEL_FAST,
        max_tokens: 2000,
        system: PROMPTS.propose,
        messages: [{
          role: "user",
          content: `Voici le contenu extrait d'un document PDF :\n\n${extracted_text}\n\n${PROMPTS.proposeUser}`,
        }],
      }),
    ]);

    const analyzeText = analyzeRes.content.filter(b => b.type === "text").map(b => b.text).join("");
    const analysis = JSON.parse(analyzeText.replace(/```json\n?|```\n?/g, "").trim());

    const proposeText = proposeRes.content.filter(b => b.type === "text").map(b => b.text).join("");
    const proposals = JSON.parse(proposeText.replace(/```json\n?|```\n?/g, "").trim());

    res.json({ analysis, proposals });
  } catch (err) {
    console.error("Analyze+Propose error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
