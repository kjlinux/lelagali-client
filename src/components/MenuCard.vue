<script setup>
import Card from 'primevue/card';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Tag from 'primevue/tag';
import Rating from 'primevue/rating';

defineProps({
    menu: Object
});

defineEmits(['add-to-cart', 'view-details']);
</script>

<template>
    <Card class="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <template #header>
            <div class="relative">
                <img :src="menu.image" :alt="menu.title" class="w-full h-48 object-cover" />
                <Badge :value="`${menu.price} FCFA`" class="absolute top-3 right-3 bg-[#47A547] text-white" />
                <Badge v-if="menu.quantity <= 5" value="Stock limité" severity="warning" class="absolute top-3 left-3" />
            </div>
        </template>

        <template #content>
            <div class="space-y-3">
                <div class="flex items-start justify-between">
                    <h4 class="font-bold text-[#4B2E1E] text-lg leading-tight">{{ menu.title }}</h4>
                    <Tag :value="menu.quartier" class="bg-[#E6782C] text-white text-xs" />
                </div>

                <p class="text-gray-600 text-sm line-clamp-2">{{ menu.description }}</p>

                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center space-x-2">
                        <i class="pi pi-user text-[#47A547]"></i>
                        <span class="text-[#47A547] font-medium">{{ menu.restauratrice }}</span>
                    </div>
                    <span class="text-gray-500">{{ menu.quantity }} portions</span>
                </div>

                <div class="flex items-center space-x-2">
                    <Rating v-model="menu.rating" readonly :cancel="false" class="text-[#F8C346]" />
                    <span class="text-sm text-gray-500">({{ menu.reviews }} avis)</span>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2 text-sm text-gray-600">
                        <i class="pi pi-clock"></i>
                        <span>{{ menu.tempsPreparation }}</span>
                    </div>
                    <div class="flex items-center space-x-1">
                        <Tag :value="menu.livraison ? 'Livraison' : 'Retrait'" :class="menu.livraison ? 'bg-[#47A547]' : 'bg-[#E6782C]'" class="text-white text-xs" />
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex space-x-2">
                <Button label="Précommander" icon="pi pi-shopping-cart" class="flex-1 bg-[#47A547] hover:bg-[#3d8f3d] text-white" @click="$emit('add-to-cart')" :disabled="menu.quantity === 0" />
                <Button icon="pi pi-eye" class="bg-[#E6782C] hover:bg-[#d66a25] text-white" @click="$emit('view-details')" />
            </div>
        </template>
    </Card>
</template>
