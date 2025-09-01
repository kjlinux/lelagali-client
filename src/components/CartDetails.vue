<script setup>
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';

const props = defineProps({
    items: Array
});

defineEmits(['update-quantity', 'remove-item', 'checkout']);

const deliveryMode = ref(false);

const totalPrice = computed(() => {
    const itemsTotal = props.items.reduce((total, item) => total + item.price * item.quantity, 0);
    return itemsTotal + (deliveryMode.value ? 500 : 0);
});
</script>

<template>
    <div class="space-y-4">
        <div v-if="items.length === 0" class="text-center py-8">
            <i class="pi pi-shopping-cart text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">Votre panier est vide</p>
        </div>

        <div v-else>
            <div v-for="item in items" :key="item.id" class="flex items-center space-x-4 p-4 border-b border-gray-100">
                <img :src="item.image" :alt="item.title" class="w-16 h-16 object-cover rounded-lg" />

                <div class="flex-1">
                    <h5 class="font-semibold text-[#4B2E1E]">{{ item.title }}</h5>
                    <p class="text-sm text-gray-600">{{ item.restauratrice }}</p>
                    <p class="text-sm font-medium text-[#47A547]">{{ item.price }} FCFA</p>
                </div>

                <div class="flex items-center space-x-2">
                    <Button icon="pi pi-minus" size="small" text @click="$emit('update-quantity', item.id, item.quantity - 1)" />
                    <span class="w-8 text-center font-medium">{{ item.quantity }}</span>
                    <Button icon="pi pi-plus" size="small" text @click="$emit('update-quantity', item.id, item.quantity + 1)" />
                </div>

                <Button icon="pi pi-trash" size="small" text severity="danger" @click="$emit('remove-item', item.id)" />
            </div>

            <div class="pt-4 border-t">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-lg font-semibold text-[#4B2E1E]">Total :</span>
                    <span class="text-xl font-bold text-[#47A547]">{{ totalPrice }} FCFA</span>
                </div>

                <div class="space-y-3">
                    <div class="flex items-center space-x-2">
                        <Checkbox v-model="deliveryMode" inputId="delivery" :binary="true" />
                        <label for="delivery" class="text-[#4B2E1E]">Livraison (+500 FCFA)</label>
                    </div>

                    <Button label="Valider la commande" icon="pi pi-check" class="w-full bg-[#47A547] hover:bg-[#3d8f3d] text-white p-3" @click="$emit('checkout')" :disabled="items.length === 0" />
                </div>
            </div>
        </div>
    </div>
</template>
