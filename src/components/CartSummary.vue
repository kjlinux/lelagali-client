<script setup>
import { computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Badge from 'primevue/badge';

const props = defineProps({
    items: Array
});

defineEmits(['view-cart']);

const totalPrice = computed(() => {
    return props.items.reduce((total, item) => total + item.price * item.quantity, 0);
});
</script>

<template>
    <div class="fixed bottom-4 right-4 z-50">
        <Card class="bg-[#F8C346] text-[#4B2E1E] shadow-lg">
            <template #content>
                <div class="flex items-center space-x-4">
                    <div class="text-center">
                        <Badge :value="items.length" class="bg-[#E6782C] text-white mb-1" />
                        <div class="text-sm font-medium">Articles</div>
                    </div>

                    <div class="text-center">
                        <div class="font-bold text-lg">{{ totalPrice }} FCFA</div>
                        <div class="text-sm opacity-80">Total</div>
                    </div>

                    <Button label="Voir panier" icon="pi pi-shopping-cart" class="bg-[#4B2E1E] hover:bg-[#3d2518] text-white" @click="$emit('view-cart')" />
                </div>
            </template>
        </Card>
    </div>
</template>
