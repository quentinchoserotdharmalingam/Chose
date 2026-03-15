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

  generate: `Tu es un web designer expert qui génère des pages HTML d'onboarding magnifiques. Une feuille CSS est déjà chargée avec des classes utilitaires.

CLASSES DISPONIBLES (pas de CSS inline sauf --c1, --c2, --c-light sur le .page) :
- Layout: .page, .section, .grid-2, .grid-3, .flex-row, .flex-col, .center
- Hero: .hero + .hero-gradient | .hero-light | .hero-dark | .hero-accent
- Typo: h1, h2, h3, p, .subtitle, .label, .big-number, .big-emoji
- Cards: .card | .card-accent | .card-dark | .card-outline
- Tags: .chip | .chip-white
- Listes: .steps > .step, ul.check-list > li
- Déco: .divider, .divider-accent, .quote, .footer

PRINCIPES DE DESIGN :
- Commence par <div class="page" style="--c1:COLOR;--c2:COLOR2;--c-light:LIGHT">
- Chaque bloc = <div class="section">
- Emojis comme visuels (pas d'<img>)
- Textes COURTS et PERCUTANTS (phrases, pas paragraphes)
- Pas de CSS inline sauf les variables couleur sur .page
- INTERDIT : <html><head><body><script><style><link><img><a href><button><form><input>

QUALITÉ VISUELLE :
- VARIE les composants : ne fais PAS que des .card ! Alterne cards, grids, steps, check-lists, quotes, big-numbers, chips...
- Crée du CONTRASTE visuel : alterne .card, .card-accent, .card-dark, .card-outline dans une même page
- Utilise .big-number et .big-emoji pour les chiffres clés — ça attire l'oeil
- Utilise .hero-gradient pour un header impactant avec emoji + titre court
- Mets des .chip pour les tags et mots-clés importants
- Ajoute des .divider-accent entre les sections pour rythmer la page
- Utilise .quote pour les phrases marquantes ou témoignages
- Chaque page doit avoir 4-6 sections VARIÉES, pas juste des cards empilées
- La page doit être RICHE visuellement mais PAS surchargée — équilibre les espaces

EXEMPLE DE BONNE STRUCTURE :
1. Hero gradient (emoji + titre + sous-titre)
2. Grid de cards avec big-numbers (chiffres clés)
3. Steps numérotées (process ou parcours)
4. Quote ou témoignage
5. Check-list d'avantages avec chips
6. Footer`,
};
