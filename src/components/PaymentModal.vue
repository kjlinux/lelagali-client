<script setup>
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
    visible: Boolean,
    orderData: Object
});

const emit = defineEmits(['update:visible', 'payment-success', 'payment-cancel']);
const toast = useToast();

const localVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const selectedDeliveryMode = ref('pickup');
const selectedPaymentMethods = ref({});
const processing = ref(false);
const paymentReferences = ref({});
const paymentPhones = ref({});
const errors = ref({});

const deliveryAddress = ref({
    street: '',
    quartier: '',
    commune: '',
    phone: '',
    instructions: ''
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

// Regroupement des articles par restaurant
const itemsByRestaurant = computed(() => {
    if (!props.orderData?.items) return {};

    const groups = {};
    props.orderData.items.forEach((item) => {
        const restaurant = item.restauratrice;
        if (!groups[restaurant]) {
            groups[restaurant] = [];
        }
        groups[restaurant].push(item);
    });
    return groups;
});

// Analyser les options de livraison pour chaque restaurant
const deliveryAnalysis = computed(() => {
    const result = {};
    Object.entries(itemsByRestaurant.value).forEach(([restaurant, items]) => {
        const deliveryItems = items.filter((item) => item.livraison);
        const pickupOnlyItems = items.filter((item) => !item.livraison);

        result[restaurant] = {
            hasDeliveryItems: deliveryItems.length > 0,
            hasPickupOnlyItems: pickupOnlyItems.length > 0,
            deliveryItems,
            pickupOnlyItems,
            allItems: items
        };
    });
    return result;
});

// Déterminer les options de livraison globales
const globalDeliveryOptions = computed(() => {
    const restaurants = Object.values(deliveryAnalysis.value);
    const hasAnyDeliveryOption = restaurants.some((r) => r.hasDeliveryItems);
    const hasAnyPickupOnly = restaurants.some((r) => r.hasPickupOnlyItems);

    return {
        canChooseDelivery: hasAnyDeliveryOption,
        hasPickupOnlyItems: hasAnyPickupOnly,
        mustShowMixedWarning: hasAnyDeliveryOption && hasAnyPickupOnly
    };
});

// Calculer les totaux en tenant compte du mode de livraison choisi
const totalsByRestaurant = computed(() => {
    const result = {};
    Object.entries(itemsByRestaurant.value).forEach(([restaurant, items]) => {
        const analysis = deliveryAnalysis.value[restaurant];
        const itemsTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

        let deliveryFee = 0;
        let deliveredItems = [];
        let pickupItems = [];

        if (selectedDeliveryMode.value === 'delivery') {
            // En mode livraison : séparer les articles
            deliveredItems = analysis.deliveryItems;
            pickupItems = analysis.pickupOnlyItems;

            // Frais de livraison seulement si il y a des articles à livrer
            if (deliveredItems.length > 0) {
                deliveryFee = 500;
            }
        } else {
            // En mode retrait : tous les articles sont à récupérer
            pickupItems = items;
        }

        result[restaurant] = {
            itemsTotal,
            deliveryFee,
            total: itemsTotal + deliveryFee,
            deliveredItems,
            pickupItems,
            hasDelivery: deliveredItems.length > 0,
            hasPickup: pickupItems.length > 0
        };
    });
    return result;
});

// Total général
const finalAmount = computed(() => {
    return Object.values(totalsByRestaurant.value).reduce((total, restaurant) => total + restaurant.total, 0);
});

// Méthodes de paiement disponibles par restaurant
const availablePaymentMethodsByRestaurant = computed(() => {
    const result = {};
    Object.entries(itemsByRestaurant.value).forEach(([restaurant, items]) => {
        const allMethods = [...new Set(items.flatMap((item) => item.paymentMethods))];
        const restaurantTotals = totalsByRestaurant.value[restaurant];

        // Filtrer selon ce qui se passe pour ce restaurant
        result[restaurant] = allMethods.filter((method) => {
            if (restaurantTotals.hasDelivery && !restaurantTotals.hasPickup) {
                // Que de la livraison pour ce restaurant
                return !method.includes('pickup');
            } else if (!restaurantTotals.hasDelivery && restaurantTotals.hasPickup) {
                // Que du retrait pour ce restaurant
                return !method.includes('delivery');
            } else if (restaurantTotals.hasDelivery && restaurantTotals.hasPickup) {
                // Mix : accepter toutes les méthodes (cash_delivery pour la partie livrée)
                return true;
            }
            return true;
        });
    });
    return result;
});

// Vérifier si on peut procéder
const canProceed = computed(() => {
    // Vérifier qu'un mode de livraison est sélectionné
    if (!selectedDeliveryMode.value) return false;

    // Vérifier l'adresse de livraison si nécessaire
    if (selectedDeliveryMode.value === 'delivery') {
        if (!deliveryAddress.value.street || !deliveryAddress.value.quartier || !deliveryAddress.value.phone) {
            return false;
        }
    }

    // Vérifier qu'une méthode de paiement est sélectionnée pour chaque restaurant
    const restaurants = Object.keys(itemsByRestaurant.value);
    for (const restaurant of restaurants) {
        if (!selectedPaymentMethods.value[restaurant]) {
            return false;
        }

        // Vérifier les infos de paiement en ligne si nécessaire
        const paymentMethod = selectedPaymentMethods.value[restaurant];
        if (['mobile_money', 'orange_money', 'wave'].includes(paymentMethod)) {
            if (!paymentReferences.value[restaurant] || !paymentPhones.value[restaurant]) {
                return false;
            }
        }
    }

    return true;
});

// Validation des infos de paiement
const validatePaymentInfo = () => {
    const newErrors = {};

    Object.entries(selectedPaymentMethods.value).forEach(([restaurant, method]) => {
        if (['mobile_money', 'orange_money', 'wave'].includes(method)) {
            if (!paymentReferences.value[restaurant]?.trim()) {
                newErrors[`${restaurant}_reference`] = 'Référence de transaction requise';
            }
            if (!paymentPhones.value[restaurant]?.trim()) {
                newErrors[`${restaurant}_phone`] = 'Numéro de paiement requis';
            }
        }
    });

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
};

// Traitement du paiement
const processPayment = async () => {
    if (!validatePaymentInfo()) {
        return;
    }

    processing.value = true;

    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const orderDetails = {
            orderId: 'CMD-' + Date.now(),
            deliveryMode: selectedDeliveryMode.value,
            totalAmount: finalAmount.value,
            deliveryAddress: selectedDeliveryMode.value === 'delivery' ? deliveryAddress.value : null,
            restaurantOrders: {}
        };

        // Créer les détails de commande pour chaque restaurant
        Object.entries(itemsByRestaurant.value).forEach(([restaurant, items]) => {
            const paymentMethod = selectedPaymentMethods.value[restaurant];
            const totals = totalsByRestaurant.value[restaurant];

            orderDetails.restaurantOrders[restaurant] = {
                items,
                paymentMethod,
                amount: totals.total,
                deliveryFee: totals.deliveryFee,
                deliveredItems: totals.deliveredItems,
                pickupItems: totals.pickupItems,
                reference: paymentReferences.value[restaurant] || null,
                phone: paymentPhones.value[restaurant] || null
            };
        });

        emit('payment-success', orderDetails);
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erreur de paiement',
            detail: 'Impossible de traiter votre commande. Vérifiez vos informations.',
            life: 5000
        });
    } finally {
        processing.value = false;
    }
};

// Réinitialiser le formulaire
watch(
    () => props.visible,
    (newValue) => {
        if (newValue) {
            selectedDeliveryMode.value = globalDeliveryOptions.value.canChooseDelivery ? 'delivery' : 'pickup';
            selectedPaymentMethods.value = {};
            paymentReferences.value = {};
            paymentPhones.value = {};
            errors.value = {};
            deliveryAddress.value = {
                street: '',
                quartier: '',
                commune: '',
                phone: '',
                instructions: ''
            };
        }
    }
);

// Réinitialiser les méthodes de paiement quand le mode de livraison change
watch(selectedDeliveryMode, () => {
    selectedPaymentMethods.value = {};
    paymentReferences.value = {};
    paymentPhones.value = {};
});
</script>

<template>
    <Dialog v-model:visible="localVisible" header="Finaliser la commande" :modal="true" :style="{ width: '900px', maxHeight: '90vh' }" :closable="true" class="payment-modal">
        <div class="payment-container space-y-6 max-h-[70vh] overflow-y-auto">
            <!-- Résumé par restaurant -->
            <div class="space-y-4">
                <h3 class="font-semibold text-[#4B2E1E] mb-3">Résumé de votre commande</h3>

                <div v-for="(items, restaurant) in itemsByRestaurant" :key="restaurant" class="bg-[#FDF6EC] p-4 rounded-lg border">
                    <div class="flex justify-between items-start mb-3">
                        <h4 class="font-semibold text-[#4B2E1E]">{{ restaurant }}</h4>
                        <div class="flex space-x-2">
                            <span v-if="deliveryAnalysis[restaurant].hasDeliveryItems" class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded"> Livraison disponible </span>
                            <span v-if="deliveryAnalysis[restaurant].hasPickupOnlyItems" class="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded"> Certains plats : retrait uniquement </span>
                        </div>
                    </div>

                    <!-- Adresse du restaurant -->
                    <div class="text-sm text-gray-600 mb-3 p-2 bg-white rounded border-l-4 border-[#47A547]">
                        <i class="pi pi-map-marker text-[#47A547] mr-1"></i>
                        {{ restaurantAddresses[restaurant] }}
                    </div>

                    <!-- Articles de ce restaurant organisés par mode -->
                    <div class="space-y-3">
                        <!-- Articles à livrer (si mode livraison choisi) -->
                        <div v-if="selectedDeliveryMode === 'delivery' && totalsByRestaurant[restaurant]?.deliveredItems.length > 0">
                            <h6 class="font-medium text-green-700 mb-2 flex items-center">
                                <i class="pi pi-truck mr-2"></i>
                                Articles à livrer
                            </h6>
                            <div class="space-y-1 pl-6">
                                <div v-for="item in totalsByRestaurant[restaurant].deliveredItems" :key="`delivery-${item.id}`" class="flex justify-between text-sm">
                                    <span>{{ item.title }} x{{ item.quantity }}</span>
                                    <span class="font-medium">{{ item.price * item.quantity }} FCFA</span>
                                </div>
                            </div>
                        </div>

                        <!-- Articles à récupérer -->
                        <div v-if="totalsByRestaurant[restaurant]?.pickupItems.length > 0">
                            <h6 class="font-medium text-orange-700 mb-2 flex items-center">
                                <i class="pi pi-shopping-bag mr-2"></i>
                                {{ selectedDeliveryMode === 'delivery' ? 'Articles à récupérer sur place' : 'Articles à récupérer' }}
                            </h6>
                            <div class="space-y-1 pl-6">
                                <div v-for="item in totalsByRestaurant[restaurant].pickupItems" :key="`pickup-${item.id}`" class="flex justify-between text-sm">
                                    <span>{{ item.title }} x{{ item.quantity }}</span>
                                    <span class="font-medium">{{ item.price * item.quantity }} FCFA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sous-total du restaurant -->
                    <div class="border-t pt-2 mt-3 space-y-1">
                        <div class="flex justify-between text-sm">
                            <span>Sous-total articles</span>
                            <span class="font-medium">{{ totalsByRestaurant[restaurant]?.itemsTotal }} FCFA</span>
                        </div>
                        <div v-if="totalsByRestaurant[restaurant]?.deliveryFee > 0" class="flex justify-between text-sm">
                            <span>Frais de livraison</span>
                            <span class="font-medium">{{ totalsByRestaurant[restaurant]?.deliveryFee }} FCFA</span>
                        </div>
                        <div class="flex justify-between font-bold border-t pt-1">
                            <span>Total {{ restaurant }}</span>
                            <span class="text-[#47A547]">{{ totalsByRestaurant[restaurant]?.total }} FCFA</span>
                        </div>
                    </div>
                </div>

                <!-- Total général -->
                <div class="bg-[#47A547] text-white p-4 rounded-lg">
                    <div class="flex justify-between font-bold text-lg">
                        <span>TOTAL GÉNÉRAL</span>
                        <span>{{ finalAmount }} FCFA</span>
                    </div>
                </div>
            </div>

            <!-- Options de livraison/retrait -->
            <div class="space-y-3">
                <h4 class="font-semibold text-[#4B2E1E]">Mode de récupération</h4>

                <!-- Avertissement pour commande mixte -->
                <div v-if="globalDeliveryOptions.mustShowMixedWarning" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div class="flex items-start space-x-2">
                        <i class="pi pi-exclamation-triangle text-yellow-600 mt-0.5"></i>
                        <div class="text-sm text-yellow-800">
                            <p class="font-medium mb-1">Commande mixte détectée :</p>
                            <p>Certains plats ne sont disponibles qu'en retrait. Si vous choisissez la livraison, vous devrez récupérer ces plats directement chez les restauratrices concernées.</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-3">
                    <div
                        v-if="globalDeliveryOptions.canChooseDelivery"
                        class="border rounded-lg p-3 cursor-pointer transition-colors"
                        :class="{
                            'border-[#47A547] bg-[#47A547]/5': selectedDeliveryMode === 'delivery',
                            'border-gray-300': selectedDeliveryMode !== 'delivery'
                        }"
                        @click="selectedDeliveryMode = 'delivery'"
                    >
                        <div class="flex items-center space-x-3">
                            <div class="relative">
                                <input type="radio" v-model="selectedDeliveryMode" value="delivery" class="w-4 h-4 text-[#47A547] border-gray-300 focus:ring-[#47A547]" />
                            </div>
                            <label class="flex-1 cursor-pointer">
                                <div class="font-medium text-[#4B2E1E]">Livraison à domicile</div>
                                <div class="text-sm text-gray-600">+500 FCFA par restaurant (articles livrables uniquement)</div>
                                <div v-if="globalDeliveryOptions.hasPickupOnlyItems" class="text-xs text-orange-600 mt-1">Certains articles devront être récupérés sur place</div>
                            </label>
                        </div>
                    </div>

                    <div
                        class="border rounded-lg p-3 cursor-pointer transition-colors"
                        :class="{
                            'border-[#47A547] bg-[#47A547]/5': selectedDeliveryMode === 'pickup',
                            'border-gray-300': selectedDeliveryMode !== 'pickup'
                        }"
                        @click="selectedDeliveryMode = 'pickup'"
                    >
                        <div class="flex items-center space-x-3">
                            <div class="relative">
                                <input type="radio" v-model="selectedDeliveryMode" value="pickup" class="w-4 h-4 text-[#47A547] border-gray-300 focus:ring-[#47A547]" />
                            </div>
                            <label class="flex-1 cursor-pointer">
                                <div class="font-medium text-[#4B2E1E]">Retrait sur place</div>
                                <div class="text-sm text-gray-600">Gratuit - Prêt dans 1h (voir adresses ci-dessus)</div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Adresse de livraison -->
            <div v-if="selectedDeliveryMode === 'delivery'" class="space-y-3">
                <h4 class="font-semibold text-[#4B2E1E]">Adresse de livraison</h4>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div class="text-sm text-blue-800">
                        <i class="pi pi-info-circle mr-1"></i>
                        Cette adresse sera utilisée uniquement pour les articles livrables. Les autres articles seront à récupérer aux adresses indiquées ci-dessus.
                    </div>
                </div>
                <div class="space-y-3">
                    <InputText v-model="deliveryAddress.street" placeholder="Rue et numéro" class="w-full p-3" />
                    <div class="grid grid-cols-2 gap-3">
                        <InputText v-model="deliveryAddress.quartier" placeholder="Quartier" class="w-full p-3" />
                        <InputText v-model="deliveryAddress.commune" placeholder="Commune" class="w-full p-3" />
                    </div>
                    <InputText v-model="deliveryAddress.phone" placeholder="Téléphone de contact" class="w-full p-3" />
                    <Textarea v-model="deliveryAddress.instructions" placeholder="Instructions de livraison (optionnel)" class="w-full" :rows="2" />
                </div>
            </div>

            <!-- Moyens de paiement par restaurant -->
            <div v-for="(items, restaurant) in itemsByRestaurant" :key="`payment-${restaurant}`" class="space-y-4">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-[#4B2E1E] border-b pb-2 mb-3">
                        Paiement pour {{ restaurant }}
                        <span class="text-[#47A547] font-bold">({{ totalsByRestaurant[restaurant]?.total }} FCFA)</span>
                    </h4>

                    <!-- Explication du mode de paiement pour ce restaurant -->
                    <div v-if="selectedDeliveryMode === 'delivery'" class="mb-4">
                        <div v-if="totalsByRestaurant[restaurant]?.hasDelivery && totalsByRestaurant[restaurant]?.hasPickup" class="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-800">
                            <i class="pi pi-info-circle mr-1"></i>
                            Ce restaurant a des articles à livrer ET à récupérer. Le paiement couvre les deux.
                        </div>
                        <div v-else-if="totalsByRestaurant[restaurant]?.hasDelivery" class="bg-green-50 border border-green-200 rounded p-2 text-sm text-green-800">
                            <i class="pi pi-truck mr-1"></i>
                            Tous les articles de ce restaurant seront livrés.
                        </div>
                        <div v-else class="bg-orange-50 border border-orange-200 rounded p-2 text-sm text-orange-800">
                            <i class="pi pi-shopping-bag mr-1"></i>
                            Articles à récupérer sur place uniquement.
                        </div>
                    </div>

                    <div class="grid grid-cols-1 gap-3">
                        <!-- Méthodes de paiement disponibles pour ce restaurant -->
                        <div
                            v-for="method in availablePaymentMethodsByRestaurant[restaurant]"
                            :key="`${restaurant}-${method}`"
                            class="border rounded-lg p-3 cursor-pointer transition-colors"
                            :class="{
                                'border-[#47A547] bg-[#47A547]/5': selectedPaymentMethods[restaurant] === method,
                                'border-gray-300': selectedPaymentMethods[restaurant] !== method
                            }"
                            @click="selectedPaymentMethods[restaurant] = method"
                        >
                            <div class="flex items-center space-x-3">
                                <div class="relative">
                                    <input type="radio" :value="method" v-model="selectedPaymentMethods[restaurant]" class="w-4 h-4 text-[#47A547] border-gray-300 focus:ring-[#47A547]" />
                                </div>
                                <label class="flex-1 cursor-pointer">
                                    <div class="flex items-center space-x-2">
                                        <div
                                            class="w-8 h-8 rounded flex items-center justify-center text-white text-sm"
                                            :class="{
                                                'bg-green-600': method === 'mobile_money',
                                                'bg-orange-500': method === 'orange_money',
                                                'bg-blue-600': method === 'wave',
                                                'bg-gray-600': method.includes('cash')
                                            }"
                                        >
                                            <i
                                                :class="{
                                                    'pi-mobile': method === 'mobile_money',
                                                    'pi-wallet': method === 'orange_money',
                                                    'pi-credit-card': method === 'wave',
                                                    'pi-money-bill': method.includes('cash')
                                                }"
                                            ></i>
                                        </div>
                                        <div>
                                            <div class="font-medium text-[#4B2E1E]">
                                                <span v-if="method === 'mobile_money'">Mobile Money</span>
                                                <span v-else-if="method === 'orange_money'">Orange Money</span>
                                                <span v-else-if="method === 'wave'">Wave</span>
                                                <span v-else-if="method === 'cash_delivery'">Cash à la livraison</span>
                                                <span v-else-if="method === 'cash_pickup'">Cash au retrait</span>
                                            </div>
                                            <div class="text-sm text-gray-600">
                                                <span v-if="method === 'mobile_money'">MTN Money, Moov Money</span>
                                                <span v-else-if="method === 'orange_money'">Paiement sécurisé Orange</span>
                                                <span v-else-if="method === 'wave'">Portefeuille électronique</span>
                                                <span v-else-if="method === 'cash_delivery'">Payez en espèces au livreur</span>
                                                <span v-else-if="method === 'cash_pickup'">Payez en espèces sur place</span>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Informations de paiement en ligne pour ce restaurant -->
                    <div v-if="['mobile_money', 'orange_money', 'wave'].includes(selectedPaymentMethods[restaurant])" class="space-y-3 mt-4 p-4 bg-yellow-50 rounded-lg border">
                        <h5 class="font-semibold text-[#4B2E1E]">Informations de paiement pour {{ restaurant }}</h5>

                        <div class="bg-yellow-100 border border-yellow-200 rounded p-3">
                            <div class="flex items-start space-x-2">
                                <i class="pi pi-info-circle text-yellow-600 mt-0.5"></i>
                                <div class="text-sm text-yellow-800">
                                    <p class="font-medium mb-1">Instructions de paiement :</p>
                                    <p>1. Composez le code de votre service de paiement mobile</p>
                                    <p>
                                        2. Effectuez le paiement de <strong>{{ totalsByRestaurant[restaurant]?.total }} FCFA</strong>
                                    </p>
                                    <p>3. Saisissez la référence de transaction ci-dessous</p>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <InputText v-model="paymentReferences[restaurant]" :placeholder="`Référence de transaction pour ${restaurant}`" class="w-full p-3" :class="{ 'p-invalid': errors[`${restaurant}_reference`] }" />
                            <small v-if="errors[`${restaurant}_reference`]" class="text-red-500">
                                {{ errors[`${restaurant}_reference`] }}
                            </small>

                            <InputText v-model="paymentPhones[restaurant]" :placeholder="`Numéro utilisé pour le paiement chez ${restaurant}`" class="w-full p-3" :class="{ 'p-invalid': errors[`${restaurant}_phone`] }" />
                            <small v-if="errors[`${restaurant}_phone`]" class="text-red-500">
                                {{ errors[`${restaurant}_phone`] }}
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-3 pt-4 border-t sticky bottom-0 bg-white">
                <Button label="Annuler" text class="flex-1 text-gray-600" @click="$emit('payment-cancel')" />
                <Button label="Confirmer la commande" :loading="processing" class="flex-2 bg-[#47A547] hover:bg-[#3d8f3d] text-white p-3" @click="processPayment" :disabled="!canProceed" />
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.payment-modal :deep(.p-dialog-content) {
    padding: 1.5rem;
    max-height: 80vh;
    overflow-y: auto;
}

.payment-container {
    min-height: 400px;
}

:deep(.p-invalid) {
    border-color: #ef4444;
}

/* Style pour les boutons radio ronds */
input[type='radio'] {
    appearance: none;
    width: 1rem;
    height: 1rem;
    border: 2px solid #d1d5db;
    border-radius: 50%;
    background-color: white;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease-in-out;
}

input[type='radio']:checked {
    border-color: #47a547;
    background-color: #47a547;
}

input[type='radio']:checked::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background-color: white;
}

input[type='radio']:focus {
    outline: none;
    ring: 2px;
    ring-color: #47a547;
    ring-opacity: 0.5;
}
</style>
