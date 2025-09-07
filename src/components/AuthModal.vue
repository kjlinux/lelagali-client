<script setup>
import { ref, reactive, watch, computed } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Checkbox from 'primevue/checkbox';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import Divider from 'primevue/divider';

// Props
const props = defineProps({
    visible: Boolean
});

// Emits
const emit = defineEmits(['update:visible']);

// États réactifs
const isRegistering = ref(false);
const loading = ref(false);
const localVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

// Formulaires
const loginForm = reactive({
    emailOrPhone: '',
    password: '',
    rememberMe: false
});

const registerForm = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    quartier: null,
    password: '',
    confirmPassword: '',
    acceptTerms: false
});

// Erreurs
const errors = reactive({});

// Options de quartier
const quartierOptions = ref(['Cocody', 'Abobo', 'Adjamé', 'Plateau', 'Yopougon', 'Autre']);

// Validation
const validateForm = () => {
    Object.keys(errors).forEach((key) => delete errors[key]);

    if (!isRegistering.value) {
        // Validation connexion
        if (!loginForm.emailOrPhone) errors.emailOrPhone = 'Ce champ est requis';
        if (!loginForm.password) errors.password = 'Ce champ est requis';
    } else {
        // Validation inscription
        if (!registerForm.firstName) errors.firstName = 'Ce champ est requis';
        if (!registerForm.lastName) errors.lastName = 'Ce champ est requis';
        if (!registerForm.email) errors.email = 'Ce champ est requis';
        if (!registerForm.phone) errors.phone = 'Ce champ est requis';
        if (!registerForm.quartier) errors.quartier = 'Ce champ est requis';

        if (!registerForm.password) {
            errors.password = 'Ce champ est requis';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}/.test(registerForm.password)) {
            errors.password = 'Le mot de passe ne respecte pas les exigences de sécurité';
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            errors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }

        if (!registerForm.acceptTerms) errors.acceptTerms = 'Vous devez accepter les conditions';
    }

    return Object.keys(errors).length === 0;
};

// Soumission du formulaire
const handleSubmit = async () => {
    if (!validateForm()) return;

    loading.value = true;

    try {
        if (isRegistering.value) {
            // Logique d'inscription
            console.log('Register payload:', registerForm);
            // await authService.register(registerForm);
        } else {
            // Logique de connexion
            console.log('Login payload:', loginForm);
            // await authService.login(loginForm);
        }

        // Fermer la modal après succès
        localVisible.value = false;
    } catch (error) {
        console.error("Erreur d'authentification:", error);
    } finally {
        loading.value = false;
    }
};

// Réinitialiser les formulaires quand la modal se ferme
watch(localVisible, (visible) => {
    if (!visible) {
        Object.keys(loginForm).forEach((key) => (loginForm[key] = ''));
        Object.keys(registerForm).forEach((key) => (registerForm[key] = ''));
        Object.keys(errors).forEach((key) => delete errors[key]);
    }
});
</script>

<template>
    <Dialog v-model:visible="localVisible" header="Authentification" :modal="true" :style="{ width: '450px' }" :closable="true" class="auth-modal">
        <div class="auth-container">
            <!-- Toggle Buttons -->
            <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
                <Button :label="'Connexion'" :class="['flex-1', 'py-2', { 'bg-[#47A547] text-white': !isRegistering, 'bg-transparent text-gray-600': isRegistering }]" @click="isRegistering = false" text />
                <Button :label="'Inscription'" :class="['flex-1', 'py-2', { 'bg-[#47A547] text-white': isRegistering, 'bg-transparent text-gray-600': !isRegistering }]" @click="isRegistering = true" text />
            </div>

            <!-- Login Form -->
            <form @submit.prevent="handleSubmit" v-if="!isRegistering" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-[#4B2E1E] mb-2">Email ou Téléphone</label>
                    <InputText v-model="loginForm.emailOrPhone" placeholder="Entrez votre email ou numéro" class="w-full p-3" :class="{ 'p-invalid': errors.emailOrPhone }" required />
                    <small v-if="errors.emailOrPhone" class="text-red-500">{{ errors.emailOrPhone }}</small>
                </div>

                <div>
                    <label class="block text-sm font-medium text-[#4B2E1E] mb-2">Mot de passe</label>
                    <Password v-model="loginForm.password" placeholder="Entrez votre mot de passe" :feedback="false" toggleMask class="w-full" :class="{ 'p-invalid': errors.password }" required />
                    <small v-if="errors.password" class="text-red-500">{{ errors.password }}</small>
                </div>

                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <Checkbox v-model="loginForm.rememberMe" inputId="remember" :binary="true" />
                        <label for="remember" class="ml-2 text-sm text-[#4B2E1E]">Se souvenir de moi</label>
                    </div>
                    <Button label="Mot de passe oublié ?" text class="text-[#47A547] text-sm p-0" />
                </div>

                <Button type="submit" label="Se connecter" :loading="loading" class="w-full bg-[#47A547] hover:bg-[#3d8f3d] text-white p-3 mt-4" />
            </form>

            <!-- Register Form -->
            <form @submit.prevent="handleSubmit" v-else class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-[#4B2E1E] mb-2">Prénom</label>
                        <InputText v-model="registerForm.firstName" placeholder="Prénom" class="w-full p-2" :class="{ 'p-invalid': errors.firstName }" required />
                        <small v-if="errors.firstName" class="text-red-500">{{ errors.firstName }}</small>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-[#4B2E1E] mb-2">Nom</label>
                        <InputText v-model="registerForm.lastName" placeholder="Nom" class="w-full p-2" :class="{ 'p-invalid': errors.lastName }" required />
                        <small v-if="errors.lastName" class="text-red-500">{{ errors.lastName }}</small>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-[#4B2E1E] mb-2">Email</label>
                    <InputText v-model="registerForm.email" type="email" placeholder="votre@email.com" class="w-full p-3" :class="{ 'p-invalid': errors.email }" required />
                    <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
                </div>

                <div>
                    <label class="block text-sm font-medium text-[#4B2E1E] mb-2">Téléphone</label>
                    <InputText v-model="registerForm.phone" placeholder="Ex: +225 01 02 03 04 05" class="w-full p-3" :class="{ 'p-invalid': errors.phone }" required />
                    <small v-if="errors.phone" class="text-red-500">{{ errors.phone }}</small>
                </div>

                <div>
                    <label class="block text-sm font-medium text-[#4B2E1E] mb-2">Quartier</label>
                    <Dropdown v-model="registerForm.quartier" :options="quartierOptions" placeholder="Sélectionnez votre quartier" class="w-full" :class="{ 'p-invalid': errors.quartier }" />
                    <small v-if="errors.quartier" class="text-red-500">{{ errors.quartier }}</small>
                </div>

                <div>
                    <label class="block text-sm font-medium text-[#4B2E1E] mb-2">Mot de passe</label>
                    <Password v-model="registerForm.password" placeholder="Créez un mot de passe" :feedback="true" toggleMask class="w-full" :class="{ 'p-invalid': errors.password }" required>
                        <template #footer>
                            <Divider />
                            <p class="mt-2 text-sm">Suggestions :</p>
                            <ul class="pl-2 ml-2 mt-0 line-height-3 text-sm">
                                <li>Au moins une minuscule</li>
                                <li>Au moins une majuscule</li>
                                <li>Au moins un chiffre</li>
                                <li>Minimum 8 caractères</li>
                            </ul>
                        </template>
                    </Password>
                    <small v-if="errors.password" class="text-red-500">{{ errors.password }}</small>
                </div>

                <div>
                    <label class="block text-sm font-medium text-[#4B2E1E] mb-2">Confirmer le mot de passe</label>
                    <Password v-model="registerForm.confirmPassword" placeholder="Confirmez le mot de passe" :feedback="false" toggleMask class="w-full" :class="{ 'p-invalid': errors.confirmPassword }" required />
                    <small v-if="errors.confirmPassword" class="text-red-500">{{ errors.confirmPassword }}</small>
                </div>

                <div class="flex items-start">
                    <Checkbox v-model="registerForm.acceptTerms" inputId="terms" :binary="true" class="mt-1" />
                    <label for="terms" class="ml-2 text-sm text-[#4B2E1E]">
                        J'accepte les <a href="#" class="text-[#47A547] underline">conditions d'utilisation</a> et la <a href="#" class="text-[#47A547] underline">politique de confidentialité</a>
                    </label>
                </div>
                <small v-if="errors.acceptTerms" class="text-red-500">{{ errors.acceptTerms }}</small>

                <Button type="submit" label="Créer mon compte" :loading="loading" class="w-full bg-[#47A547] hover:bg-[#3d8f3d] text-white p-3 mt-4" />
            </form>

            <!-- Social Login -->
            <div class="mt-6">
                <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300" />
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">Ou continuer avec</span>
                    </div>
                </div>

                <div class="mt-4 grid grid-cols-2 gap-3">
                    <Button label="Google" icon="pi pi-google" class="w-full border border-gray-300 text-gray-700 hover:bg-gray-50" text />
                    <Button label="Facebook" icon="pi pi-facebook" class="w-full border border-gray-300 text-gray-700 hover:bg-gray-50" text />
                </div>
            </div></div
    ></Dialog>
</template>
