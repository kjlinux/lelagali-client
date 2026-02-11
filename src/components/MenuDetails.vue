<script setup>
import Card from 'primevue/card';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Tag from 'primevue/tag';
import Rating from 'primevue/rating';

defineProps({
    menu: Object
});

defineEmits(['add-to-cart', 'close']);
</script>

<template>
    <div class="space-y-4">
        <img :src="menu.image" :alt="menu.title" class="w-full h-64 object-cover rounded-lg" />

        <div class="space-y-3">
            <div class="flex items-start justify-between">
                <div>
                    <h3 class="text-xl font-bold text-[#4B2E1E]">{{ menu.title }}</h3>
                    <p class="text-[#E6782C] font-medium">{{ menu.restauratrice }}</p>
                </div>
                <div class="text-right">
                    <div class="text-2xl font-bold text-[#47A547]">{{ menu.price }} FCFA</div>
                    <div class="text-sm text-gray-600">{{ menu.quantity }} portions disponibles</div>
                </div>
            </div>

            <p class="text-gray-700">{{ menu.description }}</p>

            <div class="grid grid-cols-2 gap-4 py-4">
                <div class="text-center p-3 bg-[#FDF6EC] rounded-lg">
                    <i class="pi pi-clock text-[#E6782C] text-xl mb-2"></i>
                    <div class="text-sm font-medium text-[#4B2E1E]">Temps de préparation</div>
                    <div class="text-sm text-gray-600">{{ menu.tempsPreparation }}</div>
                </div>

                <div class="text-center p-3 bg-[#FDF6EC] rounded-lg">
                    <i class="pi pi-map-marker text-[#E6782C] text-xl mb-2"></i>
                    <div class="text-sm font-medium text-[#4B2E1E]">Quartier</div>
                    <div class="text-sm text-gray-600">{{ menu.quartier }}</div>
                </div>
            </div>

            <div class="space-y-2">
                <h4 class="font-semibold text-[#4B2E1E]">Ingrédients :</h4>
                <div class="flex flex-wrap gap-2">
                    <Tag v-for="ingredient in menu.ingredients" :key="ingredient" :value="ingredient" class="bg-[#47A547] text-white text-xs" />
                </div>
            </div>

            <div class="space-y-3">
                <div class="flex items-center space-x-4">
                    <Rating v-model="menu.rating" readonly :cancel="false" class="text-[#F8C346]" />
                    <span class="text-sm text-gray-600">{{ menu.reviews }} avis</span>
                </div>

                <div>
                    <h4 class="font-semibold text-[#4B2E1E] mb-2">Options de service :</h4>
                    <div class="flex flex-wrap gap-2">
                        <Tag v-if="menu.livraison" icon="pi pi-truck" value="Livraison disponible" class="bg-[#47A547] text-white" />
                        <Tag v-if="menu.retrait" icon="pi pi-shopping-bag" value="Retrait disponible" class="bg-[#3B82F6] text-white" />
                        <Tag v-if="!menu.livraison && !menu.retrait" value="Non disponible" class="bg-gray-400 text-white" />
                    </div>
                </div>
            </div>
        </div>

        <div class="flex space-x-2 pt-4 border-t">
            <Button label="Fermer" text class="flex-1 text-gray-600" @click="$emit('close')" />
            <Button label="Ajouter au panier" icon="pi pi-shopping-cart" class="flex-1 bg-[#47A547] hover:bg-[#3d8f3d] text-white" @click="$emit('add-to-cart', menu)" :disabled="menu.quantity === 0" />
        </div>
    </div>
</template>
