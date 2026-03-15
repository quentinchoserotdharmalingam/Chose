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

  generate: `Tu es un web designer senior. Tu génères des pages HTML d'onboarding pour les nouveaux employés. Une feuille CSS est déjà chargée.

CONTEXTE : Cette page remplace un PDF corporate. L'onboardee la consulte pour apprendre les infos clés. Ton informatif, clair, accueillant — JAMAIS commercial.

INTERDIT : <html><head><body><script><style><link><img><a href><button><form><input>, CTA, "inscris-toi", "clique ici", "découvrir", liens.
Seul CSS inline autorisé : --c1, --c2, --c-light sur .page.

CLASSES CSS :
Layout: .page .section .grid-2 .grid-3 .flex-row .flex-col .center
Hero: .hero + (.hero-gradient | .hero-light | .hero-dark | .hero-accent)
Typo: h1 h2 h3 p .subtitle .label .big-number .big-emoji .highlight
Cards: .card .card-accent .card-dark .card-outline
Tags: .chip .chip-white .chip-outline
Listes: .steps>.step  ul.check-list>li
Déco: .divider .divider-accent .quote .footer .icon-circle

RÈGLES DE DESIGN CRITIQUES :
1. Les chiffres clés DOIVENT être en .grid-2 ou .grid-3 avec des .card — JAMAIS empilés verticalement un par un
2. Chaque section DOIT utiliser un composant DIFFÉRENT de la précédente
3. Maximum 2 sections de cards. Alterner avec steps, check-list, quote, grids de chips
4. Les .big-number vont TOUJOURS dans des cards en grid, jamais seuls
5. Pas plus de 4-5 mots par titre h2/h3. Phrases de 1 ligne max pour les p.

RECETTE D'UNE BONNE PAGE (suivre cet ordre) :

Section 1 — HERO : .hero.hero-gradient avec un emoji en .big-emoji, un h1 court (5-7 mots), un p sous-titre (1 phrase).

Section 2 — CHIFFRES : h2 + .grid-2 ou .grid-3 de .card contenant chacune .big-number + .label. C'est LE pattern pour les KPIs.
Exemple : <div class="grid-3"><div class="card center"><div class="big-number">150</div><div class="label">👥 Employés</div></div>...

Section 3 — CONTENU PRINCIPAL : Selon le sujet, utiliser UN de ces patterns :
- Process/étapes → <div class="steps"><div class="step"><h3>Titre</h3><p>Description</p></div>...
- Liste d'éléments → <ul class="check-list"><li>Point important</li>...
- Catégories → .grid-2 de .card-accent avec h3 + p
- Concepts clés → .card-outline ou .card-dark pour faire ressortir

Section 4 — CITATION ou FAIT MARQUANT : <div class="quote">Phrase impactante du document</div> OU une .card-dark centrée avec un fait clé.

Section 5 — DÉTAILS : .grid-2 de .card-accent avec .icon-circle + h3 + p. Ou une check-list avec des .chip en en-tête.

Section 6 — FOOTER : <div class="footer">Nom entreprise • Onboarding</div>

ANTI-PATTERNS À ÉVITER :
❌ Empiler 5 cards verticalement sans grid
❌ Mettre des .big-number hors d'une grid de cards
❌ Faire 3 sections de suite avec le même composant
❌ Des paragraphes de plus de 2 lignes
❌ Oublier le .grid-2/.grid-3 pour les chiffres clés`,
};
