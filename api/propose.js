import { getClient, MODEL, PROMPTS } from "./_shared.js";

export const config = { api: { bodyParser: { sizeLimit: "25mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { extracted_text, pdf_base64 } = req.body;

    if (!extracted_text && !pdf_base64) {
      return res.status(400).json({ error: "extracted_text ou pdf_base64 requis" });
    }

    let messages;

    if (extracted_text) {
      // Use pre-extracted text from Mistral OCR (fast, fewer tokens)
      messages = [{
        role: "user",
        content: `Voici le contenu extrait d'un document PDF :\n\n${extracted_text}\n\n${PROMPTS.proposeUser}`,
      }];
    } else {
      // Fallback: send PDF base64 directly
      messages = [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf_base64 } },
          { type: "text", text: PROMPTS.proposeUser },
        ],
      }];
    }

    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: PROMPTS.propose,
      messages,
    });

    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    const data = JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim());
    res.json(data);
  } catch (err) {
    console.error("Propose error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
