<template>
    <Card class="w-full max-w-md">
        <template #header>
            <div class="bg-gradient-to-r from-[#47A547] to-[#E6782C] p-6 text-white text-center">
                <Avatar icon="pi pi-user" size="xlarge" class="bg-white text-[#47A547] mb-3" />
                <h3 class="text-xl font-bold">{{ user.name }}</h3>
                <p class="opacity-90">{{ user.email }}</p>
            </div>
        </template>

        <template #content>
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4 text-center">
                    <div class="p-3 bg-[#FDF6EC] rounded-lg">
                        <div class="text-2xl font-bold text-[#47A547]">{{ user.totalOrders }}</div>
                        <div class="text-sm text-gray-600">Commandes</div>
                    </div>
                    <div class="p-3 bg-[#FDF6EC] rounded-lg">
                        <div class="text-2xl font-bold text-[#E6782C]">{{ user.favoriteRestaurants }}</div>
                        <div class="text-sm text-gray-600">Favoris</div>
                    </div>
                </div>

                <Divider />

                <div class="space-y-2">
                    <h4 class="font-semibold text-[#4B2E1E]">Adresses de livraison :</h4>
                    <div v-for="address in user.addresses" :key="address.id" class="p-3 border border-gray-200 rounded-lg flex justify-between items-center">
                        <div>
                            <div class="font-medium">{{ address.name }}</div>
                            <div class="text-sm text-gray-600">{{ address.address }}</div>
                        </div>
                        <Button icon="pi pi-pencil" text size="small" />
                    </div>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex space-x-2">
                <Button label="Modifier profil" text class="flex-1" />
                <Button label="Déconnexion" text severity="danger" class="flex-1" />
            </div>
        </template>
    </Card>
</template>

<script setup>
import { ref } from 'vue';
import Card from 'primevue/card';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Divider from 'primevue/divider';

const user = ref({
    name: 'Marie Kouassi',
    email: 'marie.kouassi@email.com',
    totalOrders: 24,
    favoriteRestaurants: 5,
    addresses: [
        {
            id: 1,
            name: 'Domicile',
            address: 'Plateau, Rue des Jardins'
        },
        {
            id: 2,
            name: 'Bureau',
            address: 'Cocody, Zone 4'
        }
    ]
});
</script>
