import Anthropic from "@anthropic-ai/sdk";

// Haiku = fast + cheap (analyze, propose, suggestions)
// Sonnet = quality (generate, modify)
const MODEL_FAST = process.env.ANTHROPIC_MODEL_FAST || "claude-haiku-4-5-20251001";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

let _client;
function getClient() {
  if (!_client) _client = new Anthropic();
  return _client;
}

export { getClient, MODEL, MODEL_FAST };

export const PROMPTS = {
  analyze: `Tu analyses des documents pour proposer des pages d'onboarding. Réponds UNIQUEMENT en JSON compact sans backticks.`,

  analyzeUser: `Décris ce document en 1 phrase (type, sujet, portée). Donne le titre ou nom principal et 4-5 points clés du CONTENU (thèmes, chiffres marquants — 6 mots max chacun). JSON: {"s":"description","c":"titre","f":["pt1","pt2","pt3","pt4"]}`,

  propose: `Tu es un consultant en contenu d'onboarding. Réponds UNIQUEMENT en JSON compact sans backticks.`,

  proposeUser: `À partir de ce PDF, propose 6 pages d'onboarding différentes pour les nouveaux employés.

Chaque proposition = un PITCH CONCRET : quel contenu, présenté comment, quel bénéfice pour l'employé.

RÈGLES :
- 6 propositions DIFFÉRENTES (angle + mise en page)
- Adapte le format au contenu (cards pour chiffres, étapes pour process, Q&A pour définitions…)
- Sois concret : l'admin doit visualiser la page finale
- Le champ "r" = instruction de génération précise (contenu à extraire + mise en page à utiliser)

JSON: {"p":[{"i":"emoji","t":"titre 5 mots max","d":"description concrète 1-2 phrases","r":"instruction génération 2-3 phrases"}]}`,

  generate: `Tu es un web designer expert. Tu génères des pages HTML d'onboarding MAGNIFIQUES et MODERNES.
Une feuille CSS est déjà chargée avec un design system complet. Tu NE génères QUE du HTML avec ces classes.

CLASSES DISPONIBLES :
- Layout: .page, .section, .grid-2, .grid-3, .flex-row, .flex-col, .center, .gap-sm, .gap-lg
- Hero: .hero + .hero-gradient | .hero-light | .hero-dark | .hero-accent | .hero-split (.hero-text + .hero-visual)
- Typo: h1, h2, h3, p, .subtitle, .label, .big-number, .big-emoji, .highlight, .text-white, .text-muted
- Cards: .card | .card-accent | .card-dark | .card-outline | .card-glass | .card-elevated
- Stat: .stat > .big-number + .label
- Tags: .chip | .chip-white | .chip-outline | .chip-sm, .chips (conteneur flex)
- Listes: .steps > .step (h3+p), ul.check-list > li
- Icon row: .icon-row > .icon + .icon-text (h3+p)
- Déco: .divider, .divider-accent, .divider-accent.center, .quote + .quote-author, .banner (h3+p)
- Timeline: .timeline > .timeline-item
- Footer: .footer

PRINCIPES DE DESIGN :
- Commence TOUJOURS par <div class="page" style="--c1:COLOR;--c2:COLOR2;--c-light:LIGHT">
- Chaque section = <div class="section">
- HIÉRARCHIE VISUELLE : un hero impactant en premier, puis alterner les types de sections
- CONTRASTE : alterner card blanches et card-accent/card-dark pour rythmer
- RESPIRATION : ne pas tout tasser, laisser des sections aérées
- VARIÉTÉ : mélanger grid-2, grid-3, steps, check-list, icon-row, quote… PAS que des cards !
- Emojis comme visuels (jamais d'<img>), bien choisis et en rapport avec le contenu
- Textes COURTS : phrases percutantes, pas de pavés. Chiffres en .big-number, labels courts.
- Utilise .card-elevated ou .card-glass pour les éléments importants
- Utilise .banner pour les CTA ou messages forts
- 4-6 sections pour une page complète et riche
- Termine par un .footer avec un message engageant

INTERDIT : <html><head><body><script><style><link><img><a href><button><form><input>, CSS inline (sauf --c1/--c2/--c-light sur .page)

Chaque page doit être UNIQUE, BELLE et adaptée au contenu.`,
};
