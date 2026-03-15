import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import Anthropic from "@anthropic-ai/sdk";
import { PROMPTS } from "./prompts.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const PORT = process.env.PORT || 3001;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("❌ ANTHROPIC_API_KEY manquante. Copie .env.example → .env et ajoute ta clé.");
  process.exit(1);
}

const anthropic = new Anthropic();

app.use(cors());
app.use(express.json({ limit: "25mb" }));

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok", model: MODEL }));

// ── STEP 1: Analyze PDF → summary + facts ──
app.post("/api/analyze", upload.single("pdf"), async (req, res) => {
  try {
    const pdfB64 = req.file
      ? req.file.buffer.toString("base64")
      : req.body.pdf_base64;

    if (!pdfB64) return res.status(400).json({ error: "PDF requis (fichier ou base64)" });

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: PROMPTS.analyze,
      messages: [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfB64 } },
          { type: "text", text: PROMPTS.analyzeUser },
        ],
      }],
    });

    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    const data = JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim());
    res.json(data);
  } catch (err) {
    console.error("Analyze error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── STEP 2: Propose 6 pages from PDF ──
app.post("/api/propose", upload.single("pdf"), async (req, res) => {
  try {
    const pdfB64 = req.file
      ? req.file.buffer.toString("base64")
      : req.body.pdf_base64;

    if (!pdfB64) return res.status(400).json({ error: "PDF requis" });

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: PROMPTS.propose,
      messages: [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdfB64 } },
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
});

// ── STEP 3: Generate HTML page ──
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, context, company, color } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt requis" });

    const userPrompt = `${context || ""}

${prompt}
${company ? `Entreprise: "${company}".` : ""} Couleur: ${color || "#6366f1"}.

Page MINIMALISTE et ÉLÉGANTE pour un nouvel employé :
- 1 hero (gradient + emoji + titre + 1 phrase)
- 2 sections courtes (chiffres en gros, textes en 1-2 lignes, cards simples)
- 1 footer (1 ligne)

Chaque section = 1 div. Textes TRÈS COURTS (phrases, pas paragraphes). Beaucoup d'espace blanc.`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: PROMPTS.generate,
      messages: [{ role: "user", content: userPrompt }],
    });

    let html = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    html = html.replace(/```html\n?|```\n?/g, "").trim();

    // Repair truncated HTML
    const openDivs = (html.match(/<div/gi) || []).length;
    const closeDivs = (html.match(/<\/div>/gi) || []).length;
    if (openDivs > closeDivs) html += "</div>".repeat(openDivs - closeDivs);

    res.json({ html });
  } catch (err) {
    console.error("Generate error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── STEP 4: Modify existing HTML via chat ──
app.post("/api/modify", async (req, res) => {
  try {
    const { history, message } = req.body;
    if (!history || !message) return res.status(400).json({ error: "History et message requis" });

    const messages = [...history, { role: "user", content: message }];

    const response = await anthropic.messages.create({
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
});

// ── STEP 5: Get suggestions for HTML ──
app.post("/api/suggestions", async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) return res.status(400).json({ error: "HTML requis" });

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      system: "Propose 4 améliorations de contenu statique (pas boutons/vidéos/liens). JSON uniquement: [\"s1\",\"s2\",\"s3\",\"s4\"]",
      messages: [{ role: "user", content: `HTML (extrait):\n${html.substring(0, 2000)}` }],
    });

    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
    const suggestions = JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim());
    res.json({ suggestions: Array.isArray(suggestions) ? suggestions.slice(0, 4) : [] });
  } catch (err) {
    console.error("Suggestions error:", err.message);
    res.json({ suggestions: [
      "Rends le ton plus chaleureux",
      "Mets les chiffres plus en avant",
      "Ajoute une FAQ en bas de page",
      "Réorganise les sections",
    ]});
  }
});

app.listen(PORT, () => {
  console.log(`🚀 POC pdf IA API → http://localhost:${PORT}`);
  console.log(`   Modèle: ${MODEL}`);
});
