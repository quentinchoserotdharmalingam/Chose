import { getClient, MODEL_FAST } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: "HTML requis" });

    const response = await getClient().messages.create({
      model: MODEL_FAST,
      max_tokens: 300,
      system: "Propose 4 améliorations de contenu statique (pas boutons/vidéos/liens). JSON uniquement: [\"s1\",\"s2\",\"s3\",\"s4\"]",
      messages: [{ role: "user", content: `HTML (extrait):\n${html.substring(0, 2000)}` }],
    });

    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    const suggestions = JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim());
    res.json({ suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 4) : [] });
  } catch (err) {
    console.error("Suggestions error:", err.message);
    res.json({
      suggestions: [
        "Rends le ton plus chaleureux",
        "Mets les chiffres plus en avant",
        "Ajoute une FAQ en bas de page",
        "Réorganise les sections",
      ],
    });
  }
}
