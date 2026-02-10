# Guide d'Intégration Frontend-Backend LeLagaLi

## Vue d'ensemble

Ce document décrit l'intégration complète entre le frontend Vue.js 3 + PrimeVue et le backend Laravel 12 de l'application LeLagaLi.

---

## Architecture de l'Intégration

```
┌─────────────────────────────────────────────────┐
│           Frontend (Vue 3 + PrimeVue)           │
│                                                  │
│  ┌────────────┐  ┌──────────────┐              │
│  │ Components │  │   Services   │              │
│  │            │  │              │              │
│  │ AuthModal  │─►│ AuthService  │              │
│  │ MenuGrid   │  │ PlatService  │              │
│  │ PaymentModal│─►│ CommandeService│            │
│  │            │  │ ReferenceService│            │
│  └────────────┘  └──────────────┘              │
│                         │                        │
│                         ▼                        │
│                   ┌──────────┐                  │
│                   │ api.js   │                  │
│                   │ (HTTP)   │                  │
│                   └──────────┘                  │
└─────────────────────┬───────────────────────────┘
                      │ HTTP/JSON + JWT Bearer
                      │ CORS Enabled
                      ▼
┌─────────────────────────────────────────────────┐
│            Backend (Laravel 12 API)             │
│                                                  │
│  ┌────────────┐  ┌──────────────┐              │
│  │ Middleware │  │ Controllers  │              │
│  │            │  │              │              │
│  │ CORS       │  │ UserController│             │
│  │ JWT Auth   │─►│ PlatController│             │
│  │            │  │ CommandeController│         │
│  └────────────┘  └──────────────┘              │
│                         │                        │
│                         ▼                        │
│                  ┌────────────┐                 │
│                  │  Models    │                 │
│                  │  Eloquent  │                 │
│                  └────────────┘                 │
│                         │                        │
│                         ▼                        │
│                  ┌────────────┐                 │
│                  │ PostgreSQL │                 │
│                  └────────────┘                 │
└─────────────────────────────────────────────────┘
```

---

## Configuration

### Backend (.env)

```env
# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=lelagali_back
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=<votre-secret-jwt>
JWT_TTL=60
```

### Frontend (.env)

```env
# API Backend URL
VITE_API_BASE_URL=http://localhost:8000/api

# Application Name
VITE_APP_NAME=LeLagaLi

# Environment
VITE_APP_ENV=development
```

---

## Services Frontend Créés

### 1. `api.js` - Service HTTP de Base

**Emplacement**: `src/service/api.js`

**Fonctionnalités**:
- Gestion centralisée des requêtes HTTP avec `fetch`
- Gestion automatique des headers (Content-Type, Authorization)
- Stockage et récupération du token JWT dans localStorage
- Gestion des erreurs HTTP (401, 403, 500, etc.)
- Support du multipart/form-data pour l'upload de fichiers

**Méthodes principales**:
```javascript
api.get(endpoint, options)
api.post(endpoint, data, options)
api.put(endpoint, data, options)
api.patch(endpoint, data, options)
api.delete(endpoint, options)
api.uploadFile(endpoint, file, fieldName, additionalData)
```

---

### 2. `AuthService.js` - Authentification

**Emplacement**: `src/service/AuthService.js`

**Fonctionnalités**:
- Login avec email OU téléphone
- Inscription de nouveaux utilisateurs (rôle client par défaut)
- Logout et nettoyage de la session
- Rafraîchissement du token JWT
- Gestion du profil utilisateur
- Réinitialisation du mot de passe

**Méthodes principales**:
```javascript
authService.login(identifier, password)
authService.register(userData)
authService.logout()
authService.refreshToken()
authService.getProfile()
authService.updateProfile(userId, profileData)
authService.resetPassword(userId, currentPassword, newPassword)
authService.isAuthenticated()
authService.getCurrentUser()
```

**Exemple d'utilisation**:
```javascript
import authService from '@/service/AuthService';

// Connexion
const { user, token } = await authService.login('test@example.com', 'password');

// Inscription
const userData = {
    name: 'Jean Dupont',
    email: 'jean@example.com',
    phone: '+225 07 12 34 56 78',
    password: 'motdepasse123'
};
const { user } = await authService.register(userData);

// Vérifier si connecté
if (authService.isAuthenticated()) {
    const currentUser = authService.getCurrentUser();
}
```

---

### 3. `PlatService.js` - Gestion des Plats/Menus

**Emplacement**: `src/service/PlatService.js`

**Fonctionnalités**:
- Récupération des plats avec filtres et pagination
- Récupération des menus du jour
- CRUD complet pour les restaurateurs
- Upload d'images de plats
- Statistiques

**Méthodes principales**:
```javascript
platService.getPlats(filters)
platService.getTodayMenus()
platService.getPlatById(platId)
platService.getPlatsByRestaurateur(restaurateurId)
platService.createPlat(platData, image)
platService.updatePlat(platId, platData, image)
platService.deletePlat(platId)
platService.getStats(restaurateurId)
```

**Exemple d'utilisation**:
```javascript
import platService from '@/service/PlatService';

// Récupérer les menus du jour
const menusToday = await platService.getTodayMenus();

// Filtrer les plats
const filters = {
    quartier: 'Cocody',
    type: 'attiéké',
    min_price: 2000,
    max_price: 5000,
    livraison: true,
    page: 1,
    per_page: 12
};
const { data, meta } = await platService.getPlats(filters);
```

---

### 4. `CommandeService.js` - Gestion des Commandes

**Emplacement**: `src/service/CommandeService.js`

**Fonctionnalités**:
- CRUD des commandes
- Gestion du cycle de vie (accepter, préparer, livrer, terminer, annuler)
- Marquage de paiement
- Recherche avancée
- Statistiques et rapports
- Bestsellers

**Méthodes principales**:
```javascript
commandeService.getCommandes(filters)
commandeService.getCommandeById(commandeId)
commandeService.createCommande(commandeData)
commandeService.updateCommande(commandeId, commandeData)
commandeService.accepterCommande(commandeId)
commandeService.marquerPrete(commandeId)
commandeService.mettreEnLivraison(commandeId)
commandeService.terminerCommande(commandeId)
commandeService.annulerCommande(commandeId, raison)
commandeService.marquerPayee(commandeId, reference, numero)
commandeService.getStatistics()
commandeService.searchCommandes(searchCriteria)
commandeService.getSalesReport(dateDebut, dateFin, restaurateurId)
commandeService.getBestsellers(filters)
```

**Exemple de création de commande**:
```javascript
import commandeService from '@/service/CommandeService';

const commandeData = {
    client_id: user.id,
    restaurateur_id: restaurant.id,
    type_service: 'livraison', // ou 'retrait'
    adresse_livraison: '123 Rue des Palmiers, Cocody',
    quartier_livraison_id: quartier.id,
    moyen_paiement_id: moyenPaiement.id,
    notes_client: 'Pas de piment',
    items: [
        {
            plat_id: plat1.id,
            quantite: 2,
            prix_unitaire: 2500
        },
        {
            plat_id: plat2.id,
            quantite: 1,
            prix_unitaire: 3000
        }
    ]
};

const commande = await commandeService.createCommande(commandeData);
```

---

### 5. `ReferenceService.js` - Données de Référence

**Emplacement**: `src/service/ReferenceService.js`

**Fonctionnalités**:
- Récupération des quartiers
- Récupération des moyens de paiement
- Récupération des tarifs de livraison
- Récupération des moyens de paiement d'un restaurateur

**Méthodes principales**:
```javascript
referenceService.getQuartiers()
referenceService.getMoyensPaiement()
referenceService.getTarifsLivraison(restaurateurId, quartierId)
referenceService.getRestaurateurMoyensPaiement(restaurateurId)
```

---

## Composants Frontend Intégrés

### AuthModal.vue

**Statut**: ✅ Intégré avec le backend

**Modifications**:
- Import de `AuthService`
- Remplacement de la simulation par des appels API réels
- Gestion des erreurs backend
- Émission de l'événement `auth-success` avec les données utilisateur

**Flux d'authentification**:
```
1. Utilisateur saisit email/téléphone + mot de passe
2. authService.login(identifier, password)
3. Backend valide et retourne { user, token }
4. Token stocké dans localStorage
5. Événement 'auth-success' émis avec user
6. App.vue met à jour user.value
```

---

### PaymentModal.vue

**Statut**: ⏳ À intégrer

**TODO**:
1. Importer `CommandeService` et `ReferenceService`
2. Remplacer les données mockées par des appels API
3. Récupérer les tarifs de livraison réels
4. Créer la commande via `commandeService.createCommande()`
5. Gérer les erreurs de création de commande

**Exemple d'intégration**:
```javascript
import commandeService from '@/service/CommandeService';
import referenceService from '@/service/ReferenceService';

const processPayment = async () => {
    try {
        processing.value = true;

        // Préparer les données de commande
        const commandeData = {
            client_id: user.value.id,
            restaurateur_id: selectedRestaurant.value.id,
            type_service: selectedDeliveryMode.value,
            adresse_livraison: deliveryAddress.value.street,
            quartier_livraison_id: selectedQuartier.value.id,
            moyen_paiement_id: selectedPaymentMethod.value.id,
            notes_client: deliveryAddress.value.instructions,
            items: cartItems.value.map(item => ({
                plat_id: item.id,
                quantite: item.quantity,
                prix_unitaire: item.price
            }))
        };

        const commande = await commandeService.createCommande(commandeData);

        emit('payment-success', {
            orderId: commande.numero_commande,
            ...commande
        });
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.message,
            life: 5000
        });
    } finally {
        processing.value = false;
    }
};
```

---

### App.vue

**Statut**: ⏳ À intégrer

**TODO**:
1. Importer `PlatService` et `ReferenceService`
2. Remplacer les données mockées des menus par `platService.getTodayMenus()`
3. Charger les quartiers et moyens de paiement au montage
4. Persister l'utilisateur connecté au montage depuis localStorage

**Exemple**:
```javascript
import platService from '@/service/PlatService';
import referenceService from '@/service/ReferenceService';
import authService from '@/service/AuthService';

// Au montage
onMounted(async () => {
    // Restaurer l'utilisateur si déjà connecté
    if (authService.isAuthenticated()) {
        user.value = authService.getCurrentUser();
    }

    // Charger les menus du jour
    try {
        const menusData = await platService.getTodayMenus();
        menus.value = menusData;
    } catch (error) {
        console.error('Erreur chargement menus:', error);
    }

    // Charger les quartiers
    try {
        const quartiersData = await referenceService.getQuartiers();
        availableQuartiers.value = quartiersData.map(q => q.nom);
    } catch (error) {
        console.error('Erreur chargement quartiers:', error);
    }
});
```

---

## Format des Réponses API

### Succès

```json
{
    "success": true,
    "data": { ... },
    "meta": {
        "current_page": 1,
        "per_page": 12,
        "total": 50,
        "last_page": 5
    }
}
```

### Erreur

```json
{
    "success": false,
    "message": "Message d'erreur",
    "errors": {
        "field": ["Erreur de validation"]
    }
}
```

---

## Gestion des Erreurs

### Frontend

Le service `api.js` gère automatiquement:
- **401 Unauthorized**: Déconnexion automatique + redirection
- **403 Forbidden**: Affichage message d'erreur
- **500 Server Error**: Affichage message d'erreur générique

### Backend

Laravel retourne des erreurs HTTP standardisées:
- **400**: Requête invalide
- **401**: Non authentifié
- **403**: Non autorisé (permissions insuffisantes)
- **404**: Ressource non trouvée
- **422**: Erreur de validation
- **500**: Erreur serveur

---

## Démarrage de l'Application

### Backend

```bash
cd c:\laragon\www\lelagali-back

# Installer les dépendances
composer install

# Lancer les migrations
php artisan migrate

# Lancer les seeders (données de test)
php artisan db:seed

# Démarrer le serveur
php artisan serve
# Backend disponible sur http://localhost:8000
```

### Frontend

```bash
cd c:\laragon\www\lelagali-client

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
# Frontend disponible sur http://localhost:5173
```

---

## Checklist d'Intégration

### ✅ Complété

- [x] Service HTTP de base (api.js)
- [x] Service d'authentification (AuthService.js)
- [x] Service plats (PlatService.js)
- [x] Service commandes (CommandeService.js)
- [x] Service références (ReferenceService.js)
- [x] Configuration CORS backend
- [x] Configuration .env frontend et backend
- [x] Intégration AuthModal.vue avec le backend

### ⏳ À Faire

- [ ] Intégrer PaymentModal.vue avec CommandeService
- [ ] Intégrer App.vue avec PlatService pour charger les menus
- [ ] Intégrer OrdersHistory.vue avec CommandeService
- [ ] Ajouter un composant de gestion du profil utilisateur
- [ ] Ajouter un intercepteur pour rafraîchir automatiquement le token JWT
- [ ] Gérer les uploads d'images de plats (restaurateurs)
- [ ] Ajouter des notifications en temps réel (optionnel)

---

## Prochaines Étapes

1. **Intégrer PaymentModal**: Connecter la création de commandes au backend
2. **Charger les menus dynamiquement**: Remplacer les données mockées dans App.vue
3. **Gérer les commandes en cours**: Afficher les vraies commandes dans OrdersHistory
4. **Ajouter la gestion du profil**: Permettre à l'utilisateur de modifier ses informations
5. **Tests d'intégration**: Tester tous les flux utilisateur de bout en bout

---

## Troubleshooting

### Erreur CORS

Si vous rencontrez des erreurs CORS:
1. Vérifiez que `CORS_ALLOWED_ORIGINS` dans `.env` backend inclut l'URL du frontend
2. Vérifiez que le middleware CORS est actif dans `bootstrap/app.php`
3. Redémarrez le serveur Laravel après modification du `.env`

### Token JWT expiré

Si le token expire:
- Utilisez `authService.refreshToken()` pour le rafraîchir
- Ou reconnectez-vous via `authService.login()`

### Erreur 401 lors des requêtes API

Vérifiez que:
1. Le token est bien stocké dans localStorage
2. Le header `Authorization: Bearer <token>` est bien envoyé
3. Le token n'a pas expiré (TTL par défaut: 60 minutes)

---

---

## Stockage des Fichiers - Amazon S3

### Configuration Backend

Le backend utilise **Amazon S3** pour stocker toutes les images des plats.

**Configuration** :
- Bucket : `lelagali`
- Région : `eu-north-1` (Stockholm)
- URL de base : `https://lelagali.s3.eu-north-1.amazonaws.com`

**Fichiers concernés** :
- Images des plats : `menus/*.jpg`

### Utilisation dans le Frontend

Les images sont automatiquement servies depuis S3. Le modèle `Plat` retourne un attribut `image_url` avec l'URL complète :

```json
{
    "id": "uuid-123",
    "nom": "Attiéké Poisson",
    "image": "menus/1709635200_abc123.jpg",
    "image_url": "https://lelagali.s3.eu-north-1.amazonaws.com/menus/1709635200_abc123.jpg"
}
```

**Dans les composants Vue** :
```vue
<template>
    <!-- Utiliser image_url pour afficher les images -->
    <img :src="plat.image_url" :alt="plat.nom" />
</template>
```

**Upload d'images** :
```javascript
// Le service PlatService supporte déjà l'upload vers S3
import platService from '@/service/PlatService';

const image = document.querySelector('input[type=file]').files[0];
const platData = { nom: '...', description: '...', prix: 2500 };

await platService.createPlat(platData, image);
// L'image est automatiquement uploadée vers S3
```

### Documentation Complète

Voir `STORAGE_S3.md` dans le backend pour la documentation complète sur S3.

---

## Ressources

- [Documentation Laravel 12](https://laravel.com/docs/12.x)
- [Documentation Vue 3](https://vuejs.org/)
- [Documentation PrimeVue 4](https://primevue.org/)
- [JWT Auth pour Laravel](https://jwt-auth.readthedocs.io/)
- [Amazon S3 Documentation](https://docs.aws.amazon.com/s3/)
