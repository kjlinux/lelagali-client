/**
 * Service pour la gestion des plats (menus)
 */

import api from './api';

class PlatService {
    /**
     * Récupérer tous les plats avec filtres
     * @param {Object} filters - Filtres de recherche
     * @returns {Promise<Array>}
     */
    async getPlats(filters = {}) {
        try {
            const queryParams = new URLSearchParams();

            // Filtres disponibles
            if (filters.quartier) queryParams.append('quartier', filters.quartier);
            if (filters.type) queryParams.append('type', filters.type);
            if (filters.restaurateur_id) queryParams.append('restaurateur_id', filters.restaurateur_id);
            if (filters.date_disponibilite) queryParams.append('date_disponibilite', filters.date_disponibilite);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.min_price) queryParams.append('min_price', filters.min_price);
            if (filters.max_price) queryParams.append('max_price', filters.max_price);
            if (filters.livraison !== undefined) queryParams.append('livraison', filters.livraison ? '1' : '0');

            // Pagination
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.per_page) queryParams.append('per_page', filters.per_page);

            const endpoint = `/app/plats${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            const response = await api.get(endpoint, { auth: false }); // Public

            if (response.success && response.data) {
                return {
                    data: response.data,
                    meta: response.meta || {}
                };
            }

            throw new Error('Erreur lors de la récupération des plats');
        } catch (error) {
            console.error('Get plats error:', error);
            throw error;
        }
    }

    /**
     * Récupérer les menus du jour
     * @returns {Promise<Array>}
     */
    async getTodayMenus() {
        try {
            const response = await api.get('/app/plats/today', { auth: false });

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Erreur lors de la récupération des menus du jour');
        } catch (error) {
            console.error('Get today menus error:', error);
            throw error;
        }
    }

    /**
     * Récupérer un plat par son ID
     * @param {string} platId - ID du plat
     * @returns {Promise<Object>}
     */
    async getPlatById(platId) {
        try {
            const response = await api.get(`/app/plats/${platId}`, { auth: false });

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Plat non trouvé');
        } catch (error) {
            console.error('Get plat by ID error:', error);
            throw error;
        }
    }

    /**
     * Récupérer les plats d'un restaurateur
     * @param {string} restaurateurId - ID du restaurateur
     * @returns {Promise<Array>}
     */
    async getPlatsByRestaurateur(restaurateurId) {
        try {
            const response = await api.get(`/app/plats/restaurateur/${restaurateurId}`, { auth: false });

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Erreur lors de la récupération des plats du restaurateur');
        } catch (error) {
            console.error('Get plats by restaurateur error:', error);
            throw error;
        }
    }

    /**
     * Créer un nouveau plat (restaurateur)
     * @param {Object} platData - Données du plat
     * @param {File} image - Image du plat
     * @returns {Promise<Object>}
     */
    async createPlat(platData, image = null) {
        try {
            let response;

            if (image) {
                // Upload avec FormData si une image est fournie
                response = await api.uploadFile('/app/plats', image, 'image', platData);
            } else {
                response = await api.post('/app/plats', platData);
            }

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.message || 'Erreur lors de la création du plat');
        } catch (error) {
            console.error('Create plat error:', error);
            throw error;
        }
    }

    /**
     * Mettre à jour un plat (restaurateur)
     * @param {string} platId - ID du plat
     * @param {Object} platData - Nouvelles données du plat
     * @param {File} image - Nouvelle image (optionnel)
     * @returns {Promise<Object>}
     */
    async updatePlat(platId, platData, image = null) {
        try {
            let response;

            if (image) {
                // Si une nouvelle image est fournie, utiliser FormData
                const formData = new FormData();
                formData.append('image', image);
                Object.keys(platData).forEach((key) => {
                    formData.append(key, platData[key]);
                });
                formData.append('_method', 'PUT');

                response = await api.post(`/app/plats/${platId}`, formData);
            } else {
                response = await api.put(`/app/plats/${platId}`, platData);
            }

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error(response.message || 'Erreur lors de la mise à jour du plat');
        } catch (error) {
            console.error('Update plat error:', error);
            throw error;
        }
    }

    /**
     * Supprimer un plat (restaurateur)
     * @param {string} platId - ID du plat
     * @returns {Promise<void>}
     */
    async deletePlat(platId) {
        try {
            const response = await api.delete(`/app/plats/${platId}`);

            if (!response.success) {
                throw new Error(response.message || 'Erreur lors de la suppression du plat');
            }
        } catch (error) {
            console.error('Delete plat error:', error);
            throw error;
        }
    }

    /**
     * Récupérer les statistiques des plats (restaurateur)
     * @param {string} restaurateurId - ID du restaurateur
     * @returns {Promise<Object>}
     */
    async getStats(restaurateurId) {
        try {
            const response = await api.get(`/app/plats/stats?restaurateur_id=${restaurateurId}`);

            if (response.success && response.data) {
                return response.data;
            }

            throw new Error('Erreur lors de la récupération des statistiques');
        } catch (error) {
            console.error('Get stats error:', error);
            throw error;
        }
    }
}

// Instance singleton
const platService = new PlatService();

export default platService;
