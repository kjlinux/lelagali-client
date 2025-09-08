<script setup>
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import Badge from 'primevue/badge';
import { ref } from 'vue';

const props = defineProps({
    user: {
        type: Object,
        default: null
    },
    pendingOrdersCount: {
        type: Number,
        default: 0
    }
});

const mobileSearch = ref('');
const desktopSearch = ref('');
const userMenu = ref();

const userMenuItems = ref([
    {
        label: 'Mes commandes',
        icon: 'pi pi-shopping-bag',
        command: () => {
            emit('show-orders');
        }
    },
    {
        label: 'Mon profil',
        icon: 'pi pi-user',
        command: () => {
            // Navigation vers le profil
        }
    },
    {
        separator: true
    },
    {
        label: 'Se déconnecter',
        icon: 'pi pi-sign-out',
        command: () => {
            emit('logout');
        }
    }
]);

const emit = defineEmits(['search', 'login', 'logout', 'show-orders']);

const toggleUserMenu = (event) => {
    userMenu.value.toggle(event);
};
</script>

<template>
    <header class="bg-white shadow-sm border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20">
                <!-- Logo -->
                <div class="flex items-center space-x-3">
                    <img src="/pic.jpg" alt="Logo LeLagaLi" class="w-16 h-16 object-cover" />
                </div>

                <!-- Navigation Desktop -->
                <nav class="hidden md:flex space-x-6">
                    <Button label="Accueil" text class="text-[#4B2E1E] hover:text-[#47A547] font-medium" />
                    <div class="relative">
                        <Button label="Mes commandes" text class="text-[#4B2E1E] hover:text-[#47A547] font-medium" @click="$emit('show-orders')" />
                        <Badge v-if="pendingOrdersCount > 0" :value="pendingOrdersCount" class="absolute -top-2 -right-2 bg-[#E6782C]" />
                    </div>
                </nav>

                <!-- Search Bar Mobile -->
                <div class="md:hidden flex-1 mx-4">
                    <InputText v-model="mobileSearch" placeholder="Rechercher..." class="w-full" @input="$emit('search', mobileSearch)" />
                </div>

                <!-- Auth Section -->
                <div class="flex items-center space-x-3">
                    <!-- Si utilisateur connecté -->
                    <div v-if="user" class="flex items-center space-x-3">
                        <span class="hidden sm:inline text-[#4B2E1E] font-medium"> Bonjour, {{ user.name.split(' ')[0] }} </span>
                        <Button class="bg-[#47A547] hover:bg-[#3d8b3d] text-white p-2" icon="pi pi-user" rounded @click="toggleUserMenu" aria-label="Menu utilisateur" />
                        <Menu ref="userMenu" :model="userMenuItems" popup class="mt-2" />
                    </div>

                    <!-- Si utilisateur non connecté -->
                    <Button v-else label="Se connecter" class="bg-[#E6782C] hover:bg-[#d66a25] text-white font-medium" @click="$emit('login')" />
                </div>
            </div>
        </div>

        <!-- Hero Section -->
        <section class="relative text-white py-12 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-r from-[#47A547] via-[#E6782C] to-[#47A547] bg-[length:200%_100%] animate-gradient-x"></div>
            <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Votre plat sain, à portée de clic</h2>
                <p class="text-lg md:text-xl mb-8 opacity-90">Découvrez les saveurs authentiques d'Afrique, préparées avec amour par nos restauratrices locales</p>

                <!-- Search Bar Desktop -->
                <div class="hidden md:flex gap-4 justify-center max-w-md mx-auto">
                    <InputText v-model="desktopSearch" placeholder="Rechercher un plat ou quartier..." class="flex-1 p-3 text-gray-800" @input="$emit('search', desktopSearch)" />
                    <Button label="Rechercher" class="bg-[#F8C346] hover:bg-[#f5b935] text-[#4B2E1E] px-6 py-3 font-semibold" />
                </div>
            </div>
        </section>
    </header>
</template>

<style scoped>
/* Animation pour le dégradé */
@keyframes gradient-x {
    0%,
    100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
}

.animate-gradient-x {
    animation: gradient-x 4s ease infinite;
}

/* Styles pour le menu utilisateur */
:deep(.p-menu) {
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
}

:deep(.p-menuitem-link) {
    padding: 12px 16px;
    border-radius: 6px;
    margin: 4px;
    transition: all 0.2s;
}

:deep(.p-menuitem-link:hover) {
    background-color: #fdf6ec;
    color: #47a547;
}

:deep(.p-menuitem-icon) {
    color: #4b2e1e;
    margin-right: 8px;
}

:deep(.p-menuitem-link:hover .p-menuitem-icon) {
    color: #47a547;
}

/* Style pour le badge de notification */
:deep(.p-badge) {
    min-width: 1.2rem;
    height: 1.2rem;
    line-height: 1.2rem;
    font-size: 0.75rem;
}
</style>
