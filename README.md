# HeyTeam PageGen — Prototype

Transforme un PDF corporate en page d'onboarding HTML attractive via l'IA.

## Architecture

```
client/          → Frontend React (Vite)
  src/App.jsx    → Composant principal (upload, analyse, propositions, preview, chat)
  src/api.js     → Client API backend
server/          → Backend Express
  index.js       → API REST (analyze, propose, generate, modify, suggestions)
  prompts.js     → System prompts Anthropic
docs/            → Specs et maquettes originales
```

## Lancement rapide

```bash
# 1. Installer les dépendances
npm run install:all

# 2. Configurer la clé API
cp server/.env.example server/.env
# Editer server/.env avec ta clé ANTHROPIC_API_KEY

# 3. Lancer (frontend + backend)
npm run dev
```

- Frontend : http://localhost:5173
- Backend API : http://localhost:3001

## Endpoints API

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/analyze` | PDF → résumé + faits clés |
| POST | `/api/propose` | PDF → 6 propositions de pages |
| POST | `/api/generate` | Prompt → HTML page |
| POST | `/api/modify` | Chat → HTML modifié |
| POST | `/api/suggestions` | HTML → 4 suggestions |

## Flow utilisateur

1. **Upload** — L'admin dépose un PDF
2. **Analyse** — L'IA extrait le contenu et propose 6 pages
3. **Sélection** — L'admin choisit 1 ou plusieurs propositions
4. **Génération** — Page HTML minimaliste générée
5. **Ajustement** — Chat pour modifier le résultat
6. **Export** — Copier le HTML pour TinyMCE / ai_content

## Stack technique

- **Frontend** : React 19, Vite
- **Backend** : Express, Anthropic SDK
- **IA** : Claude Sonnet (analyse, propositions, génération, suggestions)
- **Pipeline cible (prod)** : Mistral OCR → LLM streaming
