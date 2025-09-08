<script setup>
import Dialog from 'primevue/dialog';
import Paginator from 'primevue/paginator';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { computed, ref } from 'vue';
import AppFooter from './components/AppFooter.vue';
import AppHeader from './components/AppHeader.vue';
import AuthModal from './components/AuthModal.vue';
import CartDetails from './components/CartDetails.vue';
import CartSummary from './components/CartSummary.vue';
import MenuDetails from './components/MenuDetails.vue';
import MenuFilters from './components/MenuFilters.vue';
import MenuGrid from './components/MenuGrid.vue';
import PaymentModal from './components/PaymentModal.vue';

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
const user = ref({ name: 'Jean Dupont' });
const orderData = ref(null);

// Pagination state
const currentPage = ref(0);
const itemsPerPage = ref(9);

// Données d'exemple des commandes (même que dans OrdersHistory)
const orders = ref([
    {
        id: 'CMD-1704878400000',
        date: new Date('2025-01-10T14:30:00'),
        totalAmount: 3500,
        deliveryMode: 'delivery',
        status: 'delivered',
        deliveryAddress: {
            street: 'Rue des Palmiers, Villa 23',
            quartier: 'Cocody',
            commune: 'Cocody',
            phone: '+225 07 12 34 56 78'
        },
        restaurantOrders: {
            'Maman Adjoua': {
                items: [{ id: 1, title: 'Attiéké Poisson', quantity: 2, price: 1500 }],
                paymentMethod: 'mobile_money',
                amount: 3500,
                deliveryFee: 500,
                status: 'delivered',
                deliveredItems: [{ id: 1, title: 'Attiéké Poisson', quantity: 2, price: 1500 }],
                pickupItems: []
            }
        }
    },
    {
        id: 'CMD-1704964800000',
        date: new Date('2025-01-11T12:15:00'),
        totalAmount: 2000,
        deliveryMode: 'pickup',
        status: 'ready_for_pickup',
        restaurantOrders: {
            'Tante Fatou': {
                items: [{ id: 2, title: 'Riz Gras au Poulet', quantity: 1, price: 2000 }],
                paymentMethod: 'cash_pickup',
                amount: 2000,
                deliveryFee: 0,
                status: 'ready_for_pickup',
                deliveredItems: [],
                pickupItems: [{ id: 2, title: 'Riz Gras au Poulet', quantity: 1, price: 2000 }]
            }
        }
    },
    {
        id: 'CMD-1705051200000',
        date: new Date('2025-01-12T18:45:00'),
        totalAmount: 4500,
        deliveryMode: 'delivery',
        status: 'in_delivery',
        deliveryAddress: {
            street: 'Boulevard Lagunaire, Résidence Palmier',
            quartier: 'Angré',
            commune: 'Cocody',
            phone: '+225 07 87 65 43 21'
        },
        restaurantOrders: {
            'Maman Koffi': {
                items: [
                    { id: 3, title: 'Foutou Igname Sauce Graine', quantity: 1, price: 2000 },
                    { id: 4, title: 'Alloco Poisson', quantity: 1, price: 2000 }
                ],
                paymentMethod: 'wave',
                amount: 4500,
                deliveryFee: 500,
                status: 'in_delivery',
                deliveredItems: [
                    { id: 3, title: 'Foutou Igname Sauce Graine', quantity: 1, price: 2000 },
                    { id: 4, title: 'Alloco Poisson', quantity: 1, price: 2000 }
                ],
                pickupItems: []
            }
        }
    },
    {
        id: 'CMD-1705137600000',
        date: new Date('2025-01-13T16:20:00'),
        totalAmount: 5000,
        deliveryMode: 'delivery',
        status: 'mixed_status',
        deliveryAddress: {
            street: 'Carrefour Soleil, Immeuble ABC',
            quartier: 'Treichville',
            commune: 'Treichville',
            phone: '+225 05 44 33 22 11'
        },
        restaurantOrders: {
            'Tantie Aya': {
                items: [{ id: 5, title: 'Kedjenou de Poulet', quantity: 1, price: 2500 }],
                paymentMethod: 'orange_money',
                amount: 3000,
                deliveryFee: 500,
                status: 'ready_for_delivery',
                deliveredItems: [{ id: 5, title: 'Kedjenou de Poulet', quantity: 1, price: 2500 }],
                pickupItems: []
            },
            'Maman Ama': {
                items: [{ id: 6, title: 'Bangui aux Crevettes', quantity: 1, price: 2000 }],
                paymentMethod: 'cash_pickup',
                amount: 2000,
                deliveryFee: 0,
                status: 'ready_for_pickup',
                deliveredItems: [],
                pickupItems: [{ id: 6, title: 'Bangui aux Crevettes', quantity: 1, price: 2000 }]
            }
        }
    }
]);

// Calculer les commandes en cours
const currentOrders = computed(() => orders.value.filter((order) => ['preparing', 'ready_for_pickup', 'ready_for_delivery', 'in_delivery', 'mixed_status'].includes(order.status)));

// Calculer le nombre de commandes en préparation
const pendingOrdersCount = computed(() => {
    return currentOrders.value.length;
});

// Sample data - En production, ceci viendrait d'une API
const menus = ref([
    {
        id: 1,
        title: 'Attiéké Poisson Braisé',
        description: 'Attiéké frais accompagné de poisson braisé et sa sauce tomate épicée aux légumes locaux',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop',
        restauratrice: 'Maman Adjoua',
        quartier: 'Plateau',
        type: 'attiéké',
        quantity: 15,
        livraison: true,
        tempsPreparation: '30 min',
        ingredients: ['Attiéké', 'Poisson frais', 'Tomates', 'Oignons', 'Piment'],
        rating: 4.5,
        reviews: 23,
        paymentMethods: ['mobile_money', 'wave', 'orange_money', 'cash_delivery', 'cash_pickup']
    },
    {
        id: 2,
        title: 'Riz au Gras Traditionnel',
        description: "Riz parfumé cuit dans l'huile de palme rouge avec légumes et viande de choix",
        price: 3000,
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop',
        restauratrice: 'Tante Fatou',
        quartier: 'Cocody',
        type: 'riz',
        quantity: 20,
        livraison: true,
        tempsPreparation: '45 min',
        ingredients: ['Riz jasmin', 'Huile de palme', 'Viande de bœuf', 'Légumes variés'],
        rating: 4.8,
        reviews: 45,
        paymentMethods: ['mobile_money', 'orange_money', 'cash_delivery']
    },
    {
        id: 3,
        title: 'Foutou Sauce Arachide',
        description: "Foutou d'igname pilé servi avec sauce arachide crémeuse et viande de bœuf tendre",
        price: 2800,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
        restauratrice: 'Maman Koffi',
        quartier: 'Yopougon',
        type: 'foutou',
        quantity: 12,
        livraison: false,
        tempsPreparation: '50 min',
        ingredients: ['Igname', 'Arachides', 'Viande de bœuf', 'Épices locales'],
        rating: 4.3,
        reviews: 18,
        paymentMethods: ['cash_pickup', 'mobile_money']
    },
    {
        id: 4,
        title: 'Attieké Poulet Kedjenou',
        description: 'Attieké servi avec poulet kedjenou mijoté aux légumes et épices traditionnelles',
        price: 3200,
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
        restauratrice: 'Tantie Aya',
        quartier: 'Plateau',
        type: 'attiéké',
        quantity: 18,
        livraison: true,
        tempsPreparation: '40 min',
        ingredients: ['Attiéké', 'Poulet fermier', 'Légumes du jardin', 'Épices kedjenou'],
        rating: 4.7,
        reviews: 32,
        paymentMethods: ['wave', 'orange_money', 'cash_delivery', 'cash_pickup']
    },
    {
        id: 5,
        title: 'Riz Sauce Gombo',
        description: 'Riz blanc accompagné de sauce gombo avec poisson fumé et crevettes',
        price: 2700,
        image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
        restauratrice: 'Maman Ama',
        quartier: 'Cocody',
        type: 'riz',
        quantity: 25,
        livraison: true,
        tempsPreparation: '35 min',
        ingredients: ['Riz', 'Gombo frais', 'Poisson fumé', 'Crevettes', 'Épices'],
        rating: 4.4,
        reviews: 28,
        paymentMethods: ['mobile_money', 'wave', 'cash_delivery']
    },
    // 👇 6 nouveaux plats
    {
        id: 6,
        title: 'Placali Sauce Graine',
        description: 'Placali à base de farine de manioc accompagné de sauce graine aux poissons fumés',
        price: 2600,
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop',
        restauratrice: 'Maman Akissi',
        quartier: 'Treichville',
        type: 'placali',
        quantity: 10,
        livraison: true,
        tempsPreparation: '55 min',
        ingredients: ['Placali', 'Sauce graine', 'Poisson fumé', 'Crabe', 'Épices'],
        rating: 4.6,
        reviews: 20,
        paymentMethods: ['mobile_money', 'cash_delivery', 'cash_pickup']
    },
    {
        id: 7,
        title: 'Garba Spécial',
        description: 'Attiéké garba avec thon frit, piment frais et tomate oignon',
        price: 1500,
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop',
        restauratrice: 'Moussa Garba',
        quartier: 'Adjamé',
        type: 'attiéké',
        quantity: 50,
        livraison: false,
        tempsPreparation: '15 min',
        ingredients: ['Attiéké', 'Thon frit', 'Piment', 'Tomates', 'Oignons'],
        rating: 4.2,
        reviews: 70,
        paymentMethods: ['cash_pickup']
    },
    {
        id: 8,
        title: 'Sauce Claire aux Escargots',
        description: 'Sauce claire traditionnelle servie avec escargots et riz blanc',
        price: 3500,
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop',
        restauratrice: 'Tantie Awa',
        quartier: 'Cocody',
        type: 'riz',
        quantity: 8,
        livraison: true,
        tempsPreparation: '60 min',
        ingredients: ['Riz blanc', 'Escargots', 'Aubergines', 'Épices locales'],
        rating: 4.9,
        reviews: 15,
        paymentMethods: ['mobile_money', 'wave', 'cash_delivery']
    },
    {
        id: 9,
        title: 'Kedjenou de Poisson',
        description: 'Poisson braisé en kedjenou avec légumes frais, servi avec attiéké',
        price: 3000,
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
        restauratrice: 'Papa Kader',
        quartier: 'Marcory',
        type: 'attiéké',
        quantity: 14,
        livraison: true,
        tempsPreparation: '40 min',
        ingredients: ['Poisson frais', 'Attiéké', 'Tomates', 'Oignons', 'Piments'],
        rating: 4.5,
        reviews: 24,
        paymentMethods: ['mobile_money', 'orange_money', 'cash_delivery']
    },
    {
        id: 10,
        title: 'Foutou Banane Sauce Graine',
        description: 'Foutou banane servi avec une sauce graine onctueuse au poulet fumé',
        price: 2800,
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop',
        restauratrice: 'Maman Clémentine',
        quartier: 'Koumassi',
        type: 'foutou',
        quantity: 11,
        livraison: true,
        tempsPreparation: '50 min',
        ingredients: ['Banane plantain', 'Sauce graine', 'Poulet fumé', 'Épices'],
        rating: 4.7,
        reviews: 19,
        paymentMethods: ['wave', 'cash_delivery', 'cash_pickup']
    },
    {
        id: 11,
        title: 'Riz Sauce Aubergine',
        description: 'Riz blanc accompagné de sauce aubergine avec poisson fumé et viande',
        price: 2700,
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop',
        restauratrice: 'Maman Fanta',
        quartier: 'Abobo',
        type: 'riz',
        quantity: 22,
        livraison: true,
        tempsPreparation: '45 min',
        ingredients: ['Riz blanc', 'Aubergine', 'Poisson fumé', 'Viande', 'Épices locales'],
        rating: 4.4,
        reviews: 25,
        paymentMethods: ['mobile_money', 'cash_delivery']
    }
]);

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
    const existingItem = cartItems.value.find((item) => item.id === menu.id);

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

const handleAuthSuccess = (userData) => {
    user.value = userData;
    showAuthModal.value = false;

    toast.add({
        severity: 'success',
        summary: 'Connexion réussie',
        detail: `Bienvenue ${userData.name} !`,
        life: 3000
    });

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

const handlePaymentSuccess = () => {
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

const handleLogout = () => {
    user.value = null;
    toast.add({
        severity: 'info',
        summary: 'Déconnexion',
        detail: 'À bientôt !',
        life: 3000
    });
};
</script>

<template>
    <!-- <router-view /> -->
    <div id="app" class="min-h-screen bg-[#FDF6EC] flex flex-col">
        <AppHeader @search="handleSearch" @login="handleLogin" @logout="handleLogout" @show-orders="handleShowOrders" :user="user" :pending-orders-count="pendingOrdersCount" />

        <main class="flex-1">
            <div class="container mx-auto px-4 py-6">
                <MenuFilters @filter-change="handleFilterChange" :quartiers="availableQuartiers" :types="availableTypes" />

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

                <CartSummary v-if="cartItems.length > 0" :items="cartItems" @view-cart="showCartDialog = true" />
            </div>
        </main>

        <AppFooter />

        <!-- Cart Dialog -->
        <Dialog v-model:visible="showCartDialog" header="Mon Panier" :modal="true" :style="{ width: '450px' }" :closable="true">
            <CartDetails :items="cartItems" @update-quantity="updateCartItemQuantity" @remove-item="removeFromCart" @checkout="handleCheckout" />
        </Dialog>

        <!-- Menu Details Dialog -->
        <Dialog v-model:visible="showMenuDialog" :header="selectedMenu?.title" :modal="true" :style="{ width: '600px' }" :closable="true">
            <MenuDetails v-if="selectedMenu" :menu="selectedMenu" @add-to-cart="addToCart" @close="showMenuDialog = false" />
        </Dialog>

        <!-- Orders Modal -->
        <Dialog v-model:visible="showOrdersModal" modal header="Mes commandes" :style="{ width: '90vw', maxWidth: '1200px', height: '90vh' }" :closable="true">
            <OrdersHistory :user="user" />
        </Dialog>

        <!-- Auth Modal -->
        <AuthModal v-model:visible="showAuthModal" @auth-success="handleAuthSuccess" />

        <!-- Payment Modal -->
        <PaymentModal v-model:visible="showPaymentModal" :orderData="orderData" @payment-success="handlePaymentSuccess" @payment-cancel="showPaymentModal = false" />

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
