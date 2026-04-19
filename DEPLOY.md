# Guide de Déploiement — WebWatch

## Prérequis : Créer les services externes

### 1. Upstash Redis (gratuit)
1. Aller sur https://console.upstash.com
2. Créer une base de données Redis
3. Copier **REST URL** et **REST Token** depuis l'onglet "REST API"

### 2. Firecrawl (clé API)
1. Aller sur https://firecrawl.dev
2. Créer un compte → Dashboard → API Keys
3. Créer une clé et la copier

### 3. OpenAI (clé API)
1. Aller sur https://platform.openai.com/api-keys
2. Créer une nouvelle clé secrète
3. S'assurer d'avoir du crédit disponible (GPT-4o est payant)

---

## Déploiement sur Vercel

### Étape 1 — Pousser le code sur GitHub
```bash
git init
git add .
git commit -m "feat: WebWatch initial commit"
git remote add origin https://github.com/VOTRE_USERNAME/webwatch.git
git push -u origin main
```

### Étape 2 — Importer sur Vercel
1. Aller sur https://vercel.com/new
2. Importer votre dépôt GitHub
3. Framework : **Next.js** (détecté automatiquement)
4. Cliquer sur **Environment Variables** et ajouter :

| Variable | Valeur |
|----------|--------|
| `FIRECRAWL_API_KEY` | `fc-...` |
| `OPENAI_API_KEY` | `sk-...` |
| `UPSTASH_REDIS_REST_URL` | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | `...` |
| `CRON_SECRET` | Un token aléatoire (ex: `openssl rand -hex 32`) |

5. Cliquer **Deploy**

### Étape 3 — Vérifier le déploiement
- L'URL de production sera `https://webwatch-xxx.vercel.app`
- Tester en ajoutant `https://news.ycombinator.com` dans le dashboard
- Lancer une vérification manuelle

---

## Développement local

```bash
# Installer les dépendances
npm install

# Créer le fichier d'environnement
cp .env.example .env.local
# → Remplir les 4 variables

# Lancer le serveur de développement
npm run dev
# → http://localhost:3000
```

---

## Cron automatique

Le fichier `vercel.json` configure un cron toutes les 6 heures (`0 */6 * * *`).  
Pour modifier la fréquence, changer le schedule (format cron standard).

Pour déclencher manuellement via curl :
```bash
curl -X POST https://VOTRE-DOMAINE.vercel.app/api/cron \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

---

## Architecture des fichiers

```
src/
├── app/
│   ├── page.tsx              # Dashboard principal
│   ├── layout.tsx            # Layout racine
│   ├── error.tsx             # Page d'erreur globale
│   ├── loading.tsx           # Page de chargement
│   ├── not-found.tsx         # Page 404
│   └── api/
│       ├── urls/
│       │   ├── route.ts      # GET (liste) + POST (ajout)
│       │   └── [id]/route.ts # DELETE (suppression)
│       ├── scrape/route.ts   # POST (scraper un site)
│       ├── history/[id]/     # GET (historique)
│       └── cron/route.ts     # POST (scraping planifié)
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── DashboardHeader.tsx   # En-tête avec stats
│   ├── SiteCard.tsx          # Carte d'un site surveillé
│   ├── AddUrlForm.tsx        # Formulaire d'ajout
│   ├── HistoryPanel.tsx      # Panneau historique latéral
│   ├── EmptyState.tsx        # État vide
│   ├── Skeletons.tsx         # Loading skeletons
│   └── StatusDot.tsx         # Indicateur de statut
├── hooks/
│   ├── useSites.ts           # Gestion des sites
│   ├── useHistory.ts         # Chargement historique
│   └── use-toast.ts          # Notifications toast
├── lib/
│   ├── redis.ts              # Client Upstash Redis
│   ├── openai.ts             # Client OpenAI
│   ├── db.ts                 # Couche d'accès aux données
│   ├── scraper.ts            # Service Firecrawl
│   ├── analyzer.ts           # Analyse IA GPT-4o
│   └── utils.ts              # Utilitaires
├── types/index.ts            # Types TypeScript
└── middleware.ts             # Headers de sécurité
```

---

## Domaine personnalisé *.codewords.run

1. Dans Vercel → Settings → Domains
2. Ajouter `webwatch.codewords.run`
3. Dans votre DNS, ajouter un CNAME :
   - **Name** : `webwatch`
   - **Value** : `cname.vercel-dns.com`
4. Vercel provisionne automatiquement le SSL
