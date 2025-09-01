<script setup>
import { ref } from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';

const mobileSearch = ref('');
const desktopSearch = ref('');

defineEmits(['search']);
</script>

<template>
    <header class="bg-white shadow-sm border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <!-- Logo -->
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-[#47A547] rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-lg">L</span>
                    </div>
                    <h1 class="text-2xl font-bold text-[#4B2E1E]">LeLagaLi</h1>
                </div>

                <!-- Navigation Desktop -->
                <nav class="hidden md:flex space-x-6">
                    <Button label="Accueil" text class="text-[#4B2E1E] hover:text-[#47A547] font-medium" />
                    <Button label="Menus" text class="text-[#4B2E1E] hover:text-[#47A547] font-medium" />
                    <Button label="Mes commandes" text class="text-[#4B2E1E] hover:text-[#47A547] font-medium" />
                </nav>

                <!-- Search Bar Mobile -->
                <div class="md:hidden flex-1 mx-4">
                    <InputText v-model="mobileSearch" placeholder="Rechercher..." class="w-full" @input="$emit('search', mobileSearch)" />
                </div>

                <!-- Auth Button -->
                <Button label="Se connecter" class="bg-[#E6782C] text-white hover:bg-[#d66a25]" />
            </div>
        </div>

        <!-- Hero Section -->
        <section class="bg-gradient-to-r from-[#47A547] to-[#E6782C] text-white py-12">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Votre plat sain, à portée de clic</h2>
                <p class="text-lg md:text-xl mb-8 opacity-90">Découvrez les saveurs authentiques d'Afrique, préparées avec amour par nos restauratrices locales</p>

                <!-- Search Bar Desktop -->
                <div class="hidden md:flex gap-4 justify-center max-w-md mx-auto">
                    <InputText v-model="desktopSearch" placeholder="Rechercher un plat ou quartier..." class="flex-1 p-3 text-gray-800" @input="$emit('search', desktopSearch)" />
                    <Button label="Rechercher" class="bg-[#F8C346] text-[#4B2E1E] hover:bg-[#f5b935] px-6 py-3 font-semibold" />
                </div>
            </div>
        </section>
    </header>
</template>
