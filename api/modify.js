import { getClient, MODEL, PROMPTS } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { history, message } = req.body;
    if (!history || !message) return res.status(400).json({ error: "History et message requis" });

    const messages = [...history, { role: "user", content: message }];

    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: PROMPTS.generate + "\nApplique les modifications. HTML complet, même style minimaliste.",
      messages,
    });

    let html = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    html = html.replace(/```html\n?|```\n?/g, "").trim();

    res.json({ html });
  } catch (err) {
    console.error("Modify error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
