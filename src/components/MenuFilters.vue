<script setup>
import { ref, computed, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import Slider from 'primevue/slider';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

const props = defineProps({
    quartiers: Array,
    types: Array
});

const emit = defineEmits(['filter-change']);

const localFilters = ref({
    quartier: '',
    type: '',
    livraisonOnly: false,
    priceRange: [0, 5000]
});

const quartierOptions = computed(() => [{ label: 'Tous les quartiers', value: '' }, ...props.quartiers.map((q) => ({ label: q, value: q }))]);

const typeOptions = computed(() => [
    { label: 'Tous les types', value: '' },
    ...props.types.map((t) => ({
        label: t.charAt(0).toUpperCase() + t.slice(1),
        value: t
    }))
]);

const emitFilterChange = () => {
    emit('filter-change', localFilters.value);
};

const resetFilters = () => {
    localFilters.value = {
        quartier: '',
        type: '',
        livraisonOnly: false,
        priceRange: [0, 5000]
    };
    emitFilterChange();
};
</script>

<template>
    <section class="py-6 bg-white rounded-lg shadow-sm mb-6">
        <div class="px-6 flex justify-center">
            <div class="flex flex-wrap gap-4 items-center justify-center">
                <span class="font-semibold text-[#4B2E1E] text-lg">Filtrer par :</span>

                <!-- Quartier Filter -->
                <Dropdown v-model="localFilters.quartier" :options="quartierOptions" optionLabel="label" optionValue="value" placeholder="Tous les quartiers" class="w-48" @change="emitFilterChange" />

                <!-- Type Filter -->
                <Dropdown v-model="localFilters.type" :options="typeOptions" optionLabel="label" optionValue="value" placeholder="Type de plat" class="w-48" @change="emitFilterChange" />

                <!-- Price Range -->
                <div class="flex items-center space-x-5">
                    <label class="text-[#4B2E1E] font-medium">Prix :</label>
                    <Slider v-model="localFilters.priceRange" :min="0" :max="5000" :step="100" range class="w-32" @change="emitFilterChange" />
                    <span class="text-sm text-gray-600"> {{ localFilters.priceRange[0] }} - {{ localFilters.priceRange[1] }} FCFA </span>
                </div>

                <!-- Livraison Only -->
                <div class="flex items-center space-x-2">
                    <Checkbox v-model="localFilters.livraisonOnly" inputId="livraison" :binary="true" @change="emitFilterChange" />
                    <label for="livraison" class="text-[#4B2E1E] font-medium">Livraison disponible</label>
                </div>

                <!-- Reset Filters -->
                <Button label="Réinitialiser" text class="text-[#E6782C] hover:text-[#d66a25]" @click="resetFilters" />
            </div>
        </div>
    </section>
</template>
