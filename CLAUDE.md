# CLAUDE.md - LeLagali Client

## Projet

**LeLagali** est une application de commande de plats africains (cuisine ivoirienne) en ligne.
Les utilisateurs parcourent les menus de restauratrices locales, ajoutent au panier, choisissent livraison ou retrait, et paient via Mobile Money / Orange Money / Wave / Cash.

- **Marché cible** : Côte d'Ivoire (Abidjan et alentours)
- **Devise** : FCFA
- **Langue de l'UI** : Français

## Stack technique

| Couche        | Technologie                                        |
|---------------|---------------------------------------------------|
| Framework     | Vue 3.4+ (Composition API, `<script setup>`)      |
| Build         | Vite 5                                            |
| Router        | Vue Router 4 (mode `createWebHistory`)            |
| UI Components | PrimeVue 4.3+ (thème Aura, auto-import)          |
| Icônes        | PrimeIcons 7                                      |
| CSS           | Tailwind CSS 3.4 + SCSS + tailwindcss-primeui     |
| Linter        | ESLint 8 + eslint-plugin-vue + Prettier           |
| Déploiement   | Vercel (SPA rewrite configuré dans vercel.json)   |
| Package mgr   | npm (package-lock.json) ou pnpm (pnpm-lock.yaml) |

## Commandes

```bash
npm run dev       # Serveur de développement (Vite)
npm run build     # Build de production
npm run preview   # Prévisualisation du build
npm run lint      # Lint + fix automatique
```

## Architecture du projet

```
src/
├── main.js                    # Point d'entrée, config PrimeVue + Router
├── App.vue                    # Page principale (marketplace des menus)
├── assets/
│   ├── styles.scss            # Point d'entrée SCSS global
│   ├── tailwind.css           # Config Tailwind
│   └── layout/                # Styles du layout (Sakai template)
├── components/                # Composants métier de l'application
│   ├── AppHeader.vue          # Header + hero + navigation + recherche
│   ├── AppFooter.vue          # Footer du site
│   ├── MenuGrid.vue           # Grille de cartes de menus
│   ├── MenuCard.vue           # Carte individuelle d'un menu
│   ├── MenuDetails.vue        # Modale de détails d'un menu
│   ├── MenuFilters.vue        # Filtres (quartier, type, prix, livraison)
│   ├── CartSummary.vue        # Widget panier flottant (bottom-right)
│   ├── CartDetails.vue        # Contenu détaillé du panier (modale)
│   ├── PaymentModal.vue       # Modale de paiement (livraison/retrait + paiement par restaurant)
│   ├── AuthModal.vue          # Modale connexion/inscription
│   ├── OrdersHistory.vue      # Historique des commandes (TabView)
│   ├── UserProfile.vue        # Profil utilisateur
│   ├── FloatingConfigurator.vue
│   ├── dashboard/             # Widgets du dashboard (template Sakai)
│   └── landing/               # Widgets de la landing page (template Sakai)
├── layout/                    # Layout admin (hérité du template Sakai)
│   ├── AppLayout.vue          # Layout wrapper (sidebar commentée)
│   ├── AppTopbar.vue          # Topbar admin
│   ├── AppSidebar.vue         # Sidebar navigation
│   ├── AppMenu.vue            # Menu de navigation
│   ├── AppMenuItem.vue        # Item de menu
│   ├── AppConfigurator.vue    # Configurateur de thème
│   └── composables/layout.js  # Composable pour l'état du layout
├── router/index.js            # Configuration des routes
├── service/                   # Services de données (hérités de Sakai)
│   ├── ProductService.js
│   ├── CustomerService.js
│   ├── CountryService.js
│   ├── NodeService.js
│   └── PhotoService.js
└── views/                     # Pages
    ├── Dashboard.vue
    └── pages/
        ├── Landing.vue
        ├── Crud.vue
        ├── auth/ (Login, Access, Error)
        └── ...
```

## Routes principales

| Route              | Composant            | Description                      |
|--------------------|----------------------|----------------------------------|
| `/`                | App.vue              | Marketplace (page principale)    |
| `/mes-commandes`   | OrdersHistory.vue    | Historique des commandes         |
| `/landing`         | Landing.vue          | Landing page                     |
| `/auth/login`      | Login.vue            | Page de connexion                |
| `/pages/crud`      | Crud.vue             | CRUD admin (template Sakai)      |

## Charte graphique

### Couleurs (définies dans Tailwind + CSS custom properties)

| Nom     | Hex       | Usage                                    |
|---------|-----------|------------------------------------------|
| Green   | `#47A547` | Couleur principale, CTA, succès          |
| Orange  | `#E6782C` | Accent secondaire, badges quartier, CTA  |
| Beige   | `#FDF6EC` | Fond de page principal                   |
| Brown   | `#4B2E1E` | Texte principal, titres                  |
| Yellow  | `#F8C346` | Panier flottant, bouton recherche        |

### Classes Tailwind personnalisées

```
text-lelagali-{green|orange|beige|brown|yellow}
bg-lelagali-{green|orange|beige|brown|yellow}
```

### Typographie

- **Sans-serif** : Open Sans, Roboto
- **Titres** : Montserrat, Poppins
- Police chargée via CDN : Lato

## Conventions de code

### Vue Components

- **Toujours** `<script setup>` (Composition API)
- **Ordre des balises** : `<script>` → `<template>` → `<style>` (enforced par ESLint)
- **Props** : `defineProps()` avec typage simple (`Array`, `Object`, `Boolean`)
- **Emits** : `defineEmits()` déclarés explicitement
- **Pas de state management global** (Pinia/Vuex) : tout l'état est dans `App.vue` et passé via props/events
- **PrimeVue** : auto-importé via `unplugin-vue-components` + `PrimeVueResolver` (pas besoin d'importer les composants PrimeVue globalement, mais certains composants sont importés manuellement)

### CSS / Style

- Utilisation mixte de **Tailwind utility classes** et **CSS scoped** (`<style scoped>`)
- Couleurs hardcodées directement dans les classes Tailwind : `bg-[#47A547]`, `text-[#4B2E1E]`, etc.
- Deep selectors `:deep()` pour personnaliser les composants PrimeVue
- Variables CSS `--lelagali-*` définies dans `App.vue`

### Prettier

- 4 espaces, pas de tabs
- Single quotes
- Pas de trailing comma
- Point-virgule requis
- `printWidth: 250` (très large)

## État actuel du projet

### Ce qui fonctionne (frontend uniquement, données en dur)

- Affichage et filtrage des menus (quartier, type, prix, livraison)
- Recherche par nom de plat, quartier ou restauratrice
- Pagination des résultats
- Ajout au panier, modification des quantités, suppression
- Panier flottant avec résumé
- Modale de détails d'un menu
- Processus de paiement complet (choix livraison/retrait, paiement par restaurant)
- Authentification (connexion/inscription) simulée
- Historique des commandes avec statuts

### Ce qui est simulé / en dur

- **Pas de backend/API** : toutes les données (menus, commandes, utilisateur) sont en dur dans les composants
- **Authentification factice** : `test@example.com` / `password`
- **Paiement simulé** : `setTimeout` de 2 secondes
- Les commandes d'exemple sont dupliquées entre `App.vue` et `OrdersHistory.vue`

### Template de base

Le projet est basé sur le **template Sakai de PrimeVue** (v4). Le layout admin (sidebar, topbar, menu) est présent mais **largement commenté** dans `AppLayout.vue`. L'application actuelle utilise principalement `App.vue` comme page d'accueil publique.

## Points d'attention

1. **Pas de store centralisé** : l'état global est dans `App.vue` via `ref()` — si le projet grandit, envisager Pinia
2. **Données dupliquées** : les commandes et adresses des restaurants sont copiées dans plusieurs composants
3. **Pas de gestion d'erreurs réseau** : les appels API sont simulés avec `setTimeout`
4. **Le router charge `App.vue` comme route `/`** dans le layout, ce qui est inhabituel (App.vue est normalement le root component)
5. **Couleurs hardcodées** : les couleurs sont en hex inline dans le HTML plutôt que via le système de thème PrimeVue/Tailwind de manière cohérente
6. **Console.log de debug** présent dans `CartSummary.vue`
