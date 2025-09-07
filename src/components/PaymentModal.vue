<script setup>
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import RadioButton from 'primevue/radiobutton';
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
const selectedPaymentMethod = ref('');
const processing = ref(false);
const paymentReference = ref('');
const paymentPhone = ref('');
const errors = ref({});

const deliveryAddress = ref({
    street: '',
    quartier: '',
    commune: '',
    phone: '',
    instructions: ''
});

// Computed properties
const canDeliver = computed(() => {
    return props.orderData?.items?.some((item) => item.livraison);
});

const isOnlinePayment = computed(() => {
    return ['mobile_money', 'orange_money', 'wave'].includes(selectedPaymentMethod.value);
});

const finalAmount = computed(() => {
    const baseAmount = props.orderData?.totalAmount || 0;
    const deliveryFee = selectedDeliveryMode.value === 'delivery' ? 500 : 0;
    return baseAmount + deliveryFee;
});

const availablePaymentMethods = computed(() => {
    if (!props.orderData?.availablePaymentMethods) return [];

    return props.orderData.availablePaymentMethods.filter((method) => {
        // Filtrer selon le mode de livraison
        if (selectedDeliveryMode.value === 'delivery') {
            return !method.includes('pickup');
        } else {
            return !method.includes('delivery');
        }
    });
});

const canProceed = computed(() => {
    const hasPaymentMethod = selectedPaymentMethod.value !== '';
    const hasDeliveryMode = selectedDeliveryMode.value !== '';

    let hasValidAddress = true;
    if (selectedDeliveryMode.value === 'delivery') {
        hasValidAddress = deliveryAddress.value.street && deliveryAddress.value.quartier && deliveryAddress.value.phone;
    }

    let hasValidPaymentInfo = true;
    if (isOnlinePayment.value) {
        hasValidPaymentInfo = paymentReference.value && paymentPhone.value;
    }

    return hasPaymentMethod && hasDeliveryMode && hasValidAddress && hasValidPaymentInfo;
});

// Methods
const validatePaymentInfo = () => {
    const newErrors = {};

    if (isOnlinePayment.value) {
        if (!paymentReference.value.trim()) {
            newErrors.paymentReference = 'Référence de transaction requise';
        }
        if (!paymentPhone.value.trim()) {
            newErrors.paymentPhone = 'Numéro de paiement requis';
        }
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
};

const processPayment = async () => {
    if (!validatePaymentInfo()) {
        return;
    }

    processing.value = true;

    try {
        // Simulation du traitement de paiement
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simuler une vérification de paiement
        if (isOnlinePayment.value && Math.random() > 0.1) {
            // 90% de succès
            emit('payment-success', {
                orderId: 'CMD-' + Date.now(),
                paymentMethod: selectedPaymentMethod.value,
                deliveryMode: selectedDeliveryMode.value,
                amount: finalAmount.value,
                reference: paymentReference.value || null
            });
        } else if (!isOnlinePayment.value) {
            emit('payment-success', {
                orderId: 'CMD-' + Date.now(),
                paymentMethod: selectedPaymentMethod.value,
                deliveryMode: selectedDeliveryMode.value,
                amount: finalAmount.value
            });
        } else {
            throw new Error('Paiement non vérifié');
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Erreur de paiement',
            detail: 'Impossible de vérifier votre paiement. Vérifiez vos informations.',
            life: 5000
        });
    } finally {
        processing.value = false;
    }
};

// Reset form when modal opens
watch(
    () => props.visible,
    (newValue) => {
        if (newValue) {
            selectedDeliveryMode.value = canDeliver.value ? 'delivery' : 'pickup';
            selectedPaymentMethod.value = '';
            paymentReference.value = '';
            paymentPhone.value = '';
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

// Update available payment methods when delivery mode changes
watch(selectedDeliveryMode, () => {
    selectedPaymentMethod.value = '';
});
</script>

<template>
    <Dialog v-model:visible="localVisible" header="Finaliser la commande" :modal="true" :style="{ width: '600px' }" :closable="true" class="payment-modal">
        <div class="payment-container space-y-6">
            <!-- Résumé de la commande -->
            <div class="bg-[#FDF6EC] p-4 rounded-lg">
                <h3 class="font-semibold text-[#4B2E1E] mb-3">Résumé de votre commande</h3>
                <div class="space-y-2 mb-3">
                    <div v-for="item in orderData?.items" :key="item.id" class="flex justify-between text-sm">
                        <span>{{ item.title }} x{{ item.quantity }}</span>
                        <span class="font-medium">{{ item.price * item.quantity }} FCFA</span>
                    </div>
                </div>
                <div v-if="orderData?.deliveryMode" class="flex justify-between text-sm border-t pt-2">
                    <span>Frais de livraison</span>
                    <span class="font-medium">500 FCFA</span>
                </div>
                <div class="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>Total</span>
                    <span class="text-[#47A547]">{{ orderData?.totalAmount }} FCFA</span>
                </div>
            </div>

            <!-- Options de livraison/retrait -->
            <div class="space-y-3">
                <h4 class="font-semibold text-[#4B2E1E]">Mode de récupération</h4>
                <div class="grid grid-cols-1 gap-3">
                    <div
                        v-if="canDeliver"
                        class="border rounded-lg p-3 cursor-pointer transition-colors"
                        :class="{ 'border-[#47A547] bg-[#47A547]/5': selectedDeliveryMode === 'delivery', 'border-gray-300': selectedDeliveryMode !== 'delivery' }"
                        @click="selectedDeliveryMode = 'delivery'"
                    >
                        <div class="flex items-center space-x-3">
                            <RadioButton v-model="selectedDeliveryMode" inputId="delivery" value="delivery" />
                            <label for="delivery" class="flex-1 cursor-pointer">
                                <div class="font-medium text-[#4B2E1E]">Livraison à domicile</div>
                                <div class="text-sm text-gray-600">+500 FCFA - Livré dans les 2h</div>
                            </label>
                        </div>
                    </div>

                    <div
                        class="border rounded-lg p-3 cursor-pointer transition-colors"
                        :class="{ 'border-[#47A547] bg-[#47A547]/5': selectedDeliveryMode === 'pickup', 'border-gray-300': selectedDeliveryMode !== 'pickup' }"
                        @click="selectedDeliveryMode = 'pickup'"
                    >
                        <div class="flex items-center space-x-3">
                            <RadioButton v-model="selectedDeliveryMode" inputId="pickup" value="pickup" />
                            <label for="pickup" class="flex-1 cursor-pointer">
                                <div class="font-medium text-[#4B2E1E]">Retrait sur place</div>
                                <div class="text-sm text-gray-600">Gratuit - Prêt dans 1h</div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Adresse de livraison -->
            <div v-if="selectedDeliveryMode === 'delivery'" class="space-y-3">
                <h4 class="font-semibold text-[#4B2E1E]">Adresse de livraison</h4>
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

            <!-- Moyens de paiement -->
            <div class="space-y-4">
                <h4 class="font-semibold text-[#4B2E1E]">Choisissez votre moyen de paiement</h4>

                <div class="grid grid-cols-1 gap-3">
                    <!-- Mobile Money -->
                    <div
                        v-if="orderData?.availablePaymentMethods?.includes('mobile_money')"
                        class="border rounded-lg p-3 cursor-pointer transition-colors"
                        :class="{ 'border-[#47A547] bg-[#47A547]/5': selectedPaymentMethod === 'mobile_money', 'border-gray-300': selectedPaymentMethod !== 'mobile_money' }"
                        @click="selectedPaymentMethod = 'mobile_money'"
                    >
                        <div class="flex items-center space-x-3">
                            <RadioButton v-model="selectedPaymentMethod" inputId="mobile_money" value="mobile_money" />
                            <label for="mobile_money" class="flex-1 cursor-pointer">
                                <div class="flex items-center space-x-2">
                                    <div class="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                                        <i class="pi pi-mobile text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <div class="font-medium text-[#4B2E1E]">Mobile Money</div>
                                        <div class="text-sm text-gray-600">MTN Money, Moov Money</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Orange Money -->
                    <div
                        v-if="orderData?.availablePaymentMethods?.includes('orange_money')"
                        class="border rounded-lg p-3 cursor-pointer transition-colors"
                        :class="{ 'border-[#47A547] bg-[#47A547]/5': selectedPaymentMethod === 'orange_money', 'border-gray-300': selectedPaymentMethod !== 'orange_money' }"
                        @click="selectedPaymentMethod = 'orange_money'"
                    >
                        <div class="flex items-center space-x-3">
                            <RadioButton v-model="selectedPaymentMethod" inputId="orange_money" value="orange_money" />
                            <label for="orange_money" class="flex-1 cursor-pointer">
                                <div class="flex items-center space-x-2">
                                    <div class="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                                        <i class="pi pi-wallet text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <div class="font-medium text-[#4B2E1E]">Orange Money</div>
                                        <div class="text-sm text-gray-600">Paiement sécurisé Orange</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Wave -->
                    <div
                        v-if="orderData?.availablePaymentMethods?.includes('wave')"
                        class="border rounded-lg p-3 cursor-pointer transition-colors"
                        :class="{ 'border-[#47A547] bg-[#47A547]/5': selectedPaymentMethod === 'wave', 'border-gray-300': selectedPaymentMethod !== 'wave' }"
                        @click="selectedPaymentMethod = 'wave'"
                    >
                        <div class="flex items-center space-x-3">
                            <RadioButton v-model="selectedPaymentMethod" inputId="wave" value="wave" />
                            <label for="wave" class="flex-1 cursor-pointer">
                                <div class="flex items-center space-x-2">
                                    <div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                        <i class="pi pi-credit-card text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <div class="font-medium text-[#4B2E1E]">Wave</div>
                                        <div class="text-sm text-gray-600">Portefeuille électronique</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Cash à la livraison -->
                    <div
                        v-if="orderData?.availablePaymentMethods?.includes('cash_delivery') && selectedDeliveryMode === 'delivery'"
                        class="border rounded-lg p-3 cursor-pointer transition-colors"
                        :class="{ 'border-[#47A547] bg-[#47A547]/5': selectedPaymentMethod === 'cash_delivery', 'border-gray-300': selectedPaymentMethod !== 'cash_delivery' }"
                        @click="selectedPaymentMethod = 'cash_delivery'"
                    >
                        <div class="flex items-center space-x-3">
                            <RadioButton v-model="selectedPaymentMethod" inputId="cash_delivery" value="cash_delivery" />
                            <label for="cash_delivery" class="flex-1 cursor-pointer">
                                <div class="flex items-center space-x-2">
                                    <div class="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                                        <i class="pi pi-money-bill text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <div class="font-medium text-[#4B2E1E]">Cash à la livraison</div>
                                        <div class="text-sm text-gray-600">Payez en espèces au livreur</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Cash au retrait -->
                    <div
                        v-if="orderData?.availablePaymentMethods?.includes('cash_pickup') && selectedDeliveryMode === 'pickup'"
                        class="border rounded-lg p-3 cursor-pointer transition-colors"
                        :class="{ 'border-[#47A547] bg-[#47A547]/5': selectedPaymentMethod === 'cash_pickup', 'border-gray-300': selectedPaymentMethod !== 'cash_pickup' }"
                        @click="selectedPaymentMethod = 'cash_pickup'"
                    >
                        <div class="flex items-center space-x-3">
                            <RadioButton v-model="selectedPaymentMethod" inputId="cash_pickup" value="cash_pickup" />
                            <label for="cash_pickup" class="flex-1 cursor-pointer">
                                <div class="flex items-center space-x-2">
                                    <div class="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                                        <i class="pi pi-money-bill text-white text-sm"></i>
                                    </div>
                                    <div>
                                        <div class="font-medium text-[#4B2E1E]">Cash au retrait</div>
                                        <div class="text-sm text-gray-600">Payez en espèces sur place</div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Informations de paiement en ligne -->
            <div v-if="isOnlinePayment" class="space-y-3">
                <h4 class="font-semibold text-[#4B2E1E]">Informations de paiement</h4>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div class="flex items-start space-x-2">
                        <i class="pi pi-info-circle text-yellow-600 mt-0.5"></i>
                        <div class="text-sm text-yellow-800">
                            <p class="font-medium mb-1">Instructions de paiement :</p>
                            <p>1. Composez le code de votre service de paiement mobile</p>
                            <p>
                                2. Effectuez le paiement de <strong>{{ finalAmount }} FCFA</strong>
                            </p>
                            <p>3. Saisissez la référence de transaction ci-dessous</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <InputText v-model="paymentReference" placeholder="Référence de transaction (ex: MP231205.1543.A12345)" class="w-full p-3" :class="{ 'p-invalid': errors.paymentReference }" />
                    <small v-if="errors.paymentReference" class="text-red-500">{{ errors.paymentReference }}</small>

                    <InputText v-model="paymentPhone" placeholder="Numéro utilisé pour le paiement" class="w-full p-3" :class="{ 'p-invalid': errors.paymentPhone }" />
                    <small v-if="errors.paymentPhone" class="text-red-500">{{ errors.paymentPhone }}</small>
                </div>
            </div>

            <!-- Actions -->
            <div class="flex space-x-3 pt-4 border-t">
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

:deep(.p-radiobutton) {
    width: 1rem;
    height: 1rem;
}
</style>
