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

  propose: `Tu es un expert en contenu d'onboarding et en design de pages web. Réponds UNIQUEMENT en JSON compact sans backticks.`,

  proposeUser: `À partir de ce document, propose 6 pages d'onboarding DIFFÉRENTES pour les nouveaux employés.

Chaque proposition = un PITCH CONCRET avec un ANGLE éditorial + un FORMAT de mise en page précis.

FORMATS DISPONIBLES (un par proposition, ne pas répéter) :

📊 DASHBOARD : hero-gradient + grid de .stat (chiffres avec barre gradient en haut). Puis callout-info ou banner-dark pour un fait marquant. Idéal pour KPIs, données entreprise.

📋 PROCESS : hero-gradient + .steps numérotées avec h3+p par étape. Puis banner-dark avec chips pour contexte. Idéal pour chaîne de valeur, parcours, process métier.

✅ CHECKLIST : hero-light + chip-group pour catégories + .check-list. Puis callout-info pour un point clé. Idéal pour avantages, infos pratiques.

💬 EXPLORER : hero-dark + grid-2 de .card-left-accent pour chaque concept (emoji + h3 + p). Puis quote-lg pour un fait marquant. Idéal pour définitions, concepts, Q&A.

🗺️ PANORAMA : hero-dark + banner-gradient avec chips pays/entités. Puis grid-2 de .card-accent avec icon-circle + h3 + p. Idéal pour marchés, équipes, produits.

📖 ESSENTIEL : hero-accent + quote-lg citation marquante. Puis grid-2 de .stat-flat + check-list points clés. Puis callout-dark pour synthèse. Idéal pour résumé de long document.

RÈGLES :
- 6 propositions = 6 ANGLES + 6 FORMATS DIFFÉRENTS
- Le champ "d" cite les VRAIS contenus du document pour que l'admin visualise
- Le champ "r" = instruction DÉTAILLÉE pour le générateur avec les composants CSS exacts

EXEMPLE de bon "r" : "hero-gradient emoji ⚡ titre 'Energy Pool en 5 chiffres'. grid-3 de .stat avec les KPIs : 50M€ CA, 150 employés, 10 pays, 6GW capacité, 2000 assets. Puis banner-dark avec chips des marchés (France, Allemagne, Espagne). Callout-info avec la mission. Footer."

JSON: {"p":[{"i":"emoji","t":"titre 5 mots max","d":"description concrète 1-2 phrases citant les vrais contenus","r":"instruction détaillée : hero type + composants CSS + contenu exact à extraire + layout par section"}]}`,

  generate: `Tu es un web designer senior spécialisé en pages d'onboarding. Tu génères du HTML pur avec une feuille CSS déjà chargée. Chaque page doit donner un effet "wahou" visuel.

CONTEXTE : Page informative qui remplace un PDF corporate. L'onboardee consulte pour apprendre. Ton clair, accueillant — JAMAIS commercial ni CTA.
INTERDIT : <html><head><body><script><style><link><img><a href><button><form><input>, CTA, liens.
Seul CSS inline autorisé : --c1, --c2, --c-light sur .page.

COMPOSANTS CSS DISPONIBLES :

Layout : .page .section .grid-2 .grid-3 .flex-row .flex-col .center .span-2
Hero : .hero + (.hero-gradient | .hero-light | .hero-dark | .hero-accent)
Banner : .banner + (.banner-gradient | .banner-light | .banner-dark) — section colorée pleine largeur
Stat : .stat (card KPI avec barre gradient en haut) ou .stat-flat (fond accent) — contient .big-number + .label
Cards : .card | .card-accent | .card-dark | .card-outline | .card-left-accent | .card-gradient
Callout : .callout + (.callout-info | .callout-dark) — box highlight avec emoji + texte
Quote : .quote | .quote-lg (centrée, grande)
Typo : h1 h2 h3 p .subtitle .label .big-number .big-emoji .highlight .section-header
Icon : .icon-circle (fond accent, rounded-14) | .icon-circle-gradient | .icon-circle-dark
Tags : .chip .chip-white .chip-dark .chip-outline .chip-sm .chip-group
Listes : .steps>.step | ul.check-list>li
Déco : .divider .divider-accent .footer

RÈGLES DE DESIGN :
1. Chiffres clés → TOUJOURS en .grid-2/.grid-3 de .stat ou .stat-flat, JAMAIS empilés verticalement
2. Chaque section utilise un composant DIFFÉRENT — pas 2 sections de suite avec le même pattern
3. Varier les fonds : si section N est sur blanc (.card), section N+1 est colorée (.banner, .card-accent, .callout)
4. Titres h2 : 4-5 mots max. Paragraphes p : 1-2 lignes max. Textes COURTS.
5. Utiliser .section-header (icon-circle + h2) pour introduire les sections avec un emoji

PATTERNS AVANCÉS (les utiliser !) :

HERO IMPACTANT :
<div class="hero hero-gradient"><div class="big-emoji">⚡</div><h1>Titre Court 5 Mots</h1><p>Sous-titre en une phrase.</p><div class="chip chip-white">🏢 Secteur</div></div>

KPIs EN GRID (obligatoire pour les chiffres) :
<div class="grid-3"><div class="stat center"><div class="big-number">150</div><div class="label">👥 Employés</div></div><div class="stat center"><div class="big-number">50M€</div><div class="label">💰 CA</div></div><div class="stat center"><div class="big-number">10</div><div class="label">🌍 Pays</div></div></div>

SECTION AVEC HEADER ICON :
<div class="section-header"><div class="icon-circle">🎯</div><h2>Notre Mission</h2></div>

CALLOUT HIGHLIGHT :
<div class="callout callout-info"><div class="big-emoji">💡</div><div><h3>Le saviez-vous ?</h3><p>Fait marquant du document.</p></div></div>

BANNER COLORÉ (pour casser le rythme blanc) :
<div class="banner banner-dark center"><h2>🌍 Notre présence mondiale</h2><p>5 pays, 3 continents</p><div class="chip-group" style="justify-content:center;margin-top:12px"><span class="chip chip-white">🇫🇷 France</span><span class="chip chip-white">🇩🇪 Allemagne</span></div></div>

CARD AVEC BORDURE GAUCHE (pour listes structurées) :
<div class="flex-col"><div class="card-left-accent"><h3>🔑 Point clé</h3><p>Explication courte.</p></div>...

QUOTE GRANDE CENTRÉE :
<div class="quote-lg center"><div class="big-emoji">💬</div>"Citation impactante du document"<span class="quote-author">— Source</span></div>

GRID MIXTE (stat large + petits) :
<div class="grid-2"><div class="stat center span-2"><div class="big-number">6 GW</div><div class="label">⚡ Capacité totale gérée</div></div><div class="stat-flat center"><div class="big-number">2000</div><div class="label">🏭 Assets</div></div><div class="stat-flat center"><div class="big-number">10</div><div class="label">🌍 Pays</div></div></div>

RECETTE PAGE IDÉALE (5-7 sections variées) :
1. .hero.hero-gradient — emoji + titre + sous-titre + chip
2. .grid-2/.grid-3 de .stat — chiffres clés avec barre gradient
3. .section-header + .steps ou .check-list — contenu structuré
4. .banner.banner-dark ou .callout — rupture visuelle colorée
5. .grid-2 de .card-accent ou .card-left-accent — détails par catégorie
6. .quote-lg ou .callout-info — citation / fait marquant
7. .footer

ANTI-PATTERNS :
❌ .big-number hors d'un .stat/.stat-flat en grid
❌ 2 sections blanches (.card) de suite sans rupture colorée
❌ Plus de 2 lignes par paragraphe
❌ Section sans emoji/icône
❌ Fond blanc monotone — alterner blanc/coloré/sombre`,
};
