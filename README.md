# 🍽️ LeLagaLi - Client Web Application

> Plateforme web de commande de plats traditionnels burkinabés

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vue.js)](https://vuejs.org/)
[![PrimeVue](https://img.shields.io/badge/PrimeVue-4.x-41B883?logo=vue.js)](https://primevue.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)](https://vitejs.dev/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com)

## 📋 Table des Matières

- [À Propos](#à-propos)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Build & Déploiement](#build--déploiement)
- [Structure du Projet](#structure-du-projet)
- [Charte Graphique](#charte-graphique)
- [API](#api)
- [Contribution](#contribution)

## 🎯 À Propos

**LeLagaLi** est une plateforme web qui connecte les clients avec des restauratrices locales du Burkina Faso. L'application permet de découvrir, commander et se faire livrer des plats traditionnels burkinabés préparés avec authenticité et amour.

### Mission
- Valoriser le savoir-faire culinaire des restauratrices burkinabés
- Préserver les traditions culinaires locales
- Faciliter l'accès aux plats traditionnels
- Soutenir l'entrepreneuriat féminin

## ✨ Fonctionnalités

### Pour les Clients
- 🔍 **Recherche intelligente** - Recherche par plat, quartier ou restauratrice
- 🗺️ **Filtres avancés** - Par quartier et fourchette de prix
- 🛒 **Panier dynamique** - Gestion en temps réel des commandes
- 📱 **Responsive** - Optimisé mobile, tablette et desktop
- 🔐 **Authentification** - Connexion sécurisée avec JWT
- 📦 **Suivi commandes** - Statut en temps réel
- 💳 **Paiements multiples** - Mobile Money, Wave, Espèces

### Interface
- 🎨 **Design moderne** - UI/UX optimisée
- ⚡ **Performance** - Chargement rapide < 3s
- 🌙 **Thème LeLagaLi** - Couleurs vertes/oranges
- 📲 **PWA Ready** - Installation possible
- ♿ **Accessible** - Standards WCAG

## 🛠️ Technologies

### Frontend
- **Vue.js 3** - Framework JavaScript progressif
- **PrimeVue 4** - Bibliothèque de composants UI
- **Vue Router** - Routing SPA
- **Vite 5** - Build tool ultra-rapide
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client (via Fetch API)

### Backend API
- **Laravel 11** - Framework PHP
- **PostgreSQL** - Base de données
- **JWT** - Authentification
- **AWS S3** - Stockage images

## 📦 Installation

### Prérequis
- Node.js >= 18.x
- npm >= 9.x ou pnpm >= 8.x
- Git

### Cloner le Projet
```bash
git clone https://github.com/votre-org/lelagali-client.git
cd lelagali-client
```

### Installer les Dépendances
```bash
npm install
# ou
pnpm install
```

## ⚙️ Configuration

### Variables d'Environnement

Créer un fichier `.env` à la racine:

```env
# API Backend URL
VITE_API_BASE_URL=http://localhost:8000/api

# Application Name
VITE_APP_NAME=LeLagaLi

# Environment
VITE_APP_ENV=development
```

### Configuration API

Le fichier `src/service/api.js` gère la connexion au backend:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
```

## 🚀 Développement

### Lancer le Serveur de Développement

```bash
npm run dev
# ou
pnpm dev
```

L'application sera accessible sur: `http://localhost:5173`

### Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur dev avec HMR

# Build
npm run build            # Build production
npm run preview          # Preview du build

# Qualité Code
npm run lint             # ESLint
npm run format           # Prettier
```

### Hot Module Replacement (HMR)

Vite permet le HMR pour un développement rapide:
- Modifications CSS instantanées
- Préservation état Vue components
- Rechargement rapide < 100ms

## 🏗️ Build & Déploiement

### Build Production

```bash
npm run build
```

Les fichiers optimisés seront dans `/dist`:
- HTML/CSS/JS minifiés
- Assets optimisés
- Source maps (optionnel)
- Taille totale: ~500KB gzipped

### Déploiement

#### Vercel (Recommandé)
```bash
vercel --prod
```

#### Netlify
```bash
netlify deploy --prod --dir=dist
```

#### Serveur Manuel
```bash
# Build
npm run build

# Upload dist/ vers serveur
scp -r dist/* user@server:/var/www/lelagali
```

### Variables d'Environnement Production

```env
VITE_API_BASE_URL=https://api.lelagali.bf/api
VITE_APP_ENV=production
```

## 📁 Structure du Projet

```
lelagali-client/
├── public/              # Assets statiques
│   ├── pic.jpg         # Logo
│   └── favicon.ico     # Favicon
├── src/
│   ├── assets/         # Assets compilés
│   │   └── styles.scss # Styles globaux
│   ├── components/     # Composants réutilisables
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   ├── MenuFilters.vue
│   │   ├── MenuGrid.vue
│   │   ├── CartSummary.vue
│   │   └── ...
│   ├── layout/         # Layouts
│   │   └── AppLayout.vue
│   ├── router/         # Configuration routes
│   │   └── index.js
│   ├── service/        # Services API
│   │   ├── api.js
│   │   ├── AuthService.js
│   │   ├── PlatService.js
│   │   └── CommandeService.js
│   ├── views/          # Pages/Vues
│   │   └── pages/
│   │       ├── Dashboard.vue
│   │       ├── APropos.vue
│   │       ├── Support.vue
│   │       └── CentreAide.vue
│   ├── App.vue         # Composant racine
│   └── main.js         # Point d'entrée
├── .env                # Variables environnement
├── .env.example        # Template .env
├── package.json        # Dépendances
├── vite.config.mjs     # Config Vite
├── tailwind.config.js  # Config Tailwind
└── README.md           # Ce fichier
```

## 🎨 Charte Graphique

### Couleurs Principales

```css
:root {
    --lelagali-green: #47a547;      /* Vert principal */
    --lelagali-orange: #e6782c;     /* Orange CTA */
    --lelagali-beige: #fdf6ec;      /* Beige fond */
    --lelagali-brown: #4b2e1e;      /* Marron texte */
    --lelagali-yellow: #f8c346;     /* Jaune accent */
}
```

### Typographie
- **Titres:** Bold, Marron (#4B2E1E)
- **Corps:** Regular, Gray-700
- **Taille base:** 16px
- **Line height:** 1.5

### Composants
- **Border radius:** 8px
- **Shadows:** Subtils
- **Transitions:** 0.3s ease
- **Spacing:** Multiples de 4px

## 🔌 API

### Endpoints Utilisés

```
GET  /api/app/plats/today           # Menus du jour (public)
GET  /api/app/plats                 # Tous les plats
POST /api/app/commandes             # Créer commande
GET  /api/app/commandes             # Liste commandes
POST /api/auth/login                # Connexion
POST /api/auth/register             # Inscription
```

### Format Réponse API

```json
{
    "success": true,
    "data": [...],
    "meta": {
        "current_page": 1,
        "total": 42
    }
}
```

### Gestion Erreurs

```javascript
try {
    const data = await platService.getTodayMenus();
} catch (error) {
    toast.add({
        severity: 'error',
        summary: 'Erreur',
        detail: error.message
    });
}
```

## 🤝 Contribution

### Workflow Git

```bash
# Créer branche feature
git checkout -b feature/nom-feature

# Commits
git commit -m "feat: description"

# Push
git push origin feature/nom-feature

# Pull Request sur GitHub
```

### Convention Commits

```
feat: Nouvelle fonctionnalité
fix: Correction bug
docs: Documentation
style: Formatage
refactor: Refactoring
test: Tests
chore: Maintenance
```

### Code Style

- **ESLint:** `npm run lint`
- **Prettier:** `npm run format`
- **Vue Style Guide:** Recommandé

## 📄 License

Propriétaire - © 2026 LeLagaLi, Tanga Group

## 👥 Équipe

- **Développement:** Tanga Group
- **Design:** Équipe LeLagaLi
- **Backend:** Laravel Team

## 📞 Support

- **Email:** contact@lelagali.bf
- **Téléphone:** +226 07 XX XX XX XX
- **WhatsApp:** +226 07 XX XX XX XX

## 🗺️ Roadmap

### V1.1 (Q2 2026)
- [ ] Notifications push
- [ ] Programme fidélité
- [ ] Système de favoris
- [ ] Avis clients

### V2.0 (Q3 2026)
- [ ] PWA complète
- [ ] Mode offline
- [ ] Chat support
- [ ] Recommandations IA

---

**Fait avec ❤️ au Burkina Faso**

Pour plus d'informations, consultez le [CHANGELOG.md](./CHANGELOG.md)
