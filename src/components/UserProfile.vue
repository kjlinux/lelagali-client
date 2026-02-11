<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import Textarea from 'primevue/textarea';
import authService from '@/service/AuthService';

const toast = useToast();
const emit = defineEmits(['logout']);

// États
const loading = ref(false);
const editMode = ref(false);
const saving = ref(false);
const profileImage = ref(null);
const fileInput = ref(null);

// Formulaire
const formData = ref({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    profile_image: ''
});

// États pour la gestion du mot de passe
const passwordDialogVisible = ref(false);
const passwordForm = ref({
    current_password: '',
    new_password: '',
    confirm_new_password: ''
});
const passwordLoading = ref(false);
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Statistiques (à récupérer de l'API)
const stats = ref({
    totalOrders: 0,
    favoriteRestaurants: 0
});

// Données utilisateur
const user = computed(() => authService.getCurrentUser() || {});

// Computed
const userInitials = computed(() => {
    if (!formData.value.name) return 'U';
    return formData.value.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
});

// Validation du mot de passe
const isPasswordFormValid = computed(() => {
    return (
        passwordForm.value.current_password &&
        passwordForm.value.new_password &&
        passwordForm.value.new_password.length >= 6 &&
        passwordForm.value.confirm_new_password &&
        passwordForm.value.new_password === passwordForm.value.confirm_new_password
    );
});

// Méthodes
const formatDate = (dateString) => {
    if (!dateString) return 'Non défini';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long'
    });
};

const triggerFileInput = () => {
    fileInput.value.click();
};

const onImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            toast.add({
                severity: 'error',
                summary: 'Erreur',
                detail: "L'image ne doit pas dépasser 2MB",
                life: 3000
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            profileImage.value = e.target.result;
            formData.value.profile_image = e.target.result;
            toast.add({
                severity: 'success',
                summary: 'Succès',
                detail: 'Photo de profil mise à jour',
                life: 3000
            });
        };
        reader.readAsDataURL(file);
    }
};

// Charger le profil depuis l'API
const loadProfile = async () => {
    loading.value = true;
    try {
        const userData = await authService.getProfile();
        formData.value = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            profile_image: userData.profile_image
        };

        if (userData.profile_image) {
            profileImage.value = userData.profile_image;
        }
    } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Erreur lors du chargement du profil',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Sauvegarder le profil
const saveProfile = async () => {
    saving.value = true;

    try {
        await authService.updateProfile(formData.value.id, {
            username: formData.value.email,
            email: formData.value.email,
            name: formData.value.name
        });

        toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Profil mis à jour avec succès',
            life: 3000
        });

        editMode.value = false;
        await loadProfile(); // Recharger pour avoir les dernières données
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);

        const errorMessage = error.message || 'Erreur lors de la mise à jour du profil';
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: errorMessage,
            life: 3000
        });
    } finally {
        saving.value = false;
    }
};

const cancelEdit = () => {
    if (user.value) {
        formData.value = {
            id: user.value.id,
            name: user.value.name,
            email: user.value.email,
            phone: user.value.phone,
            address: user.value.address,
            profile_image: user.value.profile_image
        };
        profileImage.value = user.value.profile_image;
    }
    editMode.value = false;
};

// Gestion du mot de passe
const openPasswordDialog = () => {
    passwordForm.value = {
        current_password: '',
        new_password: '',
        confirm_new_password: ''
    };
    showCurrentPassword.value = false;
    showNewPassword.value = false;
    showConfirmPassword.value = false;
    passwordDialogVisible.value = true;
};

const closePasswordDialog = () => {
    passwordForm.value = {
        current_password: '',
        new_password: '',
        confirm_new_password: ''
    };
    passwordDialogVisible.value = false;
};

const changePassword = async () => {
    if (!isPasswordFormValid.value) {
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Veuillez remplir tous les champs correctement',
            life: 3000
        });
        return;
    }

    passwordLoading.value = true;

    try {
        await authService.updateProfile(formData.value.id, {
            username: formData.value.email,
            email: formData.value.email,
            name: formData.value.name,
            current_password: passwordForm.value.current_password,
            new_password: passwordForm.value.new_password,
            confirm_new_password: passwordForm.value.confirm_new_password
        });

        toast.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Mot de passe modifié avec succès',
            life: 3000
        });

        closePasswordDialog();
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);

        const errorMessage = error.message || 'Erreur lors du changement de mot de passe';
        toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: errorMessage,
            life: 3000
        });
    } finally {
        passwordLoading.value = false;
    }
};

// Déconnexion
const handleLogout = () => {
    emit('logout');
};

// Initialisation
onMounted(async () => {
    await loadProfile();
});
</script>

<template>
    <div class="animate-fade-in">
        <!-- En-tête -->
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900">Mon Profil</h1>
            <p class="text-gray-600 mt-2">Gérez vos informations personnelles</p>
        </div>

        <!-- Loading spinner -->
        <div v-if="loading" class="flex justify-center items-center h-64">
            <ProgressSpinner />
        </div>

        <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Colonne de gauche - Photo de profil -->
            <Card class="bg-white shadow-sm">
                <template #content>
                    <div class="text-center">
                        <!-- Photo de profil -->
                        <div class="relative inline-block mb-4">
                            <Avatar :image="profileImage || formData.profile_image" :label="userInitials" size="xlarge" class="!w-32 !h-32 text-4xl" />
                            <Button v-if="editMode" icon="pi pi-camera" class="p-button-rounded p-button-success absolute bottom-0 right-0 !w-8 !h-8" @click="triggerFileInput" />
                            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onImageSelect" />
                        </div>

                        <h2 class="text-xl font-bold">{{ formData.name || 'Nom non défini' }}</h2>
                        <p class="text-gray-600">{{ formData.email || 'Email non défini' }}</p>
                        <p class="text-sm text-gray-500 mt-2">Client</p>
                        <p class="text-sm text-gray-500">Membre depuis {{ formatDate(user.created_at) }}</p>

                        <!-- Statistiques -->
                        <Divider />
                        <div class="grid grid-cols-2 gap-4 mt-4">
                            <div class="p-3 bg-[#FDF6EC] rounded-lg">
                                <div class="text-2xl font-bold text-[#47A547]">{{ stats.totalOrders }}</div>
                                <div class="text-sm text-gray-600">Commandes</div>
                            </div>
                            <div class="p-3 bg-[#FDF6EC] rounded-lg">
                                <div class="text-2xl font-bold text-[#E6782C]">{{ stats.favoriteRestaurants }}</div>
                                <div class="text-sm text-gray-600">Favoris</div>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Colonne centrale - Informations -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Informations de base -->
                <Card class="bg-white shadow-sm">
                    <template #header>
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-semibold">Informations personnelles</h3>
                            <Button :label="editMode ? 'Annuler' : 'Modifier'" :icon="editMode ? 'pi pi-times' : 'pi pi-pencil'" class="p-button-text" @click="editMode ? cancelEdit() : (editMode = true)" />
                        </div>
                    </template>
                    <template #content>
                        <form @submit.prevent="saveProfile" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                                    <InputText v-model="formData.name" :disabled="!editMode" class="w-full" required />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                    <InputText v-model="formData.email" :disabled="!editMode" type="email" class="w-full" required />
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                                    <InputText v-model="formData.phone" :disabled="!editMode" class="w-full" required />
                                </div>
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                                    <Textarea v-model="formData.address" :disabled="!editMode" rows="2" class="w-full" />
                                </div>
                            </div>

                            <!-- Boutons d'action -->
                            <div v-if="editMode" class="flex gap-2 pt-4">
                                <Button label="Enregistrer" icon="pi pi-check" type="submit" :loading="saving" />
                                <Button label="Annuler" icon="pi pi-times" class="p-button-text" @click="cancelEdit" />
                            </div>
                        </form>
                    </template>
                </Card>

                <!-- Sécurité du compte -->
                <Card class="bg-white shadow-sm">
                    <template #header>
                        <h3 class="text-lg font-semibold">Sécurité du compte</h3>
                    </template>
                    <template #content>
                        <div class="space-y-4">
                            <div class="flex justify-between items-center">
                                <div>
                                    <label class="block font-medium">Mot de passe</label>
                                    <span class="text-sm text-gray-600">Protégez votre compte avec un mot de passe sécurisé</span>
                                </div>
                                <Button label="Changer" icon="pi pi-key" class="p-button-outlined" @click="openPasswordDialog" />
                            </div>
                            <Divider />
                            <div class="flex justify-between items-center">
                                <div>
                                    <label class="block font-medium">Déconnexion</label>
                                    <span class="text-sm text-gray-600">Se déconnecter de votre compte</span>
                                </div>
                                <Button label="Déconnexion" icon="pi pi-sign-out" severity="danger" class="p-button-outlined" @click="handleLogout" />
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>

        <!-- Dialog pour changer le mot de passe -->
        <Dialog v-model:visible="passwordDialogVisible" modal header="Changer le mot de passe" :style="{ width: '450px' }" class="p-fluid password-dialog" :closable="!passwordLoading" :dismissableMask="!passwordLoading">
            <form @submit.prevent="changePassword" class="space-y-4">
                <div class="w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel *</label>
                    <div class="p-inputgroup w-full flex">
                        <InputText v-model="passwordForm.current_password" :type="showCurrentPassword ? 'text' : 'password'" placeholder="Saisissez votre mot de passe actuel" required :disabled="passwordLoading" class="flex-1 w-full" />
                        <Button :icon="showCurrentPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="p-button-text flex-shrink-0" type="button" @click="showCurrentPassword = !showCurrentPassword" :disabled="passwordLoading" />
                    </div>
                </div>

                <div class="w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe *</label>
                    <div class="p-inputgroup w-full flex">
                        <InputText v-model="passwordForm.new_password" :type="showNewPassword ? 'text' : 'password'" placeholder="Minimum 6 caractères" required :disabled="passwordLoading" class="flex-1 w-full" />
                        <Button :icon="showNewPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="p-button-text flex-shrink-0" type="button" @click="showNewPassword = !showNewPassword" :disabled="passwordLoading" />
                    </div>
                    <small v-if="passwordForm.new_password && passwordForm.new_password.length < 6" class="text-red-500"> Le mot de passe doit contenir au moins 6 caractères </small>
                </div>

                <div class="w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe *</label>
                    <div class="p-inputgroup w-full flex">
                        <InputText v-model="passwordForm.confirm_new_password" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirmez votre nouveau mot de passe" required :disabled="passwordLoading" class="flex-1 w-full" />
                        <Button :icon="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="p-button-text flex-shrink-0" type="button" @click="showConfirmPassword = !showConfirmPassword" :disabled="passwordLoading" />
                    </div>
                    <small v-if="passwordForm.confirm_new_password && passwordForm.new_password !== passwordForm.confirm_new_password" class="text-red-500"> Les mots de passe ne correspondent pas </small>
                </div>

                <div class="flex justify-end gap-2 pt-4">
                    <Button label="Annuler" icon="pi pi-times" class="p-button-text" type="button" @click="closePasswordDialog" :disabled="passwordLoading" />
                    <Button label="Modifier" icon="pi pi-check" type="submit" :disabled="!isPasswordFormValid" :loading="passwordLoading" />
                </div>
            </form>
        </Dialog>
    </div>
</template>

<style scoped>
/* Styles responsives */
@media (max-width: 768px) {
    .grid.grid-cols-1.lg\:grid-cols-3 {
        grid-template-columns: 1fr;
    }

    :deep(.p-avatar) {
        width: 6rem !important;
        height: 6rem !important;
        font-size: 2rem !important;
    }
}

/* Animation pour le mode édition */
:deep(.p-inputtext:disabled) {
    background-color: #f9fafb;
    border-color: #e5e7eb;
    color: #6b7280;
}

.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Styles pour les groupes d'input avec boutons dans le dialog */
:deep(.password-dialog .p-dialog-content) {
    padding: 1.5rem;
}

:deep(.password-dialog .p-inputgroup) {
    display: flex !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

:deep(.password-dialog .p-inputgroup .p-inputtext) {
    flex: 1 !important;
    width: 100% !important;
    min-width: 0 !important;
    border-right: 0 !important;
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
}

:deep(.password-dialog .p-inputgroup .p-button) {
    flex-shrink: 0 !important;
    width: auto !important;
    min-width: 2.5rem !important;
    border-left: 0 !important;
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
}

:deep(.password-dialog .space-y-4 > div) {
    width: 100% !important;
}

.w-full {
    width: 100% !important;
}

.flex {
    display: flex !important;
}

.flex-1 {
    flex: 1 !important;
}

.flex-shrink-0 {
    flex-shrink: 0 !important;
}

:deep(.password-dialog .space-y-4 label) {
    width: 100% !important;
    display: block;
}

:deep(.password-dialog .space-y-4 small) {
    width: 100% !important;
    display: block;
    margin-top: 0.25rem;
}

@media (max-width: 480px) {
    :deep(.password-dialog) {
        width: 95vw !important;
        margin: 0 auto;
    }

    :deep(.password-dialog .p-dialog-content) {
        padding: 1rem;
    }
}

:deep(.p-password .p-password-input) {
    width: 100%;
}
</style>
