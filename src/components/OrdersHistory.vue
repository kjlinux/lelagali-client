<script setup>
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import Card from 'primevue/card';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import { computed } from 'vue';

const props = defineProps({
    user: {
        type: Object,
        default: null
    },
    orders: {
        type: Array,
        default: () => []
    }
});

// Adresses des restaurants
const restaurantAddresses = {
    'Maman Adjoua': 'Rue des Palmiers, Plateau - Face à la pharmacie centrale',
    'Tante Fatou': 'Boulevard Lagunaire, Cocody Angré 8ème tranche',
    'Maman Koffi': 'Marché de Siporex, Yopougon - Stand 45',
    'Tantie Aya': 'Rue du Commerce, Plateau - Près de la Poste centrale',
    'Maman Ama': 'Résidence les Cocotiers, Cocody Riviera 3',
    'Maman Akissi': 'Carrefour Soleil, Treichville - Restaurant Akwaba',
    'Moussa Garba': "Gare routière d'Adjamé - Stand Garba N°12",
    'Tantie Awa': 'Villa 254, Cocody Danga Nord',
    'Papa Kader': 'Zone 4C, Marcory - Restaurant Kader',
    'Maman Clémentine': 'Quartier Banco, Koumassi - Maquis Clémentine',
    'Maman Fanta': 'Carrefour Anador, Abobo - Restaurant Fanta'
};

// Filtrer les commandes
const currentOrders = computed(() => props.orders.filter((order) => ['preparing', 'ready_for_pickup', 'ready_for_delivery', 'in_delivery', 'mixed_status'].includes(order.status)));

const completedOrders = computed(() => props.orders.filter((order) => ['delivered', 'picked_up', 'completed'].includes(order.status)));

// Fonction pour obtenir le statut global de la commande
const getOrderGlobalStatus = (order) => {
    const restaurantStatuses = Object.values(order.restaurantOrders).map((r) => r.status);

    if (restaurantStatuses.every((s) => s === 'delivered' || s === 'picked_up')) {
        return 'completed';
    }
    if (restaurantStatuses.some((s) => s === 'in_delivery')) {
        return 'in_delivery';
    }
    if (restaurantStatuses.some((s) => s === 'ready_for_delivery')) {
        return 'ready_for_delivery';
    }
    if (restaurantStatuses.some((s) => s === 'ready_for_pickup')) {
        return 'ready_for_pickup';
    }
    if (restaurantStatuses.some((s) => s === 'preparing')) {
        return 'preparing';
    }

    return order.status;
};

// Fonction pour obtenir les informations de statut
const getStatusInfo = (status) => {
    const statusMap = {
        preparing: {
            label: 'En préparation',
            color: 'bg-yellow-100 text-yellow-800',
            icon: 'pi-clock',
            iconColor: 'text-yellow-600'
        },
        ready_for_pickup: {
            label: 'Prêt à récupérer',
            color: 'bg-blue-100 text-blue-800',
            icon: 'pi-shopping-bag',
            iconColor: 'text-blue-600'
        },
        ready_for_delivery: {
            label: 'Prêt pour livraison',
            color: 'bg-purple-100 text-purple-800',
            icon: 'pi-truck',
            iconColor: 'text-purple-600'
        },
        in_delivery: {
            label: 'En cours de livraison',
            color: 'bg-indigo-100 text-indigo-800',
            icon: 'pi-send',
            iconColor: 'text-indigo-600'
        },
        delivered: {
            label: 'Livré',
            color: 'bg-green-100 text-green-800',
            icon: 'pi-check-circle',
            iconColor: 'text-green-600'
        },
        picked_up: {
            label: 'Récupéré',
            color: 'bg-green-100 text-green-800',
            icon: 'pi-check-circle',
            iconColor: 'text-green-600'
        },
        completed: {
            label: 'Terminé',
            color: 'bg-green-100 text-green-800',
            icon: 'pi-check-circle',
            iconColor: 'text-green-600'
        },
        mixed_status: {
            label: 'Statut mixte',
            color: 'bg-orange-100 text-orange-800',
            icon: 'pi-info-circle',
            iconColor: 'text-orange-600'
        }
    };

    return statusMap[status] || statusMap['preparing'];
};

// Fonction pour formater la date
const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// Fonction pour obtenir le nom de la méthode de paiement
const getPaymentMethodName = (method) => {
    const methods = {
        mobile_money: 'Mobile Money',
        orange_money: 'Orange Money',
        wave: 'Wave',
        cash_delivery: 'Cash à la livraison',
        cash_pickup: 'Cash au retrait'
    };
    return methods[method] || method;
};
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Content -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <TabView>
                <!-- Commandes en cours -->
                <TabPanel>
                    <template #header>
                        <div class="flex items-center space-x-2">
                            <i class="pi pi-clock text-[#E6782C]"></i>
                            <span>En cours</span>
                            <Badge v-if="currentOrders.length > 0" :value="currentOrders.length" class="bg-[#E6782C]" />
                        </div>
                    </template>

                    <div v-if="currentOrders.length === 0" class="text-center py-12">
                        <i class="pi pi-clock text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">Aucune commande en cours</h3>
                        <p class="text-gray-500">Vos commandes en cours apparaîtront ici</p>
                    </div>

                    <div v-else class="space-y-6">
                        <Card v-for="order in currentOrders" :key="order.id" class="shadow-sm hover:shadow-md transition-shadow">
                            <template #content>
                                <div class="space-y-4">
                                    <!-- En-tête de commande -->
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <h3 class="text-lg font-semibold text-[#4B2E1E]">Commande #{{ order.id.split('-')[1] }}</h3>
                                            <p class="text-sm text-gray-600">{{ formatDate(order.date) }}</p>
                                        </div>
                                        <div class="text-right">
                                            <div :class="['inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', getStatusInfo(getOrderGlobalStatus(order)).color]">
                                                <i :class="['mr-2', 'pi', getStatusInfo(getOrderGlobalStatus(order)).icon, getStatusInfo(getOrderGlobalStatus(order)).iconColor]"></i>
                                                {{ getStatusInfo(getOrderGlobalStatus(order)).label }}
                                            </div>
                                            <div class="text-xl font-bold text-[#47A547] mt-1">{{ order.totalAmount }} FCFA</div>
                                        </div>
                                    </div>

                                    <!-- Adresse de livraison -->
                                    <div v-if="order.deliveryMode === 'delivery' && order.deliveryAddress" class="bg-blue-50 p-3 rounded-lg">
                                        <h4 class="font-medium text-[#4B2E1E] mb-2 flex items-center">
                                            <i class="pi pi-map-marker text-blue-600 mr-2"></i>
                                            Adresse de livraison
                                        </h4>
                                        <p class="text-sm text-gray-700">
                                            {{ order.deliveryAddress.street }}<br />
                                            {{ order.deliveryAddress.quartier }}, {{ order.deliveryAddress.commune }}<br />
                                            <i class="pi pi-phone mr-1"></i>{{ order.deliveryAddress.phone }}
                                        </p>
                                    </div>

                                    <!-- Détails par restaurant -->
                                    <div class="space-y-4">
                                        <div v-for="(restaurant, restaurantName) in order.restaurantOrders" :key="restaurantName" class="border rounded-lg p-4 bg-gray-50">
                                            <div class="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 class="font-semibold text-[#4B2E1E]">{{ restaurantName }}</h4>
                                                    <p class="text-sm text-gray-600">{{ restaurantAddresses[restaurantName] }}</p>
                                                </div>
                                                <div :class="['inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', getStatusInfo(restaurant.status).color]">
                                                    <i :class="['mr-1', 'pi', getStatusInfo(restaurant.status).icon, getStatusInfo(restaurant.status).iconColor]"></i>
                                                    {{ getStatusInfo(restaurant.status).label }}
                                                </div>
                                            </div>

                                            <!-- Articles livrés -->
                                            <div v-if="restaurant.deliveredItems && restaurant.deliveredItems.length > 0" class="mb-3">
                                                <h6 class="text-sm font-medium text-green-700 mb-2 flex items-center">
                                                    <i class="pi pi-truck mr-2"></i>
                                                    Articles à livrer
                                                </h6>
                                                <div class="space-y-1 pl-6">
                                                    <div v-for="item in restaurant.deliveredItems" :key="`delivery-${item.id}`" class="flex justify-between text-sm">
                                                        <span>{{ item.title }} x{{ item.quantity }}</span>
                                                        <span class="font-medium">{{ item.price * item.quantity }} FCFA</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Articles à récupérer -->
                                            <div v-if="restaurant.pickupItems && restaurant.pickupItems.length > 0" class="mb-3">
                                                <h6 class="text-sm font-medium text-orange-700 mb-2 flex items-center">
                                                    <i class="pi pi-shopping-bag mr-2"></i>
                                                    Articles à récupérer sur place
                                                </h6>
                                                <div class="space-y-1 pl-6">
                                                    <div v-for="item in restaurant.pickupItems" :key="`pickup-${item.id}`" class="flex justify-between text-sm">
                                                        <span>{{ item.title }} x{{ item.quantity }}</span>
                                                        <span class="font-medium">{{ item.price * item.quantity }} FCFA</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Informations de paiement -->
                                            <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                                                <span class="text-sm text-gray-600"> Paiement: {{ getPaymentMethodName(restaurant.paymentMethod) }} </span>
                                                <span class="font-semibold text-[#47A547]"> {{ restaurant.amount }} FCFA </span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Actions -->
                                    <!-- <div class="flex space-x-3 pt-4 border-t">
                                        <Button label="Contacter le livreur" icon="pi pi-phone" text class="text-[#47A547]" v-if="getOrderGlobalStatus(order) === 'in_delivery'" />
                                        <Button label="Voir les détails" icon="pi pi-eye" text class="text-[#4B2E1E]" />
                                    </div> -->
                                </div>
                            </template>
                        </Card>
                    </div>
                </TabPanel>

                <!-- Historique -->
                <TabPanel>
                    <template #header>
                        <div class="flex items-center space-x-2">
                            <i class="pi pi-history text-gray-600"></i>
                            <span>Historique</span>
                        </div>
                    </template>

                    <div v-if="completedOrders.length === 0" class="text-center py-12">
                        <i class="pi pi-history text-6xl text-gray-300 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-600 mb-2">Aucune commande terminée</h3>
                        <p class="text-gray-500">Votre historique de commandes apparaîtra ici</p>
                    </div>

                    <div v-else class="space-y-4">
                        <Card v-for="order in completedOrders" :key="order.id" class="shadow-sm">
                            <template #content>
                                <div class="space-y-3">
                                    <!-- En-tête de commande -->
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <h3 class="font-semibold text-[#4B2E1E]">Commande #{{ order.id.split('-')[1] }}</h3>
                                            <p class="text-sm text-gray-600">{{ formatDate(order.date) }}</p>
                                        </div>
                                        <div class="text-right">
                                            <div :class="['inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', getStatusInfo(getOrderGlobalStatus(order)).color]">
                                                <i :class="['mr-2', 'pi', getStatusInfo(getOrderGlobalStatus(order)).icon, getStatusInfo(getOrderGlobalStatus(order)).iconColor]"></i>
                                                {{ getStatusInfo(getOrderGlobalStatus(order)).label }}
                                            </div>
                                            <div class="font-bold text-[#47A547] mt-1">{{ order.totalAmount }} FCFA</div>
                                        </div>
                                    </div>

                                    <!-- Résumé des restaurants -->
                                    <div class="flex flex-wrap gap-2">
                                        <div v-for="(restaurant, restaurantName) in order.restaurantOrders" :key="restaurantName" class="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm">
                                            <span class="font-medium">{{ restaurantName }}</span>
                                            <span class="ml-2 text-gray-600">{{ restaurant.items.length }} article(s)</span>
                                        </div>
                                    </div>

                                    <!-- Actions -->
                                    <!-- <div class="flex space-x-3 pt-2 border-t">
                                        <Button label="Commander à nouveau" icon="pi pi-refresh" text class="text-[#47A547]" />
                                        <Button label="Voir les détails" icon="pi pi-eye" text class="text-[#4B2E1E]" />
                                    </div> -->
                                </div>
                            </template>
                        </Card>
                    </div>
                </TabPanel>
            </TabView>
        </div>
    </div>
</template>

<style scoped>
:deep(.p-tabview-nav-link) {
    color: #4b2e1e;
    font-weight: 500;
}

:deep(.p-tabview-nav-link:not(.p-disabled):focus) {
    box-shadow: 0 0 0 2px #47a547;
}

:deep(.p-tabview-selected .p-tabview-nav-link) {
    color: #47a547;
    border-color: #47a547;
}

:deep(.p-card-body) {
    padding: 1.5rem;
}

:deep(.p-card-content) {
    padding: 0;
}
</style>
