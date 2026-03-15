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

  generate: `HTML brut uniquement. CSS inline (style="..."). Emojis comme visuels.
INTERDIT : <html><head><body><script><style><link><img><a><button><form><input>, classes CSS, CTA, liens.
STYLE MINIMALISTE : max-width:750px, beaucoup d'espace blanc, peu de couleurs, typo clean (14px body, 24px titres max).
COMPACT : pas de commentaires, pas de lignes vides, CSS shorthand, 2 niveaux de div max.`,
};
