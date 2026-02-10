/**
 * Service d'authentification
 * Gère la connexion, l'inscription, la déconnexion et la gestion du profil
 */

import api from './api';

class AuthService {
    /**
     * Connexion
     * @param {string} identifier - Email ou numéro de téléphone
     * @param {string} password - Mot de passe
     * @returns {Promise<{user: Object, token: string}>}
     */
    async login(identifier, password) {
        try {
            // Le backend accepte email OU phone
            const payload = {
                password
            };

            // Déterminer si c'est un email ou un téléphone
            if (identifier.includes('@')) {
                payload.email = identifier;
            } else {
                payload.phone = identifier.replace(/\s+/g, ''); // Retirer les espaces
            }

            const response = await api.post('/auth/login', payload, { auth: false });

            if (response.status === 'success' && response.data) {
                const { token, user } = response.data;

                // Sauvegarder le token et l'utilisateur
                api.setToken(token);
                api.setUser(user);

                return { user, token };
            }

            throw new Error(response.message || 'Erreur de connexion');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Inscription
     * @param {Object} userData - Données de l'utilisateur
     * @returns {Promise<{user: Object, token: string}>}
     */
    async register(userData) {
        try {
            const payload = {
                name: userData.name,
                password: userData.password,
                role: 'client' // Par défaut, les inscriptions frontend sont des clients
            };

            // Ajouter email ou téléphone (au moins un requis)
            if (userData.email) {
                payload.email = userData.email;
            }
            if (userData.phone) {
                payload.phone = userData.phone.replace(/\s+/g, '');
            }

            const response = await api.post('/auth/users', payload, { auth: false });

            if (response.status === 'success' && response.data) {
                // Après l'inscription, se connecter automatiquement
                const loginIdentifier = userData.email || userData.phone;
                return await this.login(loginIdentifier, userData.password);
            }

            throw new Error(response.message || 'Erreur lors de la création du compte');
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    }

    /**
     * Déconnexion
     */
    async logout() {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Nettoyer le localStorage même si la requête échoue
            api.setToken(null);
            api.setUser(null);
        }
    }

    /**
     * Rafraîchir le token
     */
    async refreshToken() {
        try {
            const response = await api.post('/auth/refresh');

            if (response.status === 'success' && response.data) {
                const { token, user } = response.data;
                api.setToken(token);
                api.setUser(user);
                return { user, token };
            }

            throw new Error('Impossible de rafraîchir le token');
        } catch (error) {
            console.error('Refresh token error:', error);
            // Si le refresh échoue, déconnecter l'utilisateur
            this.logout();
            throw error;
        }
    }

    /**
     * Récupérer le profil de l'utilisateur connecté
     */
    async getProfile() {
        try {
            const response = await api.get('/auth/profile');

            if (response.status === 'success' && response.data) {
                api.setUser(response.data);
                return response.data;
            }

            throw new Error('Impossible de récupérer le profil');
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour le profil
     * @param {string} userId - ID de l'utilisateur
     * @param {Object} profileData - Nouvelles données du profil
     */
    async updateProfile(userId, profileData) {
        try {
            const response = await api.put(`/auth/users/${userId}/profile`, profileData);

            if (response.status === 'success' && response.data) {
                api.setUser(response.data);
                return response.data;
            }

            throw new Error(response.message || 'Erreur lors de la mise à jour du profil');
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    /**
     * Réinitialiser le mot de passe
     * @param {string} userId - ID de l'utilisateur
     * @param {string} currentPassword - Mot de passe actuel
     * @param {string} newPassword - Nouveau mot de passe
     */
    async resetPassword(userId, currentPassword, newPassword) {
        try {
            const response = await api.put(`/auth/users/${userId}/reset-password`, {
                current_password: currentPassword,
                password: newPassword
            });

            if (response.status === 'success') {
                return response.data;
            }

            throw new Error(response.message || 'Erreur lors de la réinitialisation du mot de passe');
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    /**
     * Vérifier si l'utilisateur est connecté
     */
    isAuthenticated() {
        return api.isAuthenticated();
    }

    /**
     * Récupérer l'utilisateur actuel
     */
    getCurrentUser() {
        return api.getUser();
    }
}

// Instance singleton
const authService = new AuthService();

export default authService;
