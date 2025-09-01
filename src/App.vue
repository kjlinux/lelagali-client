<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import AppHeader from './components/AppHeader.vue';
import MenuFilters from './components/MenuFilters.vue';
import MenuGrid from './components/MenuGrid.vue';
import CartSummary from './components/CartSummary.vue';
import CartDetails from './components/CartDetails.vue';
import MenuDetails from './components/MenuDetails.vue';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';

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
const selectedMenu = ref(null);

// Sample data - En production, ceci viendrait d'une API
const menus = ref([
    {
        id: 1,
        title: 'Attiéké Poisson Braisé',
        description: 'Attiéké frais accompagné de poisson braisé et sa sauce tomate épicée aux légumes locaux',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        restauratrice: 'Maman Adjoua',
        quartier: 'Plateau',
        type: 'attiéké',
        quantity: 15,
        livraison: true,
        tempsPreparation: '30 min',
        ingredients: ['Attiéké', 'Poisson frais', 'Tomates', 'Oignons', 'Piment'],
        rating: 4.5,
        reviews: 23
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
        reviews: 45
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
        reviews: 18
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
        reviews: 32
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
        reviews: 28
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

const totalCartPrice = computed(() => {
    return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0);
});

// Methods
const handleSearch = (query) => {
    searchQuery.value = query;
};

const handleFilterChange = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters };
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

const handleCheckout = () => {
    // Simulation du processus de commande
    toast.add({
        severity: 'success',
        summary: 'Commande validée',
        detail: 'Votre commande a été transmise aux restauratrices',
        life: 5000
    });
    cartItems.value = [];
    showCartDialog.value = false;
};

onMounted(() => {
    // Simulation du chargement des données
    toast.add({
        severity: 'info',
        summary: 'Bienvenue sur LeLagaLi',
        detail: 'Découvrez les menus disponibles pour demain',
        life: 4000
    });
});
</script>

<template>
    <div id="app" class="min-h-screen bg-[#FDF6EC]">
        <AppHeader @search="handleSearch" />

        <div class="container mx-auto px-4 py-6">
            <MenuFilters @filter-change="handleFilterChange" :quartiers="availableQuartiers" :types="availableTypes" />

            <MenuGrid :menus="filteredMenus" @add-to-cart="addToCart" @view-details="viewMenuDetails" />

            <CartSummary v-if="cartItems.length > 0" :items="cartItems" @view-cart="showCartDialog = true" />
        </div>

        <!-- Cart Dialog -->
        <Dialog v-model:visible="showCartDialog" header="Mon Panier" :modal="true" :style="{ width: '450px' }" :closable="true">
            <CartDetails :items="cartItems" @update-quantity="updateCartItemQuantity" @remove-item="removeFromCart" @checkout="handleCheckout" />
        </Dialog>

        <!-- Menu Details Dialog -->
        <Dialog v-model:visible="showMenuDialog" :header="selectedMenu?.title" :modal="true" :style="{ width: '600px' }" :closable="true">
            <MenuDetails v-if="selectedMenu" :menu="selectedMenu" @add-to-cart="addToCart" @close="showMenuDialog = false" />
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
</style>
