<script setup>
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Message from 'primevue/message';
import Divider from 'primevue/divider';
import { useToast } from 'primevue/usetoast';
import authService from '@/service/AuthService';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['update:visible', 'auth-success']);

const toast = useToast();

// État du modal
const isVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const isLoginMode = ref(true);
const isLoading = ref(false);
const errorMessage = ref('');

// Données du formulaire de connexion
const loginForm = ref({
    identifier: '', // email ou téléphone
    password: ''
});

// Données du formulaire d'inscription
const registerForm = ref({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
});

// Validation des formulaires
const loginValidation = computed(() => {
    const errors = [];

    if (!loginForm.value.identifier.trim()) {
        errors.push('Veuillez saisir votre email ou téléphone');
    }

    if (!loginForm.value.password.trim()) {
        errors.push('Veuillez saisir votre mot de passe');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
});

const registerValidation = computed(() => {
    const errors = [];

    if (!registerForm.value.name.trim()) {
        errors.push('Veuillez saisir votre nom');
    }

    // Au moins un des deux : email ou téléphone
    if (!registerForm.value.email.trim() && !registerForm.value.phone.trim()) {
        errors.push('Veuillez saisir un email ou un numéro de téléphone');
    }

    // Validation email si fourni
    if (registerForm.value.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(registerForm.value.email)) {
            errors.push('Adresse email invalide');
        }
    }

    // Validation téléphone si fourni (format burkinabè)
    if (registerForm.value.phone.trim()) {
        const phoneRegex = /^0[0-9]{8,9}$/;
        if (!phoneRegex.test(registerForm.value.phone.replace(/\s+/g, ''))) {
            errors.push('Numéro de téléphone invalide (format: 0XX XX XX XX)');
        }
    }

    if (!registerForm.value.password.trim()) {
        errors.push('Veuillez saisir un mot de passe');
    } else if (registerForm.value.password.length < 6) {
        errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    if (registerForm.value.password !== registerForm.value.confirmPassword) {
        errors.push('Les mots de passe ne correspondent pas');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
});

// Méthodes
const toggleMode = () => {
    isLoginMode.value = !isLoginMode.value;
    resetForms();
    errorMessage.value = '';
};

const resetForms = () => {
    loginForm.value = {
        identifier: '',
        password: ''
    };

    registerForm.value = {
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    };
};

const handleLogin = async () => {
    if (!loginValidation.value.isValid) {
        errorMessage.value = loginValidation.value.errors[0];
        return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    try {
        const { user } = await authService.login(loginForm.value.identifier, loginForm.value.password);

        toast.add({
            severity: 'success',
            summary: 'Connexion réussie',
            detail: `Bienvenue ${user.name} !`,
            life: 3000
        });

        emit('auth-success', user);
        resetForms();
        isVisible.value = false;
    } catch (error) {
        console.error('Login error:', error);

        // Afficher l'erreur via toast au lieu de errorMessage
        toast.add({
            severity: 'error',
            summary: 'Erreur de connexion',
            detail: error.message || 'Identifiants incorrects',
            life: 5000
        });
    } finally {
        isLoading.value = false;
    }
};

const handleRegister = async () => {
    if (!registerValidation.value.isValid) {
        errorMessage.value = registerValidation.value.errors[0];
        return;
    }

    isLoading.value = true;
    errorMessage.value = '';

    try {
        const { user } = await authService.register(registerForm.value);

        toast.add({
            severity: 'success',
            summary: 'Compte créé',
            detail: 'Votre compte a été créé avec succès',
            life: 3000
        });

        emit('auth-success', user);
        resetForms();
        isVisible.value = false;
    } catch (error) {
        console.error('Register error:', error);

        // Afficher l'erreur via toast au lieu de errorMessage
        toast.add({
            severity: 'error',
            summary: 'Erreur d\'inscription',
            detail: error.message || 'Une erreur est survenue lors de la création du compte',
            life: 5000
        });
    } finally {
        isLoading.value = false;
    }
};

// Réinitialiser les formulaires quand le modal se ferme
watch(
    () => props.visible,
    (newValue) => {
        if (!newValue) {
            resetForms();
            errorMessage.value = '';
            isLoginMode.value = true;
        }
    }
);
</script>

<template>
    <Dialog v-model:visible="isVisible" modal :closable="true" :style="{ width: '480px' }" class="auth-modal" :header="null">
        <div class="p-6">
            <!-- En-tête -->
            <div class="text-center mb-6">
                <div class="flex justify-center mb-4">
                    <img src="/pic.jpg" alt="LeLagaLi" class="w-16 h-16 object-cover" />
                </div>
                <h2 class="text-2xl font-bold text-[#4B2E1E] mb-2">
                    {{ isLoginMode ? 'Connexion' : 'Créer un compte' }}
                </h2>
                <p class="text-gray-600">
                    {{ isLoginMode ? 'Connectez-vous pour commander vos plats préférés' : 'Rejoignez LeLagaLi et découvrez nos saveurs authentiques' }}
                </p>
            </div>

            <!-- Messages d'erreur -->
            <Message v-if="errorMessage" severity="error" :closable="false" class="mb-4">
                {{ errorMessage }}
            </Message>

            <!-- Formulaire de connexion -->
            <form v-if="isLoginMode" @submit.prevent="handleLogin" class="space-y-4">
                <div class="field">
                    <label for="identifier" class="block text-sm font-medium text-[#4B2E1E] mb-2"> Email ou numéro de téléphone </label>
                    <InputText id="identifier" v-model="loginForm.identifier" placeholder="exemple@email.com ou 070 00 00 01" class="w-full p-3" :class="{ 'p-invalid': !loginValidation.isValid && loginForm.identifier }" />
                </div>

                <div class="field">
                    <label for="loginPassword" class="block text-sm font-medium text-[#4B2E1E] mb-2"> Mot de passe </label>
                    <Password
                        id="loginPassword"
                        v-model="loginForm.password"
                        placeholder="Votre mot de passe"
                        class="w-full"
                        inputClass="w-full p-3"
                        :feedback="false"
                        toggleMask
                        :class="{ 'p-invalid': !loginValidation.isValid && loginForm.password }"
                    />
                </div>

                <Button type="submit" label="Se connecter" class="w-full p-3 bg-[#47A547] hover:bg-[#3d8b3d] text-white font-semibold" :loading="isLoading" :disabled="isLoading" />
            </form>

            <!-- Formulaire d'inscription -->
            <form v-else @submit.prevent="handleRegister" class="space-y-4">
                <div class="field">
                    <label for="name" class="block text-sm font-medium text-[#4B2E1E] mb-2"> Nom complet * </label>
                    <InputText id="name" v-model="registerForm.name" placeholder="Votre nom complet" class="w-full p-3" :class="{ 'p-invalid': !registerValidation.isValid && !registerForm.name }" />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="field">
                        <label for="phone" class="block text-sm font-medium text-[#4B2E1E] mb-2"> Numéro de téléphone </label>
                        <InputText id="phone" v-model="registerForm.phone" placeholder="070 00 00 01" class="w-full p-3" :class="{ 'p-invalid': !registerValidation.isValid && registerForm.phone }" />
                    </div>

                    <div class="field">
                        <label for="email" class="block text-sm font-medium text-[#4B2E1E] mb-2"> Adresse email </label>
                        <InputText id="email" v-model="registerForm.email" placeholder="exemple@email.com" type="email" class="w-full p-3" :class="{ 'p-invalid': !registerValidation.isValid && registerForm.email }" />
                    </div>
                </div>

                <p class="text-xs text-gray-500">* Au moins un numéro de téléphone ou une adresse email est requis</p>

                <div class="field">
                    <label for="password" class="block text-sm font-medium text-[#4B2E1E] mb-2"> Mot de passe * </label>
                    <Password
                        id="password"
                        v-model="registerForm.password"
                        placeholder="Minimum 6 caractères"
                        class="w-full"
                        inputClass="w-full p-3"
                        promptLabel="Entrez un mot de passe"
                        weakLabel="Faible"
                        mediumLabel="Moyen"
                        strongLabel="Fort"
                        toggleMask
                        :class="{ 'p-invalid': !registerValidation.isValid && registerForm.password }"
                    />
                </div>

                <div class="field">
                    <label for="confirmPassword" class="block text-sm font-medium text-[#4B2E1E] mb-2"> Confirmer le mot de passe * </label>
                    <Password
                        id="confirmPassword"
                        v-model="registerForm.confirmPassword"
                        placeholder="Confirmez votre mot de passe"
                        class="w-full"
                        inputClass="w-full p-3"
                        :feedback="false"
                        toggleMask
                        :class="{ 'p-invalid': !registerValidation.isValid && registerForm.confirmPassword }"
                    />
                </div>

                <Button type="submit" label="Créer mon compte" class="w-full p-3 bg-[#E6782C] hover:bg-[#d66a25] text-white font-semibold" :loading="isLoading" :disabled="isLoading" />
            </form>

            <!-- Séparateur et changement de mode -->
            <Divider class="my-6" />

            <div class="text-center">
                <p class="text-gray-600 mb-3">
                    {{ isLoginMode ? "Vous n'avez pas de compte ?" : 'Vous avez déjà un compte ?' }}
                </p>
                <Button :label="isLoginMode ? 'Créer un compte' : 'Se connecter'" text class="text-[#47A547] hover:text-[#3d8b3d] font-semibold" @click="toggleMode" :disabled="isLoading" />
            </div>

            <!-- Connexion rapide pour demo -->
            <div v-if="isLoginMode" class="mt-6 p-4 bg-gray-50 rounded-lg">
                <p class="text-xs text-gray-600 mb-2">Pour tester rapidement :</p>
                <p class="text-xs text-gray-500">
                    Email: <strong>test@example.com</strong><br />
                    Mot de passe: <strong>password</strong>
                </p>
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.auth-modal :deep(.p-dialog-header) {
    display: none;
}

.auth-modal :deep(.p-dialog-content) {
    padding: 0;
    border-radius: 12px;
}

.field {
    margin-bottom: 1rem;
}

.field label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #4b2e1e;
}

/* Styles pour les champs invalides */
:deep(.p-invalid) {
    border-color: #ef4444 !important;
}

/* Styles pour les boutons */
:deep(.p-button) {
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s;
}

:deep(.p-button:focus) {
    box-shadow: 0 0 0 2px rgba(71, 165, 71, 0.2);
}

/* Styles pour les champs de saisie */
:deep(.p-inputtext) {
    border-radius: 8px;
    border: 2px solid #e5e7eb;
    transition: border-color 0.2s;
}

:deep(.p-inputtext:focus) {
    border-color: #47a547;
    box-shadow: 0 0 0 2px rgba(71, 165, 71, 0.1);
}

/* Styles pour le composant Password */
:deep(.p-password) {
    display: block;
    width: 100%;
}

:deep(.p-password .p-inputtext) {
    width: 100%;
}

/* Animation de chargement */
:deep(.p-button-loading .p-button-icon) {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
