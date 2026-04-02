# GardeCoeur — Structure du projet React
**Secret-Project · Frontend v1.0**

## Arborescence complète

gardecour-front/
├── index.html
├── package.json            React 18, Vite, RHF, Zod, Zustand, Axios
├── vite.config.ts          Proxy /api → Django :8000
├── tsconfig.json
├── .env.example
│
└── src/
    ├── main.tsx            Point d'entrée
    ├── App.tsx             Router (lazy loading, routes protégées)
    ├── styles/globals.css  Tous les tokens design (couleurs, typo, ombres)
    ├── types/index.ts      Types TS complets + labels traduits
    ├── services/api.ts     Axios + refresh JWT automatique
    ├── store/authStore.ts  Zustand (auth persisté en localStorage)
    │
    ├── components/
    │   ├── ui/             Button, Input, Select, Textarea, Chip,
    │   │                   Badge, Avatar, Card, Spinner, ProgressBar
    │   └── layout/         Navbar, ProtectedRoute, PageLayout
    │
    └── pages/
        ├── Home/           Landing complète (hero, stats, how-to, témoignages, CTA)
        ├── Auth/           Login + Register multi-step (parent & retraité)
        └── Profile/        Profil détaillé avec sidebar sticky + demande de mise en relation

## Installation
```bash
npm install
```

### Lancement
```bash
npm run dev # pour démarrer l'app react. 
```

