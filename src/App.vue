<script setup>
import Dialog from 'primevue/dialog';
import Paginator from 'primevue/paginator';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import AppFooter from './components/AppFooter.vue';
import AppHeader from './components/AppHeader.vue';
import AuthModal from './components/AuthModal.vue';
import CartDetails from './components/CartDetails.vue';
import CartSummary from './components/CartSummary.vue';
import MenuDetails from './components/MenuDetails.vue';
import MenuFilters from './components/MenuFilters.vue';
import MenuGrid from './components/MenuGrid.vue';
import OrdersHistory from './components/OrdersHistory.vue';
import PaymentModal from './components/PaymentModal.vue';
import authService from './service/AuthService';
import commandeService from './service/CommandeService';
import platService from './service/PlatService';
import referenceService from './service/ReferenceService';

const toast = useToast();

// State
const searchQuery = ref('');
const filters = ref({
    quartier: '',
    type: '',
    livraisonOnly: false,
    priceRange: [0, 10000]
});
const cartItems = ref([]);
const showCartDialog = ref(false);
const showMenuDialog = ref(false);
const showAuthModal = ref(false);
const showPaymentModal = ref(false);
const showOrdersModal = ref(false);
const selectedMenu = ref(null);
const user = ref(null);
const orderData = ref(null);
const showOrderConfirmation = ref(false);
const lastCompletedOrder = ref(null);

// Pagination state
const currentPage = ref(0);
const itemsPerPage = ref(9);

// Commandes - chargées depuis l'API
const orders = ref([]);

// Calculer les commandes en cours
const currentOrders = computed(() => orders.value.filter((order) => ['preparing', 'ready_for_pickup', 'ready_for_delivery', 'in_delivery', 'mixed_status'].includes(order.status)));

// Calculer le nombre de commandes en préparation
const pendingOrdersCount = computed(() => {
    return currentOrders.value.length;
});

// État de chargement
const loading = ref(true);

// Menus - chargés depuis l'API
const menus = ref([]);

// Computed properties
const availableQuartiers = computed(() => {
    return [...new Set(menus.value.map((menu) => menu.quartier))];
});

const availableTypes = computed(() => {
    return [...new Set(menus.value.map((menu) => menu.type))];
});

const filteredMenus = computed(() => {
    return menus.value.filter((menu) => {
        const matchesSearch =
            !searchQuery.value ||
            menu.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            menu.quartier.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            menu.restauratrice.toLowerCase().includes(searchQuery.value.toLowerCase());

        const matchesQuartier = !filters.value.quartier || menu.quartier === filters.value.quartier;
        const matchesType = !filters.value.type || menu.type === filters.value.type;
        const matchesLivraison = !filters.value.livraisonOnly || menu.livraison;
        const matchesPrice = menu.price >= filters.value.priceRange[0] && menu.price <= filters.value.priceRange[1];

        return matchesSearch && matchesQuartier && matchesType && matchesLivraison && matchesPrice;
    });
});

// Pagination computed properties
const totalFilteredMenus = computed(() => filteredMenus.value.length);

const paginatedMenus = computed(() => {
    const start = currentPage.value * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredMenus.value.slice(start, end);
});

const totalCartPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0);
});

const menuMaxQuantities = computed(() => {
    const map = {};
    menus.value.forEach((menu) => {
        map[menu.id] = menu.quantity;
    });
    return map;
});

// Methods
const handleSearch = (query) => {
    searchQuery.value = query;
    currentPage.value = 0;
};

const handleFilterChange = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters };
    currentPage.value = 0;
};

const onPageChange = (event) => {
    currentPage.value = event.page;
    const menuSection = document.querySelector('#menu-section');
    if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
    }
};

const addToCart = (menu) => {
    const originalMenu = menus.value.find((m) => m.id === menu.id);
    if (!originalMenu) return;

    const existingItem = cartItems.value.find((item) => item.id === menu.id);
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;

    if (currentCartQuantity >= originalMenu.quantity) {
        toast.add({
            severity: 'warn',
            summary: 'Stock insuffisant',
            detail: `Il ne reste que ${originalMenu.quantity} portion(s) de ${menu.title}`,
            life: 3000
        });
        return;
    }

    if (existingItem) {
        existingItem.quantity += 1;
        toast.add({
            severity: 'success',
            summary: 'Ajouté au panier',
            detail: `Quantité mise à jour pour ${menu.title}`,
            life: 3000
        });
    } else {
        cartItems.value.push({
            ...menu,
            quantity: 1
        });
        toast.add({
            severity: 'success',
            summary: 'Ajouté au panier',
            detail: `${menu.title} ajouté à votre panier`,
            life: 3000
        });
    }
};

const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
        removeFromCart(itemId);
        return;
    }

    const originalMenu = menus.value.find((m) => m.id === itemId);
    if (originalMenu && newQuantity > originalMenu.quantity) {
        toast.add({
            severity: 'warn',
            summary: 'Stock insuffisant',
            detail: `Il ne reste que ${originalMenu.quantity} portion(s) de ${originalMenu.title}`,
            life: 3000
        });
        return;
    }

    const item = cartItems.value.find((item) => item.id === itemId);
    if (item) {
        item.quantity = newQuantity;
    }
};

const removeFromCart = (itemId) => {
    const index = cartItems.value.findIndex((item) => item.id === itemId);
    if (index > -1) {
        const removedItem = cartItems.value.splice(index, 1)[0];
        toast.add({
            severity: 'info',
            summary: 'Retiré du panier',
            detail: `${removedItem.title} retiré de votre panier`,
            life: 3000
        });
    }
};

const viewMenuDetails = (menu) => {
    selectedMenu.value = menu;
    showMenuDialog.value = true;
};

const handleCheckout = (data) => {
    if (!user.value) {
        showAuthModal.value = true;
        orderData.value = data;
        return;
    }

    // Préparer les données de commande avec les méthodes de paiement disponibles
    const uniquePaymentMethods = [...new Set(cartItems.value.flatMap((item) => item.paymentMethods))];

    orderData.value = {
        ...data,
        items: cartItems.value,
        availablePaymentMethods: uniquePaymentMethods
    };

    showPaymentModal.value = true;
    showCartDialog.value = false;
};

const handleAuthSuccess = async (userData) => {
    user.value = userData;
    showAuthModal.value = false;

    toast.add({
        severity: 'success',
        summary: 'Connexion réussie',
        detail: `Bienvenue ${userData.name} !`,
        life: 3000
    });

    // Charger les commandes de l'utilisateur
    await loadOrders();

    // Si il y avait une commande en attente, procéder au paiement
    if (orderData.value) {
        const uniquePaymentMethods = [...new Set(cartItems.value.flatMap((item) => item.paymentMethods))];

        orderData.value.availablePaymentMethods = uniquePaymentMethods;
        showPaymentModal.value = true;
    }
};

const handleShowOrders = () => {
    showOrdersModal.value = true;
};

const handlePaymentSuccess = async (orderDetails) => {
    // Recharger les commandes depuis l'API
    await loadOrders();

    // Trouver la dernière commande ajoutée (devrait être la première dans la liste)
    const newOrder = orders.value[0];
    if (newOrder) {
        lastCompletedOrder.value = newOrder;
        showOrderConfirmation.value = true;
    }

    toast.add({
        severity: 'success',
        summary: 'Commande validée',
        detail: 'Votre commande a été transmise aux restauratrices',
        life: 5000
    });

    // Réinitialiser
    cartItems.value = [];
    orderData.value = null;
    showPaymentModal.value = false;
};

const handleLogin = () => {
    showAuthModal.value = true;
};

const handleLogout = async () => {
    await authService.logout();
    user.value = null;
    orders.value = []; // Réinitialiser les commandes
    toast.add({
        severity: 'info',
        summary: 'Déconnexion',
        detail: 'À bientôt !',
        life: 3000
    });
};

// Fonction pour charger les commandes de l'utilisateur
const loadOrders = async () => {
    if (!user.value) {
        orders.value = [];
        return;
    }

    try {
        const { data } = await commandeService.getCommandes({
            client_id: user.value.id,
            per_page: 100
        });

        // Mapper le statut backend vers le statut frontend
        const mapStatus = (backendStatus) => {
            const statusMap = {
                en_attente: 'preparing',
                confirmee: 'preparing',
                prete: 'ready_for_pickup',
                en_livraison: 'in_delivery',
                recuperee: 'picked_up',
                livree: 'delivered',
                terminee: 'completed',
                annulee: 'cancelled'
            };
            return statusMap[backendStatus] || 'preparing';
        };

        // Transformer les données backend pour correspondre au format frontend
        orders.value = data.map((commande) => ({
            id: commande.numero_commande,
            date: new Date(commande.created_at),
            totalAmount: parseFloat(commande.montant_total),
            deliveryMode: commande.type_service === 'livraison' ? 'delivery' : 'pickup',
            status: mapStatus(commande.statut),
            deliveryAddress: commande.type_service === 'livraison'
                ? {
                      street: commande.adresse_livraison,
                      quartier: commande.quartier_livraison,
                      commune: commande.quartier_livraison,
                      phone: user.value.phone || ''
                  }
                : null,
            restaurantOrders: {
                [commande.restaurateur?.nom || 'Restaurant']: {
                    items: (commande.items || []).map((item) => ({
                        id: item.plat_id,
                        title: item.plat?.nom || 'Plat',
                        quantity: item.quantite,
                        price: parseFloat(item.prix_unitaire)
                    })),
                    paymentMethod: commande.moyen_paiement?.code || 'cash',
                    amount: parseFloat(commande.montant_total),
                    deliveryFee: parseFloat(commande.frais_livraison || 0),
                    status: mapStatus(commande.statut),
                    deliveredItems: commande.type_service === 'livraison' ? (commande.items || []).map((item) => ({
                        id: item.plat_id,
                        title: item.plat?.nom || 'Plat',
                        quantity: item.quantite,
                        price: parseFloat(item.prix_unitaire)
                    })) : [],
                    pickupItems: commande.type_service === 'retrait' ? (commande.items || []).map((item) => ({
                        id: item.plat_id,
                        title: item.plat?.nom || 'Plat',
                        quantity: item.quantite,
                        price: parseFloat(item.prix_unitaire)
                    })) : []
                }
            }
        }));

        console.log('Commandes chargées:', orders.value.length);
    } catch (error) {
        console.error('Erreur chargement commandes:', error);
        // Ne pas afficher de toast d'erreur ici car l'utilisateur n'a peut-être jamais passé de commande
    }
};

// Charger les données au montage du composant
onMounted(async () => {
    // 1. Restaurer l'utilisateur si déjà connecté
    if (authService.isAuthenticated()) {
        user.value = authService.getCurrentUser();
    }

    // 2. Charger les menus du jour depuis l'API
    loading.value = true;
    try {
        const menusData = await platService.getTodayMenus();

        // Transformer les données backend pour correspondre au format frontend
        menus.value = menusData.map((plat) => ({
            id: plat.id,
            title: plat.nom,
            description: plat.description,
            price: parseInt(plat.prix),
            image: plat.image_url || 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop',
            restauratrice: plat.restaurateur?.nom || 'Restaurant',
            quartier: plat.restaurateur?.quartier?.nom || 'Abidjan',
            type: plat.type_plat || 'plat',
            quantity: plat.quantite_disponible || 0,
            livraison: plat.livraison_disponible || false,
            tempsPreparation: plat.temps_preparation || '30 min',
            ingredients: plat.ingredients ? plat.ingredients.split(',').map((i) => i.trim()) : [],
            rating: plat.note_moyenne || 4.5,
            reviews: plat.nombre_avis || 0,
            paymentMethods: ['mobile_money', 'wave', 'orange_money', 'cash_delivery', 'cash_pickup'],
            restaurateur_id: plat.restaurateur_id
        }));

        console.log('Menus chargés:', menus.value.length);
    } catch (error) {
        console.error('Erreur chargement menus:', error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de charger les menus. Veuillez réessayer.',
            life: 5000
        });
    } finally {
        loading.value = false;
    }

    // 3. Charger les commandes si l'utilisateur est connecté
    if (user.value) {
        await loadOrders();
    }
});
</script>

<template>
    <!-- <router-view /> -->
    <div id="app" class="min-h-screen bg-[#FDF6EC] flex flex-col">
        <AppHeader @search="handleSearch" @login="handleLogin" @logout="handleLogout" @show-orders="handleShowOrders" :user="user" :pending-orders-count="pendingOrdersCount" />

        <main class="flex-1">
            <div class="container mx-auto px-4 py-6">
                <MenuFilters @filter-change="handleFilterChange" :quartiers="availableQuartiers" :types="availableTypes" />

                <!-- Indicateur de chargement -->
                <div v-if="loading" class="text-center py-12">
                    <i class="pi pi-spin pi-spinner text-4xl text-[#47A547]"></i>
                    <p class="text-gray-600 mt-4">Chargement des menus...</p>
                </div>

                <!-- Contenu principal -->
                <div v-else>
                    <!-- Results info -->
                    <div class="mb-6" id="menu-section">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-semibold text-[#4B2E1E]">
                                Menus disponibles
                                <span class="text-base font-normal text-gray-600"> ({{ totalFilteredMenus }} résultat{{ totalFilteredMenus > 1 ? 's' : '' }}) </span>
                            </h2>
                            <div class="text-sm text-gray-600" v-if="totalFilteredMenus > itemsPerPage">Page {{ currentPage + 1 }} sur {{ Math.ceil(totalFilteredMenus / itemsPerPage) }}</div>
                        </div>
                    </div>

                        <MenuGrid :menus="paginatedMenus" @add-to-cart="addToCart" @view-details="viewMenuDetails" />

                    <!-- Pagination -->
                    <div class="mt-8" v-if="totalFilteredMenus > itemsPerPage">
                        <Paginator
                            :first="currentPage * itemsPerPage"
                            :rows="itemsPerPage"
                            :totalRecords="totalFilteredMenus"
                            @page="onPageChange"
                            template="FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="Page {currentPage} sur {totalPages}"
                            class="bg-white rounded-lg shadow-sm border"
                        />
                    </div>

                    <!-- Message si aucun résultat -->
                    <div v-if="totalFilteredMenus === 0" class="text-center py-12">
                        <div class="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
                            <i class="pi pi-search text-4xl text-gray-400 mb-4"></i>
                            <h3 class="text-lg font-semibold text-[#4B2E1E] mb-2">Aucun menu trouvé</h3>
                            <p class="text-gray-600 mb-4">Essayez de modifier vos critères de recherche ou vos filtres.</p>
                            <button
                                @click="
                                    searchQuery = '';
                                    filters = { quartier: '', type: '', livraisonOnly: false, priceRange: [0, 10000] };
                                "
                                class="text-[#47A547] hover:text-[#3d8b3d] font-medium"
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    </div>
                </div>

                <CartSummary v-if="cartItems.length > 0" :items="cartItems" @view-cart="showCartDialog = true" />
            </div>
        </main>

        <AppFooter />

        <!-- Cart Dialog -->
        <Dialog v-model:visible="showCartDialog" header="Mon Panier" :modal="true" :style="{ width: '450px' }" :closable="true">
            <CartDetails :items="cartItems" :max-quantities="menuMaxQuantities" @update-quantity="updateCartItemQuantity" @remove-item="removeFromCart" @checkout="handleCheckout" />
        </Dialog>

        <!-- Menu Details Dialog -->
        <Dialog v-model:visible="showMenuDialog" :header="selectedMenu?.title" :modal="true" :style="{ width: '600px' }" :closable="true">
            <MenuDetails v-if="selectedMenu" :menu="selectedMenu" @add-to-cart="addToCart" @close="showMenuDialog = false" />
        </Dialog>

        <!-- Orders Modal -->
        <Dialog v-model:visible="showOrdersModal" modal header="Mes commandes" :style="{ width: '90vw', maxWidth: '1200px', height: '90vh' }" :closable="true">
            <OrdersHistory :user="user" :orders="orders" />
        </Dialog>

        <!-- Auth Modal -->
        <AuthModal v-model:visible="showAuthModal" @auth-success="handleAuthSuccess" />

        <!-- Payment Modal -->
        <PaymentModal v-model:visible="showPaymentModal" :orderData="orderData" @payment-success="handlePaymentSuccess" @payment-cancel="showPaymentModal = false" />

        <!-- Order Confirmation Dialog -->
        <Dialog v-model:visible="showOrderConfirmation" modal header="Commande confirmée !" :style="{ width: '600px', maxWidth: '95vw' }" :closable="true">
            <div v-if="lastCompletedOrder" class="space-y-6">
                <!-- En-tête avec icône de succès -->
                <div class="text-center">
                    <div class="w-16 h-16 bg-[#47A547] rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="pi pi-check text-white text-3xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-[#4B2E1E]">Merci pour votre commande !</h3>
                    <p class="text-gray-600 mt-1">Commande #{{ lastCompletedOrder.id.split('-')[1] }}</p>
                </div>

                <!-- Détails par restaurant -->
                <div class="space-y-3">
                    <h4 class="font-semibold text-[#4B2E1E]">Détail de votre commande</h4>
                    <div v-for="(restaurant, restaurantName) in lastCompletedOrder.restaurantOrders" :key="restaurantName" class="bg-[#FDF6EC] p-4 rounded-lg border">
                        <h5 class="font-semibold text-[#4B2E1E] mb-2">{{ restaurantName }}</h5>
                        <div class="space-y-1">
                            <div v-for="item in restaurant.items" :key="item.id" class="flex justify-between text-sm">
                                <span>{{ item.title }} x{{ item.quantity }}</span>
                                <span class="font-medium">{{ item.price * item.quantity }} FCFA</span>
                            </div>
                        </div>
                        <div v-if="restaurant.deliveryFee > 0" class="flex justify-between text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">
                            <span>Frais de livraison</span>
                            <span>{{ restaurant.deliveryFee }} FCFA</span>
                        </div>
                    </div>
                </div>

                <!-- Mode de livraison -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="flex items-center space-x-2 mb-2">
                        <i :class="lastCompletedOrder.deliveryMode === 'delivery' ? 'pi pi-truck text-[#47A547]' : 'pi pi-shopping-bag text-[#E6782C]'"></i>
                        <span class="font-semibold text-[#4B2E1E]">
                            {{ lastCompletedOrder.deliveryMode === 'delivery' ? 'Livraison à domicile' : 'Retrait sur place' }}
                        </span>
                    </div>
                    <div v-if="lastCompletedOrder.deliveryMode === 'delivery' && lastCompletedOrder.deliveryAddress" class="text-sm text-gray-600">
                        {{ lastCompletedOrder.deliveryAddress.street }}, {{ lastCompletedOrder.deliveryAddress.quartier }}{{ lastCompletedOrder.deliveryAddress.commune ? ', ' + lastCompletedOrder.deliveryAddress.commune : '' }}
                    </div>
                </div>

                <!-- Total -->
                <div class="bg-[#47A547] text-white p-4 rounded-lg flex justify-between items-center">
                    <span class="font-bold text-lg">Total</span>
                    <span class="font-bold text-xl">{{ lastCompletedOrder.totalAmount }} FCFA</span>
                </div>

                <!-- Message -->
                <div class="text-center text-gray-600 text-sm">
                    <p>Vos restauratrices préparent votre commande avec amour.</p>
                </div>

                <!-- Boutons -->
                <div class="flex space-x-3">
                    <Button label="Fermer" text class="flex-1 text-gray-600" @click="showOrderConfirmation = false" />
                    <Button label="Voir mes commandes" icon="pi pi-shopping-bag" class="flex-1 bg-[#47A547] hover:bg-[#3d8f3d] text-white" @click="showOrderConfirmation = false; showOrdersModal = true" />
                </div>
            </div>
        </Dialog>

        <!-- Toast Messages -->
        <Toast />
    </div>
</template>

<style>
/* Styles globaux pour respecter la charte graphique */
:root {
    --lelagali-green: #47a547;
    --lelagali-orange: #e6782c;
    --lelagali-beige: #fdf6ec;
    --lelagali-brown: #4b2e1e;
    --lelagali-yellow: #f8c346;
}

.p-button-success {
    background-color: var(--lelagali-green) !important;
    border-color: var(--lelagali-green) !important;
}

.p-button-warning {
    background-color: var(--lelagali-orange) !important;
    border-color: var(--lelagali-orange) !important;
}

.p-toast .p-toast-message {
    margin: 0 0 1rem 0;
}

/* Personnalisation du Paginator */
.p-paginator {
    background: white;
    color: var(--lelagali-brown);
    border: 1px solid #e5e7eb;
}

.p-paginator .p-paginator-pages .p-paginator-page {
    color: var(--lelagali-brown);
    border: 1px solid transparent;
    min-width: 2.5rem;
    height: 2.5rem;
    margin: 0 0.25rem;
    border-radius: 0.5rem;
}

.p-paginator .p-paginator-pages .p-paginator-page:hover {
    background-color: var(--lelagali-beige);
    border-color: var(--lelagali-green);
}

.p-paginator .p-paginator-pages .p-paginator-page.p-highlight {
    background-color: var(--lelagali-green);
    color: white;
    border-color: var(--lelagali-green);
}

.p-paginator .p-paginator-first,
.p-paginator .p-paginator-prev,
.p-paginator .p-paginator-next,
.p-paginator .p-paginator-last {
    color: var(--lelagali-brown);
    border: 1px solid #e5e7eb;
    min-width: 2.5rem;
    height: 2.5rem;
    margin: 0 0.25rem;
    border-radius: 0.5rem;
}

.p-paginator .p-paginator-first:hover,
.p-paginator .p-paginator-prev:hover,
.p-paginator .p-paginator-next:hover,
.p-paginator .p-paginator-last:hover {
    background-color: var(--lelagali-beige);
    border-color: var(--lelagali-green);
}

.p-paginator .p-paginator-current {
    color: var(--lelagali-brown);
    font-weight: 600;
}

:root {
    --lelagali-green: #47a547;
    --lelagali-green-50: #f2f8f2;
    --lelagali-green-100: #e4f2e4;
    --lelagali-green-200: #c9e4c9;
    --lelagali-green-300: #aed7ae;
    --lelagali-green-400: #93c993;
    --lelagali-green-500: #47a547;
    --lelagali-green-600: #3a843a;
    --lelagali-green-700: #2d632d;
    --lelagali-green-800: #204220;
    --lelagali-green-900: #132113;
    --lelagali-green-950: #060f06;
}

.p-button-success {
    background-color: var(--lelagali-green) !important;
    border-color: var(--lelagali-green) !important;
}

.p-button-success:hover {
    background-color: var(--lelagali-green-600) !important;
    border-color: var(--lelagali-green-600) !important;
}

.text-lelagali-green {
    color: var(--lelagali-green);
}

.bg-lelagali-green {
    background-color: var(--lelagali-green);
}

.border-lelagali-green {
    border-color: var(--lelagali-green);
}
</style>
