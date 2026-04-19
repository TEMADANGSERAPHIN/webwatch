# WebWatch — Outil de Web Monitoring

Application Next.js 15 de surveillance de sites web avec scraping Firecrawl, stockage Redis et analyse IA (GPT-4o).

## Stack Technique
- **Frontend** : Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Lucide React
- **UI** : shadcn/ui, Framer Motion
- **Backend** : API Routes Next.js
- **Services** : Firecrawl (scraping), Upstash Redis (stockage), OpenAI GPT-4o (analyse)

## Installation Rapide

```bash
# 1. Cloner et installer les dépendances
npm install

# 2. Copier et remplir le fichier d'environnement
cp .env.example .env.local
# → Remplir les clés API (voir section ci-dessous)

# 3. Lancer en développement
npm run dev
```

## Variables d'Environnement (.env.local)

```env
# Firecrawl — https://firecrawl.dev
FIRECRAWL_API_KEY=fc-...

# OpenAI — https://platform.openai.com
OPENAI_API_KEY=sk-...

# Upstash Redis — https://upstash.com (console → Redis → REST API)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

## Déploiement Vercel

1. Pousser le code sur GitHub
2. Importer le dépôt sur vercel.com
3. Ajouter les 4 variables d'environnement dans Settings → Environment Variables
4. Déployer → URL automatique `*.vercel.app` ou domaine personnalisé

## Architecture des Données Redis

| Clé | Type | Contenu |
|-----|------|---------|
| `webwatch:urls` | Set | Ensemble des IDs d'URLs surveillées |
| `webwatch:meta:[id]` | Hash | url, label, createdAt, lastChecked, status |
| `webwatch:snap:[id]` | List | JSON des snapshots markdown (max 20) |
| `webwatch:changes:[id]` | List | JSON des changements détectés (max 50) |
