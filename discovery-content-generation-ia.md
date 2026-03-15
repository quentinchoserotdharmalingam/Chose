# [CONTENT] Génération de contenu IA depuis un PDF — Discovery

> **Projet** : CONTENT — Génération page HTML depuis un PDF/prompt
> **Porteur** : Quentin (Lead Product)
> **Statut** : 🔍 Discovery
> **Target** : Avril 2026
> **Priorité** : PRIO 2

---

## 1. Contexte produit

### Ce qui existe déjà dans HeyTeam

**Ressources dans un parcours d'intégration :**
Le gestionnaire RH configure un parcours pour l'enrollee avec différentes ressources : questionnaires, pièces administratives (PA), documents dynamiques (contrats…), challenges, et **documents PDF** consultables.

**Livret d'accueil 3.0 (existant) :**
- Mini-site interne configurable avec des **blocs prédéfinis**
- Personnalisé par filtres (équipe, contrat, site…)
- Moteur de recherche IA (OpenAI + contexte RH + documents internes)
- Éditeur TinyMCE pour la "page entreprise"

**Page entreprise (existant) :**
- Page libre éditable via TinyMCE
- Intégrée au livret d'accueil / parcours
- Aujourd'hui : 100% manuelle, le RH doit tout construire à la main

### Le problème

Le RH dispose souvent de contenus riches sur l'entreprise (PDF de présentation, plaquettes, pitch decks) mais :
1. **La transformation en contenu web est chronophage** → le RH copie-colle, reformate, perd du temps
2. **Le PDF brut est une expérience pauvre pour l'enrollee** → pas d'effet wahou, pas engageant
3. **Beaucoup de RH n'utilisent pas la page entreprise** → trop d'effort perçu pour un résultat moyen
4. **Le contenu n'est pas adapté à l'onboarding** → un PDF corporate n'est pas un livret d'accueil

### L'opportunité

Utiliser l'IA pour transformer un PDF source en contenu engageant et contextualisé pour l'onboarding, en quelques clics.

---

## 2. Exploration des cas d'usage

### Cas d'usage principaux identifiés

#### CU1 — PDF → Page entreprise (livret d'accueil)
**Le plus évident.** Le RH uploade sa plaquette corporate et obtient une page entreprise riche (hero, valeurs, chiffres, équipes…) prête pour TinyMCE.
- **Source** : PDF de présentation entreprise, rapport annuel, plaquette
- **Sortie** : HTML inline compatible TinyMCE
- **Persona** : Gestionnaire RH configurant un parcours
- **Moment** : Configuration initiale du parcours / mise à jour annuelle

#### CU2 — PDF → Mini-parcours d'onboarding
**Aller plus loin que la page unique.** Depuis un même PDF, générer **plusieurs contenus** adaptés à différentes étapes du parcours :
- Page "Bienvenue" (hero + présentation synthétique)
- Page "Notre culture" (valeurs, engagements, témoignages)
- Page "Ton équipe" (orga, contacts clés)
- Page "Tes avantages" (CE, mutuelle, télétravail, RTT…)
- Quiz "Connais-tu ton entreprise ?" (généré depuis les infos du PDF)

#### CU3 — PDF → Contenu enrichi de ressource
**Remplacer le PDF brut dans le parcours.** Au lieu de simplement mettre un PDF en consultation, transformer automatiquement ce PDF en page HTML enrichie que l'enrollee consulte à la place.
- Ex : Le "Guide IT" PDF → page interactive avec sections cliquables
- Ex : Le "Règlement intérieur" PDF → version digeste avec highlights

#### CU4 — PDF + Prompt → Contenu à la carte
**Le RH guide la génération.** Le PDF est la source de données, mais le RH peut demander un contenu spécifique :
- "Fais-moi un résumé en 5 points clés pour les nouveaux arrivants"
- "Génère un email de bienvenue basé sur ces infos"
- "Crée un quiz de 10 questions sur le contenu de ce document"
- "Extrais les infos pratiques (horaires, contacts, accès)"

#### CU5 — Multi-sources → Contenu fusionné
**Combiner plusieurs PDF/sources** pour générer un contenu unique :
- Plaquette corporate + rapport RSE + guide RH → livret d'accueil complet
- Organigramme + annuaire + valeurs → page "Ton équipe & ta culture"

---

## 3. Templates de contenu envisagés

L'idée : proposer au RH un choix de "templates" qui orientent la génération IA.

### 🏢 Présentation entreprise
- Hero avec nom, baseline, chiffres clés
- Histoire / timeline
- Valeurs et mission
- Implantations / carte
- **Bon pour** : CU1, source = plaquette corporate

### 👋 Page de bienvenue
- Message de bienvenue personnalisé
- Les 5 choses à savoir en arrivant
- Contacts clés (manager, RH, buddy)
- Checklist première semaine
- **Bon pour** : CU2, source = guide d'intégration

### 🌟 Culture & Valeurs
- Valeurs illustrées avec exemples concrets
- Témoignages collaborateurs (placeholders)
- Rituels d'équipe / traditions
- Engagements RSE
- **Bon pour** : CU2, source = plaquette + rapport RSE

### 🎁 Avantages & Vie pratique
- Avantages salariés (mutuelle, CE, tickets resto…)
- Politique de télétravail / flexibilité
- Infos pratiques (accès, parking, cantine…)
- Outils et accès IT
- **Bon pour** : CU3, source = guide RH / livret d'accueil PDF

### ❓ Quiz "Connais-tu ton entreprise ?"
- 5-10 questions générées depuis le contenu du PDF
- Format ludique type challenge
- **Bon pour** : CU4, source = n'importe quel PDF corporate

### 📧 Email de bienvenue
- Message structuré pour J-7, J-1, ou J+1
- Infos pratiques + liens utiles + ton chaleureux
- **Bon pour** : CU4, source = guide d'intégration

---

## 4. Réflexions produit

### Où s'intègre cette feature dans HeyTeam ?

**Option A — Dans l'éditeur de page entreprise (TinyMCE)**
- Bouton "✨ Générer depuis un PDF" dans la toolbar TinyMCE
- Le contenu généré est injecté directement dans l'éditeur
- Le RH peut ensuite modifier manuellement
- ✅ Simple, s'intègre dans l'existant
- ⚠️ Limité aux pages entreprise

**Option B — Comme nouvelle ressource "Page IA" dans le parcours**
- Nouveau type de ressource à côté de PDF, questionnaire, etc.
- Le RH uploade un PDF + choisit un template → génère une page
- L'enrollee voit une page HTML enrichie (pas un PDF)
- ✅ Peut remplacer les PDF bruts dans les parcours
- ⚠️ Nouveau type de ressource à développer côté back

**Option C — Dans le Livret d'accueil 3.0**
- Génération IA de blocs pour le livret depuis un PDF
- Cohérent avec le système de blocs existant
- ✅ S'inscrit dans le produit phare
- ⚠️ Dépend de l'architecture des blocs du livret

**Option D — Outil standalone (MVP actuel)**
- Interface séparée accessible depuis le back-office
- Génère du HTML que le RH copie-colle où il veut
- ✅ Le plus rapide à shipper
- ⚠️ Friction du copier-coller

### Recommandation — DÉCISION PRISE ✅

**MVP = Option B — Nouvelle ressource `ai_content`** (validé avec le dev IA le 13/03/2026)

Le type `ai_content` est une nouvelle ressource dans le parcours. Côté enrollee, le HTML est rendu via le renderer TinyMCE existant (déjà utilisé pour la page entreprise). Pas de nouveau développement front côté enrollee.

**Stratégie en 2 temps :**

| Phase | Quoi | Comment | Sortie `ai_content` |
|---|---|---|---|
| **MVP** | PDF existant → Page enrichie statique | Le RH transforme un PDF déjà présent dans son parcours en page HTML attractive | HTML statique (TinyMCE) |
| **V2 (cible)** | PDF existant → Module interactif / ramp-up | Même source, mais on génère des expériences interactives, personnalisées, agents IA | HTML interactif, quiz, agents… (format à explorer) |

**Principe clé MVP** : S'appuyer sur les documents déjà présents sur la plateforme (les "vieux PDFs") pour un effet wahou immédiat, zéro effort supplémentaire pour le RH.

**Vision V2** : Le `ai_content` devient un conteneur évolutif. En MVP il contient du HTML statique. En V2 il peut contenir des modules de formation interactifs, des parcours de lecture adaptatifs, des agents conversationnels spécialisés — tout cela généré depuis la même source PDF. L'innovation et l'interactivité maximale sont la cible, le format exact reste à explorer (agents IA, micro-learning, gamification…).

---

## 4b. Pipeline technique & Workflow

### Architecture pipeline (POC Sébastien, 13/03/2026)

Le dev IA (Sébastien) a réalisé un POC fonctionnel avec une approche en 2 étapes de traitement :

**Étape 1 — Extraction OCR** : Mistral OCR (API) pour extraire le contenu structuré du PDF. Performances excellentes pour le coût (~2$ / 1000 pages). Bien plus compétitif que les modèles vision pour l'extraction.

**Étape 2 — Génération HTML** : Un LLM (GPT-5.4 dans le POC, à valider le modèle final) transforme le contenu extrait en page HTML. Le modèle reçoit un "skill" de génération qui oriente le style du site.

Cette séparation OCR / Génération est plus robuste que l'envoi direct du PDF en base64 à un LLM (meilleure extraction, coût maîtrisé, possibilité de réutiliser le contenu extrait pour plusieurs générations).

### Workflow MVP en 6 étapes (V4 — mis à jour 13/03)

Changements clés par rapport à la V3 :
- **Les 6 propositions sont dynamiques** : l'IA invente 6 idées de pages spécifiques au PDF, pas un catalogue fixe avec score de pertinence. Les 6 doivent TOUTES être pertinentes.
- **Suggestions d'ajustement statiques uniquement** : pas de boutons d'action, pas de formulaires, pas de vidéos. Uniquement du contenu textuel, réorganisation, ton, design visuel.
- **Génération progressive** : barre de progression avec % + preview live qui se construit bloc par bloc pendant la génération.

```
ÉTAPE 1 — Upload
L'admin sélectionne un PDF existant dans son parcours
ou uploade un nouveau document
        │
        ▼
ÉTAPE 2 — Extraction OCR (automatique, ~2-5s)
Mistral OCR analyse le PDF et extrait :
- Texte structuré (titres, paragraphes, listes)
- Chiffres et données clés
- Métadonnées (nom entreprise, secteur…)
        │
        ▼
ÉTAPE 3 — Proposition dynamique par l'IA (~5-10s)
L'IA analyse le contenu extrait et INVENTE
6 idées de pages sur mesure pour ce PDF :
┌──────────────────────────────────────────┐
│ 📊 Ton document                         │
│ "Plaquette corporate Sodexo Live!       │
│  présentant le groupe, ses activités    │
│  et ses engagements RSE."              │
│                                         │
│ Entreprise : Sodexo Live!              │
│ Couleur : [●][●][●][●][●][●]          │
│                                         │
│ 6 idées de pages pour ton document :    │
│                                         │
│ → 🏢 Découvre Sodexo Live!             │
│   Hero, chiffres, valeurs, 6 métiers   │
│                                         │
│ → 🌍 Nos engagements RSE              │
│   Better Tomorrow, objectifs, progrès  │
│                                         │
│ → 🍽️ L'excellence culinaire            │
│   Chefs, restaurants étoilés, Lenôtre  │
│                                         │
│ → 🏟️ Nos lieux emblématiques           │
│   Stades, aéroports, culture, events   │
│                                         │
│ → 🏅 Paris 2024 : le goût de l'exploit│
│   Village olympique, chiffres, mobilisation│
│                                         │
│ → 📖 L'essentiel Sodexo en 5 minutes  │
│   Résumé, points clés, FAQ            │
│                                         │
│ Les 6 propositions sont toutes         │
│ pertinentes pour CE PDF spécifique.    │
│ Un clic = génération directe.          │
└──────────────────────────────────────────┘
        │
        ▼
ÉTAPE 4 — L'admin clique sur une proposition
→ La génération se lance immédiatement
(pas d'étape "customize" séparée,
le color picker est sur l'écran des propositions)
        │
        ▼
ÉTAPE 5 — Génération progressive (~15-30s)
┌──────────────────────────────────────────┐
│ Génération en cours…              72%   │
│ ████████████████░░░░░░░░                │
│ Sections principales (2/3)              │
│                                         │
│ ┌──────────────────────────────────────┐│
│ │                                      ││
│ │   [Preview HTML se construit         ││
│ │    bloc par bloc en live]            ││
│ │                                      ││
│ └──────────────────────────────────────┘│
└──────────────────────────────────────────┘
        │
        ▼
ÉTAPE 6 — Preview + Chat d'ajustement
L'admin voit l'aperçu final et peut affiner :
- 4 suggestions d'amélioration (STATIQUES uniquement)
  ✅ "Rends le ton plus chaleureux et tutoie le lecteur"
  ✅ "Mets les chiffres clés plus en avant"
  ✅ "Ajoute une FAQ en bas de page"
  ✅ "Restructure en mettant les valeurs avant les chiffres"
  ❌ PAS de "ajoute un bouton", "intègre une vidéo", etc.
- Chat libre pour ajustements manuels
- Bouton "Autre page" pour revenir aux 6 propositions
  (multi-génération depuis le même PDF sans ré-analyser)
- Bouton "Copier HTML" pour TinyMCE / ai_content
```

### Principes de design des propositions IA

| Principe | Détail |
|---|---|
| **Toujours 6 propositions** | L'IA génère exactement 6 idées, toutes pertinentes |
| **Jamais de catalogue fixe** | Les propositions sont inventées à partir du contenu réel du PDF |
| **Chaque proposition est unique** | Pas de doublons, chaque idée apporte une valeur distincte |
| **Prompt embarqué** | Chaque proposition contient son propre prompt de génération, spécifique au contenu |
| **Clic = génération** | Pas d'étape intermédiaire, le choix lance directement la génération |

### Contraintes sur les suggestions d'ajustement

Les 4 suggestions post-génération doivent rester dans le cadre d'une page HTML statique :

**Autorisé :**
- Modifier le texte, le ton, le tutoiement/vouvoiement
- Réorganiser les sections
- Ajouter du contenu textuel (FAQ, témoignages, citations)
- Changer les couleurs, la mise en forme, les icônes
- Mettre en avant certaines infos (chiffres, contacts)

**Interdit :**
- Boutons d'action (CTA cliquable, formulaire)
- Vidéos, iframes, médias embarqués
- Liens externes cliquables
- Éléments interactifs (accordéons, sliders)
- Scripts ou comportements dynamiques

### Questions ouvertes (mises à jour)

1. ~~Quel % de clients utilise activement la page entreprise aujourd'hui ?~~ → Moins pertinent, on se concentre sur CU3
2. **Quel % de parcours contient des ressources PDF ?** → À requêter en data pour quantifier le volume
3. ~~Le livret 3.0 a-t-il une API ?~~ → Pas nécessaire, on crée `ai_content` comme type autonome
4. **Faut-il gérer la mise à jour ? (le PDF source change → regénérer)** → Important pour le MVP : le `ai_content` garde-t-il une référence au PDF source ?
5. **Quid du multilingue ?** → Un PDF en français peut-il générer une page en anglais pour un enrollee international ?
6. **Schéma BDD du type `ai_content`** → À définir avec le dev IA : quels champs ? (html_content, source_pdf_id, template_used, generation_metadata…)

---

## 5. Deep-dive CU3 — Remplacer le PDF brut par du contenu enrichi

### Le constat

Aujourd'hui, quand un RH ajoute un document PDF dans un parcours d'intégration, l'enrollee voit… un PDF. Rendu souvent austère, non optimisé mobile, pas interactif, pas trackable (on ne sait pas si l'enrollee l'a vraiment lu ni jusqu'où).

C'est un gap énorme entre l'effort que HeyTeam met dans l'UX du parcours (app mobile, design soigné, challenges gamifiés) et l'expérience réelle de lecture d'un PDF corporate de 30 slides.

### Pourquoi le CU3 est le plus stratégique

1. **Volume** — Quasiment tous les parcours contiennent au moins 1 PDF. C'est le type de ressource le plus universel.
2. **Activation immédiate** — Pas besoin que le RH crée du contenu from scratch. Le contenu existe déjà (le PDF), on le transforme.
3. **Impact enrollee mesurable** — On peut comparer les taux de complétion PDF brut vs. page enrichie IA.
4. **Différenciation produit** — Aucun concurrent onboarding ne fait ça. L'effet wahou est direct.
5. **Porte d'entrée IA** — C'est une première expérience d'IA "magique" pour le RH, qui ouvre la porte aux autres CU.

### Sous-cas d'usage du CU3

#### CU3.1 — Présentation entreprise → Page d'accueil enrichie
- **Source** : Plaquette corporate, pitch deck, rapport annuel
- **Sortie** : Page entreprise riche (hero, chiffres, valeurs, histoire, équipes…)
- **Template** : "Découvre ton entreprise"
- **Fréquence** : 1 fois par entreprise, mise à jour ~1x/an
- **Valeur** : Effet wahou à l'arrivée, fierté d'appartenance

#### CU3.2 — Guide d'intégration → Checklist interactive
- **Source** : PDF "Guide du nouvel arrivant", "Kit de bienvenue"
- **Sortie** : Page structurée avec sections claires, liens cliquables, contacts, infos pratiques mises en avant
- **Template** : "Tes premiers pas"
- **Fréquence** : 1 fois par parcours/entité
- **Valeur** : L'enrollee trouve instantanément ce qu'il cherche vs. scroller 20 pages de PDF

#### CU3.3 — Politique / Règlement → Version digeste
- **Source** : Règlement intérieur, charte informatique, politique télétravail, charte éthique
- **Sortie** : Page aérée avec les points clés mis en avant, FAQ générée, "Ce qu'il faut retenir" en résumé
- **Template** : "L'essentiel à retenir"
- **Fréquence** : Plusieurs par parcours (souvent 3-5 docs de ce type)
- **Valeur** : L'enrollee lit VRAIMENT le contenu au lieu de scroller sans lire

#### CU3.4 — Organigramme / Annuaire → Page équipe visuelle
- **Source** : PDF organigramme, slide "Meet the team"
- **Sortie** : Page avec cards de membres d'équipe, structure visuelle, rôles, contacts
- **Template** : "Ton équipe"
- **Fréquence** : Par équipe / par site
- **Valeur** : Humaniser l'onboarding, l'enrollee met des visages sur des noms

#### CU3.5 — Catalogue avantages → Vitrine interactive
- **Source** : PDF CE, brochure mutuelle, guide avantages salariés
- **Sortie** : Page catégorisée (santé, loisirs, finance…) avec highlights et liens
- **Template** : "Tes avantages"
- **Fréquence** : 1 fois par entreprise
- **Valeur** : L'enrollee découvre des avantages qu'il n'aurait jamais lus dans un PDF

#### CU3.6 — Support de formation → Parcours de lecture
- **Source** : PDF de formation métier, process internes, guide outil
- **Sortie** : Page avec étapes numérotées, points clés, "À retenir" par section
- **Template** : "Formation express"
- **Fréquence** : Multiple par parcours métier
- **Valeur** : Meilleure rétention vs. PDF, pré-digéré par l'IA

### Templates proposés pour le MVP

| # | Template | Prompt orientation | Source type | Priorité MVP |
|---|---|---|---|---|
| T1 | 🏢 Découvre ton entreprise | Génère une page de présentation entreprise attractive avec hero, chiffres clés, valeurs, histoire, équipes. Ton : chaleureux, engageant, onboarding. | Plaquette, pitch deck | ✅ P0 |
| T2 | 📋 Tes premiers pas | Transforme ce guide en checklist interactive : regroupe par thème (administratif, IT, équipe, pratique), mets en avant les actions à faire, les contacts clés, les liens utiles. | Guide intégration | ✅ P0 |
| T3 | 📖 L'essentiel à retenir | Extrais les points clés de ce document. Génère un résumé structuré avec "Ce qu'il faut retenir" en haut, puis les points détaillés par thème. Ajoute une mini-FAQ. | Règlement, charte, politique | ✅ P1 |
| T4 | 🎁 Tes avantages | Présente les avantages sous forme de catalogue visuel par catégorie (santé, loisirs, finance, quotidien). Mets en avant les chiffres (montants, jours, etc.). | Guide avantages, PDF CE | P2 |
| T5 | 👥 Ton équipe | Crée des cards de présentation pour chaque personne/rôle mentionné. Affiche la structure d'équipe de façon visuelle. | Organigramme, annuaire | P2 |
| T6 | 🎓 Formation express | Transforme ce document de formation en parcours de lecture : numérote les étapes, mets en avant les points clés, ajoute des "À retenir". | Support formation | P3 |

### UX envisagée côté admin (RH)

```
┌─────────────────────────────────────────────────┐
│  Ajouter une ressource au parcours              │
│                                                 │
│  📄 Document PDF        (existant)              │
│  ✨ Page enrichie IA    (NOUVEAU)               │
│  📝 Questionnaire       (existant)              │
│  📑 Document dynamique  (existant)              │
│  🏆 Challenge           (existant)              │
│  ...                                            │
└─────────────────────────────────────────────────┘
         │
         ▼ (clic sur "Page enrichie IA")
┌─────────────────────────────────────────────────┐
│  Créer une page enrichie                        │
│                                                 │
│  1. Choisis un template                         │
│     ┌──────┐ ┌──────┐ ┌──────┐                 │
│     │🏢    │ │📋    │ │📖    │                 │
│     │Décou-│ │Tes   │ │L'es- │                 │
│     │vre   │ │1ers  │ │sen-  │                 │
│     │ton   │ │pas   │ │tiel  │                 │
│     │entre │ │      │ │      │                 │
│     │prise │ │      │ │      │                 │
│     └──────┘ └──────┘ └──────┘                 │
│                                                 │
│  2. Importe ton document source                 │
│     ┌───────────────────────────┐               │
│     │  📄 Dépose ton PDF ici    │               │
│     └───────────────────────────┘               │
│                                                 │
│  3. Personnalise (optionnel)                    │
│     Couleur : [●] Nom : [___________]           │
│                                                 │
│  [✨ Générer la page]                           │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│  Aperçu & ajustement                            │
│                                                 │
│  ┌─────────────────────────┐  ┌──────────────┐ │
│  │                         │  │ 💬 Ajuster   │ │
│  │    [Preview HTML]       │  │              │ │
│  │                         │  │ 💡 Suggestions│ │
│  │                         │  │ > Ajoute...  │ │
│  │                         │  │ > Change...  │ │
│  └─────────────────────────┘  └──────────────┘ │
│                                                 │
│  [Ajouter au parcours]  [Modifier encore]       │
└─────────────────────────────────────────────────┘
```

### UX envisagée côté enrollee

L'enrollee ne voit **aucune différence d'interface** avec les autres ressources du parcours. Il voit simplement une page HTML riche au lieu d'un PDF. Pas de mention "généré par IA".

La page enrichie est dans son parcours comme n'importe quelle autre ressource, avec :
- Un titre
- Un contenu HTML rendu (comme une page entreprise aujourd'hui)
- Un bouton "Marquer comme lu" (completion tracking)

### Questions techniques CU3

1. **Où stocker le HTML généré ?** → Comme une page entreprise (champ texte en BDD) ? Comme un nouveau type de ressource avec son propre modèle ?
2. **Le lien avec le PDF source est-il maintenu ?** → Si oui, on peut proposer "Regénérer" quand le PDF est mis à jour.
3. **Peut-on tracker la lecture plus finement que le PDF ?** → Scroll depth, temps passé, sections vues ?
4. **Taille max du HTML ?** → Un PDF de 50 pages peut générer un HTML très long. Faut-il paginer ?
5. **Quid des images du PDF ?** → En V1 : placeholders. En V2 : extraction OCR/images du PDF ?

### Métriques de succès CU3

| Métrique | Cible | Mesure |
|---|---|---|
| Taux d'adoption admin | >30% des admins actifs testent la feature dans les 3 mois | Analytics feature usage |
| Taux de complétion enrollee | +20% vs. PDF brut équivalent | Comparaison A/B par ressource |
| Temps de création admin | <5 min pour une page prête | Chrono UX test |
| NPS feature | >40 | Survey post-usage |
| Ratio remplacement PDF | >15% des PDF de parcours remplacés par des pages enrichies à 6 mois | Data analyse |

---

## 6. Prototype réalisé (13/03/2026)

### Artifact 1 — MVP React interactif (`heyteam-page-generator.jsx`)
- Upload PDF + personnalisation (nom entreprise, couleur)
- Génération HTML via API Claude Sonnet
- Preview live en iframe + chat d'ajustement type Lovable
- Suggestions automatiques post-génération (4 suggestions contextuelles)
- Navigation par onglets mobile-first (Aperçu / Ajuster / HTML)
- Bouton "Copier HTML" pour TinyMCE

### Artifact 2 — Exemple de rendu (`sodexo-live-page-tinymce.html`)
- Page Sodexo Live! générée depuis le PDF Melchior
- HTML 100% inline CSS, compatible TinyMCE
- Sections : hero, chiffres groupe, valeurs, Sodexo Live! chiffres, 6 univers métiers, excellence culinaire, marques, Paris 2024, RSE, CTA recrutement

---

## 7. Performance & Optimisations UX

### Problèmes identifiés lors des tests mobile (13/03)

**Problème 1 — Analyse trop longue (~15-30s)**
Dans le prototype, le PDF est envoyé en base64 à Claude pour analyse, ce qui est lent (gros payload tokens). En prod, Mistral OCR sera beaucoup plus rapide (~2-5s).

| Approche | Détail | Impact |
|---|---|---|
| **Prod : Mistral OCR** | Extraction rapide ~2-5s, coût ~2$/1000 pages | Résout le problème |
| **UX : Steps animées** | Afficher les étapes une par une avec animations (skeleton) : "Lecture du document…" → "Extraction du contenu…" → "Préparation des propositions…" | L'attente paraît plus courte |
| **UX : Résumé progressif** | Afficher le nom de l'entreprise détectée dès qu'il est disponible, avant que toutes les propositions soient prêtes | Feedback rapide |

**Problème 2 — Génération bloquée à 0%**
Le faux pourcentage ne progresse pas car `setInterval` et `await fetch()` coexistent mal dans le même thread JS. L'API Anthropic ne fait pas de streaming dans la sandbox artifact.

| Approche | Détail | Impact |
|---|---|---|
| **Prod : Streaming API** | Utiliser `stream: true` dans l'appel API pour recevoir le HTML token par token et construire le preview en live | Résolution complète — vrai rendu progressif |
| **Prototype : Fix timer** | Lancer le `setInterval` AVANT le `fetch` et le nettoyer après. Utiliser `requestAnimationFrame` ou un web worker | Fix partiel pour la démo |
| **UX : Étapes séquentielles** | Au lieu d'un % continu, afficher des étapes discrètes : "Création du hero…" → "Sections principales…" → "Détails et finitions…" → "Terminé !" avec un spinner par étape | Plus honnête que le faux % |
| **Prod : Génération par sections** | Faire N appels API (hero, corps, footer) au lieu d'un seul gros appel. Chaque section s'affiche dès qu'elle est prête | Vrai progressif, mais plus d'appels API |

### Recommandation pipeline de performance

```
PROTOTYPE (ce qu'on a aujourd'hui) :
PDF base64 ──────────────────────> Claude API (lent, 1 seul appel)
                                   ~15-30s analyse
                                   ~20-40s génération

PROD (cible avec pipeline Sébastien) :
PDF ──> Mistral OCR (~2-5s) ──> Texte structuré ──> LLM streaming (~10-15s)
        Extraction rapide         Léger en tokens      Rendu progressif live
```

Temps total estimé en prod : **~15-20s** (vs ~40-60s dans le prototype) avec un feedback visuel continu.

### Optimisations implémentées V5 (13/03)

4 leviers appliqués pour raccourcir drastiquement le temps dans le prototype :

| # | Levier | Avant | Après | Gain |
|---|---|---|---|---|
| 1 | **Extraction texte côté client** (pdf.js) au lieu d'envoyer le PDF base64 à l'API pour l'analyse | PDF base64 ~2Mo envoyé à l'API | Texte extrait localement en ~1-2s, seul le texte (~5Ko) envoyé | **-80% tokens analyse** |
| 2 | **Texte extrait pour la génération aussi** — le LLM reçoit du texte au lieu du PDF base64 | PDF renvoyé une 2ème fois pour la génération | Texte déjà extrait réutilisé | **-90% tokens génération** |
| 3 | **Timer de progression indépendant** — `setInterval` lancé AVANT le `fetch`, pas après | Timer bloqué à 0% pendant l'await | Progression fluide de 0 à 90% pendant l'appel API | **UX fix** |
| 4 | **Steps animées pour l'analyse** — checklist visuelle avec ✓ progressifs | Spinner seul pendant 15-30s | 3 étapes animées (Lecture → Analyse → Propositions) avec feedback visuel | **Attente perçue -50%** |

**Note :** Le levier "Haiku pour l'analyse" (modèle plus rapide) n'a pas pu être implémenté car l'API dans la sandbox artifact ne supporte pas tous les modèles. En prod avec le pipeline Sébastien, ce levier sera naturellement appliqué (Mistral OCR est ultra-rapide).

```
PROTOTYPE V5 (optimisé) :
PDF ──> pdf.js client (~1-2s) ──> Texte ──> Claude Sonnet (texte seul, ~8-12s)
        Extraction locale          ~5Ko       Beaucoup moins de tokens

vs V4 (avant) :
PDF base64 (~2Mo) ──────────────────────> Claude Sonnet (~15-30s par appel)
                                           PDF complet en tokens
```

Temps estimé V5 prototype : **~10-15s analyse + ~12-20s génération** (vs ~30-60s en V4)

---

## 8. Prochaines étapes

- [x] **Décision technique** — Nouveau type de ressource `ai_content` (validé avec dev IA)
- [x] **Décision renderer** — Réutilisation du renderer TinyMCE existant côté enrollee
- [x] **Décision pipeline** — Mistral OCR → LLM (POC Sébastien)
- [x] **Prototype V4** — Propositions dynamiques, suggestions statiques, génération progressive
- [x] **Prototype V5** — Optimisations perf : extraction texte client-side, timer indépendant, steps animées
- [x] **Prototype V7** — Multi-select, suggestions draft, fallback base64.
- [x] **Prototype V20-V23** — Refonte génération (1 appel unique, retry, repair HTML). Parallélisation analyse+reveal. Skeleton preview. Style minimaliste. **Limite des artifacts atteinte.**
- [ ] **🔴 PRIORITÉ : Aligner avec Sébastien** — Partager le flow V7 + specs UX pour intégration dans son pipeline Mistral OCR → LLM
- [ ] **Schéma BDD** — Définir les champs du modèle `ai_content` avec Sébastien
- [ ] **Tester sur pipeline prod** — Valider perf (<15-20s) et rendu avec vrais PDFs clients
- [ ] **Quantifier** — Requête data : combien de ressources PDF par parcours en moyenne ?
- [ ] **Validation CSM** — Demander à 2-3 CSM quels types de PDF les clients mettent dans leurs parcours
- [ ] **Définir les métriques** — Tracking comparatif PDF brut vs. page enrichie
- [ ] **Explorer V2 interactif** — Benchmark des formats innovants (agents, micro-learning, gamification)

---

## Changelog

| Date | Entrée |
|---|---|
| 13/03/2026 | Création du projet. Prototype MVP React + exemple Sodexo Live!. Specs V1 rédigées sur Notion. |
| 13/03/2026 | Passage en Discovery. Exploration des 5 CU. Deep-dive CU3. |
| 13/03/2026 | Décision : `ai_content`, renderer TinyMCE existant. Vision MVP statique → V2 interactif. |
| 13/03/2026 | POC Sébastien : Mistral OCR → GPT-5.4. |
| 13/03/2026 | **V4** — Propositions dynamiques, suggestions statiques, génération progressive. |
| 13/03/2026 | **Tests V4** — Analyse ~30s, génération bloquée 0%. |
| 13/03/2026 | **V5** — 4 optims perf : extraction texte client-side pdf.js (-90% tokens), timer indépendant (fix 0%), steps animées ✓. Temps proto : ~10-15s + ~12-20s (vs ~60s). |
| 13/03/2026 | **Tests V5** — Steps animées OK, analyse encore lente, génération bloquée ~90%, aperçu vide sur mobile (iframe). |
| 13/03/2026 | **V6** — Multi-sélection propositions avec fusion, suggestions en draft (pré-remplir sans envoyer), troncature agressive (~2000 chars). |
| 13/03/2026 | **Test V6** — pdf.js échoue sur PDF scannés/images (plaquettes corporate = souvent des slides en images, pas du texte). Erreur "Impossible d'extraire le texte". Besoin d'un fallback base64 fonctionnel. |
| 13/03/2026 | **V7** — Fix fallback base64 pour PDF scannés. Message "PDF image détecté". |
| 14/03/2026 | **V8-V9** — Analyse en 2 appels (résumé rapide + propositions), révélation progressive (titre → description → tags un par un), délais UX entre chaque info, génération section par section (5 appels), fix images cassées (interdit `<img>`), fix "entreprise détectée" → "document analysé", suggestions "Sélectionner" au lieu de "Cliquer". |
| 14/03/2026 | **V10** — Optimisation clé : la génération n'envoie **plus le PDF base64**. Seul le texte analysé (résumé + faits clés) est utilisé pour toutes les sections. Le PDF base64 ne sert que pour les 2 appels d'analyse. Résultat : sections 2-5 ~3-5s chacune au lieu de ~10-15s. Timer de progression par section. Historique chat aussi en texte pur. |
| 14/03/2026 | **V12** — 6 propositions. Timer crawl. Animation slide-up + trait lumineux. Auto-scroll. Suggestions "Sélectionner". |
| 14/03/2026 | **V13** — Skill webdesigner complet : règles layout, typographie, espacement, couleurs, responsive. |
| 14/03/2026 | **V14** — Vrais templates (format + structure + ton éditorial), skill webdesigner. Badge format sur chaque proposition. |
| 14/03/2026 | **V15** — Fix animation sections : appendChild au lieu de doc.write. Sections précédentes restent, nouvelle glisse. |
| 14/03/2026 | **V16** — Interdit CTA/boutons/liens dans le HTML généré. |
| 14/03/2026 | **V17** — Skill webdesigner assoupli : bonnes pratiques + liberté créative au lieu de règles rigides. |
| 14/03/2026 | **V18** — Réécriture du prompt de propositions. Ni formats fixes ni tout libre : chaque proposition est un **pitch concret** adapté au contenu du PDF. L'IA choisit le meilleur format POUR servir le contenu (cards pour des chiffres, Q&A pour un règlement, étapes pour un process…). Description concrète pour que l'admin visualise la page finale. Retrait du badge format abstrait. |
| 14/03/2026 | **V20-V23** — Refonte génération : 5 appels séquentiels → 1 seul appel (4000 tokens, style minimaliste). Retry auto (2 tentatives, backoff). Réparation HTML tronqué (fermeture divs manquantes). System prompt compacté (-70% tokens). Parallélisation appel propositions + reveal lent (~8s d'animation pendant l'API). Skeleton preview shimmer pendant la génération avec cards contextuelles (proposition choisie, source, points clés). Pulse animation ralenti (1s→2.5s). Timer progressif 0→95% calibré ~15s. |

### Bilan des prototypes (V1→V23)

**Ce qui est validé :**
- Flow 6 étapes : upload → analyse → templates dynamiques → choix (multi-select + fusion) → génération progressive → preview + chat
- **Templates = Format + Structure + Ton + Contenu** (pas juste des angles thématiques)
- 6 templates visuellement différents proposés par l'IA pour chaque PDF
- Multi-sélection avec fusion de propositions en une seule page
- Suggestions d'ajustement en mode draft (pré-remplir sans envoyer)
- Suggestions strictement statiques (pas de boutons, vidéos, formulaires)
- **Génération en 1 appel unique (4000 tokens, style minimaliste)** — retry auto (2 tentatives), réparation HTML tronqué
- Analyse en 2 appels **parallélisés** : résumé (~5-8s) puis propositions lancées en parallèle du reveal lent (~8s d'animation)
- Steps animées pendant l'analyse (checklist 4 étapes ✓) + révélation progressive lente (titre → résumé → facts un par un)
- Skeleton preview shimmer pendant la génération + cards contextuelles (proposition choisie, source, points clés)
- Timer de progression 0→95% calibré ~15s
- Design light mobile-first avec tabs (Aperçu / Ajuster / HTML)
- Pas de balises `<img>` (remplacées par emojis + divs colorés)
- System prompt compact (-70% tokens vs V10)

**Bugs corrigés en cours de route :**
- PDF scannés/images : fallback base64 (V7)
- JSON tronqué : réduction à 4 propositions + JSON repair (V8)
- Progression bloquée : timer par section au lieu d'un timer global (V9-V10)
- Images cassées : interdit `<img>` (V9)
- "Entreprise détectée" → "Document analysé" (V9)
- Génération lente : texte analysé au lieu de PDF base64 pour toutes les sections (V10)
- Génération bloquée/coupée : 5 appels séquentiels fragiles → 1 appel unique robuste (V20-V23)

**Architecture pipeline finale (prototype V23) :**
```
PDF ──> base64 ──> Appel 1: Résumé + faits clés (~5-8s)
                            │
                   ┌────────┴────────┐
                   │  EN PARALLÈLE   │
                   ▼                 ▼
         Reveal lent (~8s)    Appel 2: 6 propositions
         titre → résumé       (~8-12s, masqué par reveal)
         → facts un par un
                   │
                   ▼
         Appel 3: Génération page complète (1 appel, 4000 tokens, ~10-15s)
                  Skeleton shimmer + cards contextuelles pendant l'attente
                  → page minimaliste HTML inline
```

**Ce qui nécessite le pipeline prod (Sébastien) :**
- Extraction OCR fiable (Mistral OCR) remplace le base64 pour l'analyse aussi
- Streaming API pour vrai rendu progressif continu au sein de chaque section
- Performance cible : <15s total avec OCR + streaming
