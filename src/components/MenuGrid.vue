<script setup>
import MenuCard from './MenuCard.vue';

defineProps({
    menus: Array
});

defineEmits(['add-to-cart', 'view-details']);
</script>

<template>
    <main class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MenuCard v-for="menu in menus" :key="menu.id" :menu="menu" @add-to-cart="$emit('add-to-cart', menu)" @view-details="$emit('view-details', menu)" />
    </main>
</template>
