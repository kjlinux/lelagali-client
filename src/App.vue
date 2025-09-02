<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import AppHeader from './components/AppHeader.vue';
import MenuFilters from './components/MenuFilters.vue';
import MenuGrid from './components/MenuGrid.vue';
import CartSummary from './components/CartSummary.vue';
import CartDetails from './components/CartDetails.vue';
import MenuDetails from './components/MenuDetails.vue';
import AppFooter from './components/AppFooter.vue';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import Paginator from 'primevue/paginator';

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

// Pagination state
const currentPage = ref(0);
const itemsPerPage = ref(10);

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
    },
    {
        id: 6,
        title: 'Bangui Sauce Graines',
        description: 'Bangui croustillant servi avec sauce graines riche et parfumée',
        price: 2400,
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop',
        restauratrice: 'Maman Akissi',
        quartier: 'Treichville',
        type: 'bangui',
        quantity: 10,
        livraison: true,
        tempsPreparation: '25 min',
        ingredients: ['Bangui', 'Graines de palmiste', 'Poisson', 'Légumes'],
        rating: 4.2,
        reviews: 15
    },
    {
        id: 7,
        title: 'Placali Sauce Claire',
        description: 'Placali moelleux accompagné de sauce claire aux légumes et poisson frais',
        price: 2200,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
        restauratrice: 'Tante Mariama',
        quartier: 'Adjamé',
        type: 'placali',
        quantity: 14,
        livraison: false,
        tempsPreparation: '35 min',
        ingredients: ['Manioc', 'Poisson frais', 'Légumes verts', 'Épices'],
        rating: 4.0,
        reviews: 12
    },
    {
        id: 8,
        title: 'Attiéké Thon Grillé',
        description: 'Attiéké frais avec thon grillé aux épices et légumes croquants',
        price: 2600,
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop',
        restauratrice: 'Maman Binta',
        quartier: 'Marcory',
        type: 'attiéké',
        quantity: 20,
        livraison: true,
        tempsPreparation: '25 min',
        ingredients: ['Attiéké', 'Thon frais', 'Légumes', 'Épices grillades'],
        rating: 4.6,
        reviews: 38
    },
    {
        id: 9,
        title: 'Riz Sauce Tomate',
        description: 'Riz jasmin servi avec sauce tomate maison et morceaux de viande',
        price: 2300,
        image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop',
        restauratrice: 'Tantie Aicha',
        quartier: 'Koumassi',
        type: 'riz',
        quantity: 30,
        livraison: true,
        tempsPreparation: '30 min',
        ingredients: ['Riz jasmin', 'Tomates fraîches', 'Viande', 'Oignons'],
        rating: 4.1,
        reviews: 22
    },
    {
        id: 10,
        title: 'Foutou Sauce Épinard',
        description: "Foutou d'igname accompagné de sauce épinard riche en fer et protéines",
        price: 2900,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
        restauratrice: 'Maman Gnagne',
        quartier: 'Port-Bouët',
        type: 'foutou',
        quantity: 8,
        livraison: false,
        tempsPreparation: '40 min',
        ingredients: ['Igname', 'Épinards frais', 'Poisson fumé', 'Huile de palme'],
        rating: 4.4,
        reviews: 19
    },
    {
        id: 11,
        title: 'Alloco Sauce Piment',
        description: 'Bananes plantains frites servies avec sauce piment piquante',
        price: 1800,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
        restauratrice: 'Maman Hawa',
        quartier: 'Abobo',
        type: 'alloco',
        quantity: 25,
        livraison: true,
        tempsPreparation: '15 min',
        ingredients: ['Bananes plantains', 'Huile', 'Piment', 'Oignons'],
        rating: 4.3,
        reviews: 41
    },
    {
        id: 12,
        title: 'Garba Complet',
        description: 'Attiéké avec thon, œuf dur, tomate et avocat - le plat complet',
        price: 2000,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop',
        restauratrice: 'Frère Moussa',
        quartier: 'Plateau',
        type: 'attiéké',
        quantity: 35,
        livraison: true,
        tempsPreparation: '20 min',
        ingredients: ['Attiéké', 'Thon', 'Œuf', 'Tomate', 'Avocat'],
        rating: 4.7,
        reviews: 67
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
    currentPage.value = 0; // Reset to first page when searching
};

const handleFilterChange = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters };
    currentPage.value = 0; // Reset to first page when filtering
};

const onPageChange = (event) => {
    currentPage.value = event.page;
    // Scroll to top of menu grid
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
    <div id="app" class="min-h-screen bg-[#FDF6EC] flex flex-col">
        <AppHeader @search="handleSearch" />

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
</style>
