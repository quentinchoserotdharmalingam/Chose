import { getClient, MODEL, PROMPTS } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { prompt, context, company, color } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt requis" });

    const userPrompt = `${context || ""}

${prompt}
${company ? `Entreprise: "${company}".` : ""} Couleur: ${color || "#6366f1"}.

Génère une page d'onboarding COMPLÈTE, RICHE et BIEN DESIGNÉE pour un nouvel employé.
Utilise TOUTE la palette de composants CSS disponibles pour créer une page variée et engageante.
Adapte le nombre de sections au contenu (3 à 6 sections). Sois créatif avec les layouts.`;

    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: PROMPTS.generate,
      messages: [{ role: "user", content: userPrompt }],
    });

    let html = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    html = html.replace(/```html\n?|```\n?/g, "").trim();

    const openDivs = (html.match(/<div/gi) || []).length;
    const closeDivs = (html.match(/<\/div>/gi) || []).length;
    if (openDivs > closeDivs) html += "</div>".repeat(openDivs - closeDivs);

    res.json({ html });
  } catch (err) {
    console.error("Generate error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
