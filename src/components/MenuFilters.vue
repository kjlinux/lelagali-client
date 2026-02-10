<script setup>
import { ref, computed, watch } from 'vue';
import Dropdown from 'primevue/dropdown';
import Slider from 'primevue/slider';
import Button from 'primevue/button';

const props = defineProps({
    quartiers: Array,
    minPrice: {
        type: Number,
        default: 0
    },
    maxPrice: {
        type: Number,
        default: 50000
    }
});

const emit = defineEmits(['filter-change']);

const localFilters = ref({
    quartier: '',
    priceRange: [props.minPrice, props.maxPrice]
});

// Watch pour mettre à jour la fourchette de prix quand les props changent
watch(() => [props.minPrice, props.maxPrice], ([newMin, newMax]) => {
    localFilters.value.priceRange = [newMin, newMax];
});

const quartierOptions = computed(() => [{ label: 'Tous les quartiers', value: '' }, ...props.quartiers.map((q) => ({ label: q, value: q }))]);

const emitFilterChange = () => {
    emit('filter-change', localFilters.value);
};

const resetFilters = () => {
    localFilters.value = {
        quartier: '',
        priceRange: [props.minPrice, props.maxPrice]
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

                <!-- Price Range -->
                <div class="flex items-center space-x-5">
                    <label class="text-[#4B2E1E] font-medium">Prix :</label>
                    <Slider v-model="localFilters.priceRange" :min="minPrice" :max="maxPrice" :step="100" range class="w-32" @change="emitFilterChange" />
                    <span class="text-sm text-gray-600"> {{ localFilters.priceRange[0] }} - {{ localFilters.priceRange[1] }} FCFA </span>
                </div>

                <!-- Reset Filters -->
                <Button label="Réinitialiser" text class="text-[#E6782C] hover:text-[#d66a25]" @click="resetFilters" />
            </div>
        </div>
    </section>
</template>
