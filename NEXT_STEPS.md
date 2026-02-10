# Prochaines Étapes - Guide Rapide

## 🎯 Objectif

Finaliser l'intégration en connectant les composants restants au backend.

---

## Étape 1: Intégrer App.vue (30 min)

### Modifications à apporter

```javascript
// Au début du <script setup>
import { onMounted } from 'vue';
import platService from '@/service/PlatService';
import referenceService from '@/service/ReferenceService';
import authService from '@/service/AuthService';

// Remplacer const menus = ref([...]) par:
const menus = ref([]);
const loading = ref(true);

// Ajouter au montage du composant
onMounted(async () => {
    // 1. Restaurer l'utilisateur si déjà connecté
    if (authService.isAuthenticated()) {
        user.value = authService.getCurrentUser();
    }

    // 2. Charger les menus du jour
    loading.value = true;
    try {
        const menusData = await platService.getTodayMenus();
        menus.value = menusData;
    } catch (error) {
        console.error('Erreur chargement menus:', error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger les menus',
            life: 3000
        });
    }

    // 3. Charger les quartiers disponibles
    try {
        const quartiersData = await referenceService.getQuartiers();
        // Extraire les noms uniques des quartiers des restaurateurs
        const quartiersFromMenus = [...new Set(menus.value.map(m => m.quartier))];
        // Fusionner avec les quartiers de la base de données
        const allQuartiers = [...new Set([
            ...quartiersFromMenus,
            ...quartiersData.map(q => q.nom)
        ])];
        // Mettre à jour availableQuartiers
        // (pas besoin de computed, c'est déjà calculé dans App.vue)
    } catch (error) {
        console.error('Erreur chargement quartiers:', error);
    }

    loading.value = false;
});

// Modifier handleLogout
const handleLogout = async () => {
    await authService.logout();
    user.value = null;
    toast.add({
        severity: 'info',
        summary: 'Déconnexion',
        detail: 'À bientôt !',
        life: 3000
    });
};
```

### Dans le template, ajouter un indicateur de chargement

```vue
<!-- Après <MenuFilters> -->
<div v-if="loading" class="text-center py-12">
    <i class="pi pi-spin pi-spinner text-4xl text-[#47A547]"></i>
    <p class="text-gray-600 mt-4">Chargement des menus...</p>
</div>

<div v-else>
    <!-- Le reste du template existant -->
    <MenuGrid :menus="paginatedMenus" ... />
    ...
</div>
```

---

## Étape 2: Intégrer PaymentModal.vue (45 min)

### Modifications à apporter

```javascript
// Au début du <script setup>
import commandeService from '@/service/CommandeService';
import referenceService from '@/service/ReferenceService';
import authService from '@/service/AuthService';

// Charger les tarifs de livraison au montage (si mode livraison)
const tarifsLivraison = ref({});

watch(() => props.visible, async (newValue) => {
    if (newValue) {
        // ... code existant ...

        // Charger les tarifs de livraison pour chaque restaurateur
        try {
            const restaurateurIds = [...new Set(props.orderData.items.map(item => item.restaurateur_id))];
            const tarifsPromises = restaurateurIds.map(id =>
                referenceService.getTarifsLivraison(id)
            );
            const tarifsResults = await Promise.all(tarifsPromises);

            tarifsResults.forEach((tarifs, index) => {
                tarifsLivraison.value[restaurateurIds[index]] = tarifs;
            });
        } catch (error) {
            console.error('Erreur chargement tarifs:', error);
        }
    }
});

// Modifier processPayment
const processPayment = async () => {
    if (!validatePaymentInfo()) {
        return;
    }

    processing.value = true;

    try {
        // Préparer les données de commande pour le backend
        const user = authService.getCurrentUser();

        // Pour chaque restaurant, créer une commande séparée
        const commandesPromises = Object.entries(itemsByRestaurant.value).map(async ([restaurant, items]) => {
            const restaurateurId = items[0].restaurateur_id; // Supposant que tous les items ont le même restaurateur
            const paymentMethod = selectedPaymentMethods.value[restaurant];
            const totals = totalsByRestaurant.value[restaurant];

            const commandeData = {
                client_id: user.id,
                restaurateur_id: restaurateurId,
                type_service: selectedDeliveryMode.value,
                adresse_livraison: selectedDeliveryMode.value === 'delivery' ? deliveryAddress.value.street : null,
                quartier_livraison_id: selectedDeliveryMode.value === 'delivery' ? deliveryAddress.value.quartier_id : null,
                moyen_paiement_id: paymentMethod.id,
                notes_client: deliveryAddress.value.instructions || '',
                reference_paiement: paymentReferences.value[restaurant] || null,
                numero_paiement: paymentPhones.value[restaurant] || null,
                items: items.map(item => ({
                    plat_id: item.id,
                    quantite: item.quantity,
                    prix_unitaire: item.price
                }))
            };

            return await commandeService.createCommande(commandeData);
        });

        const commandes = await Promise.all(commandesPromises);

        // Construire l'objet de réponse
        const orderDetails = {
            orderId: commandes[0].numero_commande, // Utiliser le premier numéro
            deliveryMode: selectedDeliveryMode.value,
            totalAmount: finalAmount.value,
            deliveryAddress: selectedDeliveryMode.value === 'delivery' ? deliveryAddress.value : null,
            restaurantOrders: {}
        };

        Object.entries(itemsByRestaurant.value).forEach(([restaurant, items], index) => {
            const commande = commandes[index];
            const totals = totalsByRestaurant.value[restaurant];

            orderDetails.restaurantOrders[restaurant] = {
                items,
                paymentMethod: selectedPaymentMethods.value[restaurant],
                amount: totals.total,
                deliveryFee: totals.deliveryFee,
                deliveredItems: totals.deliveredItems,
                pickupItems: totals.pickupItems,
                commandeId: commande.id
            };
        });

        emit('payment-success', orderDetails);

        toast.add({
            severity: 'success',
            summary: 'Commande créée',
            detail: 'Votre commande a été enregistrée avec succès',
            life: 5000
        });
    } catch (error) {
        console.error('Erreur création commande:', error);
        toast.add({
            severity: 'error',
            summary: 'Erreur de paiement',
            detail: error.message || 'Impossible de traiter votre commande',
            life: 5000
        });
    } finally {
        processing.value = false;
    }
};
```

### Notes importantes

1. **Moyens de paiement**: Vous devrez mapper les IDs des moyens de paiement depuis le backend
2. **Quartiers**: Charger la liste des quartiers pour pouvoir récupérer `quartier_id`
3. **Multiple commandes**: Le frontend crée actuellement une commande par restaurant, assurez-vous que c'est le comportement voulu

---

## Étape 3: Intégrer OrdersHistory.vue (30 min)

### Créer un nouveau composant si nécessaire

```javascript
<script setup>
import { ref, onMounted, computed } from 'vue';
import commandeService from '@/service/CommandeService';
import authService from '@/service/AuthService';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const orders = ref([]);
const loading = ref(true);
const user = computed(() => authService.getCurrentUser());

// Charger les commandes au montage
onMounted(async () => {
    await loadOrders();
});

const loadOrders = async () => {
    loading.value = true;
    try {
        const { data } = await commandeService.getCommandes({
            client_id: user.value.id,
            per_page: 50
        });
        orders.value = data;
    } catch (error) {
        console.error('Erreur chargement commandes:', error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger vos commandes',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Annuler une commande
const cancelOrder = async (orderId, raison) => {
    try {
        await commandeService.annulerCommande(orderId, raison);
        toast.add({
            severity: 'success',
            summary: 'Commande annulée',
            detail: 'Votre commande a été annulée',
            life: 3000
        });
        // Recharger les commandes
        await loadOrders();
    } catch (error) {
        console.error('Erreur annulation commande:', error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible d\'annuler la commande',
            life: 3000
        });
    }
};

// Mapper les statuts backend vers frontend
const getOrderStatus = (backendStatus) => {
    const statusMap = {
        'en_attente': 'preparing',
        'confirmee': 'preparing',
        'prete': 'ready_for_pickup',
        'en_livraison': 'in_delivery',
        'recuperee': 'delivered',
        'annulee': 'cancelled'
    };
    return statusMap[backendStatus] || backendStatus;
};
</script>
```

---

## Étape 4: Tests à Effectuer

### Test 1: Authentification
- [ ] Inscription d'un nouveau compte
- [ ] Connexion avec email
- [ ] Connexion avec téléphone
- [ ] Déconnexion
- [ ] Persistance de la session après rafraîchissement

### Test 2: Menus
- [ ] Chargement des menus du jour
- [ ] Filtrage par quartier
- [ ] Filtrage par type de plat
- [ ] Filtrage par prix
- [ ] Pagination

### Test 3: Commande
- [ ] Ajout au panier
- [ ] Modification quantités
- [ ] Suppression d'un item
- [ ] Calcul des totaux
- [ ] Sélection mode livraison/retrait
- [ ] Saisie adresse de livraison
- [ ] Sélection moyen de paiement
- [ ] Création de la commande
- [ ] Vérification dans la base de données

### Test 4: Historique
- [ ] Affichage des commandes
- [ ] Filtrage par statut
- [ ] Annulation d'une commande
- [ ] Détails d'une commande

---

## Checklist Finale

- [ ] Tous les services fonctionnent
- [ ] Gestion d'erreurs sur toutes les requêtes
- [ ] Messages toast pour feedback utilisateur
- [ ] Indicateurs de chargement
- [ ] Validation des formulaires
- [ ] Tests de bout en bout réussis
- [ ] Documentation à jour
- [ ] Code commenté et propre

---

## Ressources

- **Documentation complète**: Voir `INTEGRATION.md`
- **Résumé de l'intégration**: Voir `RESUME_INTEGRATION.md`
- **Backend context**: `c:\laragon\www\lelagali-back\context.md`

---

Bon courage ! 🚀
